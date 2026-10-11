namespace Infra;

// Values that would reveal the AWS account or a personal address live in 1Password and arrive as env vars
// (infra/.env.example locally, load-secrets-action in CI). Nothing here is committed.
sealed record Settings(string AccountId, string HostedZoneId, string AlertEmail, string CertificateArn, string PreviewToken, bool Prelaunch)
{
    public const string Domain = "bahri.cc";
    public const string Region = "eu-west-2";
    // GitHub's immutable OIDC subject (repo setting use_immutable_subject): owner and repo with their numeric IDs.
    public const string GitHubSubject = "repo:HaitemBahri@31721768/bahri-cc@1409143487";
    public const string DeployRoleName = "bahri-cc-deploy";

    public static Settings FromEnvironment() => new(
        Required("AWS_ACCOUNT_ID"),
        Required("HOSTED_ZONE_ID"),
        Required("ALERT_EMAIL"),
        Required("CERTIFICATE_ARN"),
        Required("PREVIEW_TOKEN"),
        // Pre-launch unless explicitly "false", like robots.txt, so a misconfigured deploy never opens the site.
        Optional("PUBLIC_PRELAUNCH") != "false");

    static string Required(string name) =>
        Optional(name) ?? throw new InvalidOperationException($"Missing env var {name}; see infra/.env.example");

    static string? Optional(string name) =>
        Environment.GetEnvironmentVariable(name) is { Length: > 0 } value ? value : null;
}
