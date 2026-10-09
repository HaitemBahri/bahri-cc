using Amazon.CDK;
using Amazon.CDK.AWS.CertificateManager;
using Amazon.CDK.AWS.CloudFront;
using Amazon.CDK.AWS.CloudFront.Origins;
using Amazon.CDK.AWS.IAM;
using Amazon.CDK.AWS.Route53;
using Amazon.CDK.AWS.Route53.Targets;
using Amazon.CDK.AWS.S3;
using Amazon.CDK.AWS.SSM;
using Constructs;

namespace Infra;

// Static site hosting. Owns all CloudFront config, including the /api/* behaviours added in BUILD-1400.
// Deployed by release-web.yml with `cdk deploy WebStack --exclusively`.
sealed class WebStack : Stack
{
    public WebStack(Construct scope, string id, Settings settings, string cspScriptHashes, IStackProps props) : base(scope, id, props)
    {
        var bucket = new Bucket(this, "SiteBucket", new BucketProps
        {
            BlockPublicAccess = BlockPublicAccess.BLOCK_ALL,
            EnforceSSL = true,
            Encryption = BucketEncryption.S3_MANAGED,
            RemovalPolicy = RemovalPolicy.RETAIN,
        });

        var csp = string.Join("; ",
            "default-src 'self'",
            $"script-src 'self' https://challenges.cloudflare.com {cspScriptHashes}".TrimEnd(),
            "frame-src https://challenges.cloudflare.com",
            "connect-src 'self'",
            "img-src 'self' data:",
            "style-src 'self' 'unsafe-inline'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'");

        var headers = new ResponseHeadersPolicy(this, "SecurityHeaders", new ResponseHeadersPolicyProps
        {
            SecurityHeadersBehavior = new ResponseSecurityHeadersBehavior
            {
                StrictTransportSecurity = new ResponseHeadersStrictTransportSecurity
                {
                    AccessControlMaxAge = Duration.Days(365),
                    IncludeSubdomains = true,
                    Override = true,
                },
                ContentTypeOptions = new ResponseHeadersContentTypeOptions { Override = true },
                ReferrerPolicy = new ResponseHeadersReferrerPolicy
                {
                    ReferrerPolicy = HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
                    Override = true,
                },
                FrameOptions = new ResponseHeadersFrameOptions { FrameOption = HeadersFrameOption.DENY, Override = true },
                ContentSecurityPolicy = new ResponseHeadersContentSecurityPolicy { ContentSecurityPolicy = csp, Override = true },
            },
        });

        var distribution = new Distribution(this, "Distribution", new DistributionProps
        {
            DefaultBehavior = new BehaviorOptions
            {
                Origin = S3BucketOrigin.WithOriginAccessControl(bucket),
                ViewerProtocolPolicy = ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                AllowedMethods = AllowedMethods.ALLOW_GET_HEAD,
                // Follows the Cache-Control headers set by the release upload.
                CachePolicy = CachePolicy.CACHING_OPTIMIZED,
                ResponseHeadersPolicy = headers,
                Compress = true,
            },
            DomainNames = [Settings.Domain, $"www.{Settings.Domain}"],
            Certificate = Certificate.FromCertificateArn(this, "Certificate", settings.CertificateArn),
            MinimumProtocolVersion = SecurityPolicyProtocol.TLS_V1_2_2021,
            HttpVersion = HttpVersion.HTTP2_AND_3,
            PriceClass = PriceClass.PRICE_CLASS_100,
            // Off: the privacy notice relies on it. No custom error responses: they would also hit /api/*.
            EnableLogging = false,
        });

        // Without ListBucket, S3 answers 403 for missing objects; with it, 404.
        bucket.AddToResourcePolicy(new PolicyStatement(new PolicyStatementProps
        {
            Actions = ["s3:ListBucket"],
            Resources = [bucket.BucketArn],
            Principals = [new ServicePrincipal("cloudfront.amazonaws.com")],
            Conditions = new Dictionary<string, object>
            {
                ["StringEquals"] = new Dictionary<string, object> { ["AWS:SourceArn"] = distribution.DistributionArn },
            },
        }));

        var zone = HostedZone.FromHostedZoneAttributes(this, "Zone", new HostedZoneAttributes
        {
            HostedZoneId = settings.HostedZoneId,
            ZoneName = Settings.Domain,
        });
        var target = RecordTarget.FromAlias(new CloudFrontTarget(distribution));
        foreach (var (name, recordName) in new[] { ("Apex", (string?)null), ("Www", "www") })
        {
            new ARecord(this, $"{name}A", new ARecordProps { Zone = zone, RecordName = recordName, Target = target });
            new AaaaRecord(this, $"{name}Aaaa", new AaaaRecordProps { Zone = zone, RecordName = recordName, Target = target });
        }

        // The release workflow uploads with `aws s3 sync --delete` and invalidates the cache.
        var deployRole = Role.FromRoleName(this, "DeployRole", Settings.DeployRoleName);
        bucket.GrantReadWrite(deployRole);
        distribution.GrantCreateInvalidation(deployRole);

        // Read by ApiStack for the Lambda OAC permission (no cross-stack exports).
        new StringParameter(this, "DistributionArnParameter", new StringParameterProps
        {
            ParameterName = "/bahri-cc/web/distribution-arn",
            StringValue = distribution.DistributionArn,
        });

        new CfnOutput(this, "BucketName", new CfnOutputProps { Value = bucket.BucketName });
        new CfnOutput(this, "DistributionId", new CfnOutputProps { Value = distribution.DistributionId });
    }
}
