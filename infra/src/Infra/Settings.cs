namespace Infra;

// Values that would reveal the AWS account or a personal address live in 1Password and arrive as env vars
// (infra/.env.example locally, load-secrets-action in CI). Nothing here is committed.
sealed record Settings(string AccountId, string HostedZoneId, string AlertEmail, string CertificateArn)
{
    public const string Domain = "bahri.cc";
    public const string Region = "eu-west-2";
    public const string GitHubRepo = "HaitemBahri/bahri-cc";
    public const string DeployRoleName = "bahri-cc-deploy";

    public static Settings FromEnvironment() => new(
        Required("AWS_ACCOUNT_ID"),
        Required("HOSTED_ZONE_ID"),
        Required("ALERT_EMAIL"),
        Required("CERTIFICATE_ARN"));

    static string Required(string name) =>
        Optional(name) ?? throw new InvalidOperationException($"Missing env var {name}; see infra/.env.example");

    static string? Optional(string name) =>
        Environment.GetEnvironmentVariable(name) is { Length: > 0 } value ? value : null;
}
