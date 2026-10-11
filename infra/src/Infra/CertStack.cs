using Amazon.CDK;
using Amazon.CDK.AWS.CertificateManager;
using Amazon.CDK.AWS.Route53;
using Constructs;

namespace Infra;

// Deployed once by hand in us-east-1 (CloudFront certificates must live there).
sealed class CertStack : Stack
{
    public CertStack(Construct scope, string id, Settings settings, IStackProps props) : base(scope, id, props)
    {
        // Attributes, not a lookup, so synth needs no AWS credentials.
        var zone = HostedZone.FromHostedZoneAttributes(this, "Zone", new HostedZoneAttributes
        {
            HostedZoneId = settings.HostedZoneId,
            ZoneName = Settings.Domain,
        });

        var certificate = new Certificate(this, "Certificate", new CertificateProps
        {
            DomainName = Settings.Domain,
            SubjectAlternativeNames = [$"www.{Settings.Domain}"],
            Validation = CertificateValidation.FromDns(zone),
        });

        new CfnOutput(this, "CertificateArn", new CfnOutputProps { Value = certificate.CertificateArn });
    }
}
