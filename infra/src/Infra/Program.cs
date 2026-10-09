using Amazon.CDK;
using Infra;

var settings = Settings.FromEnvironment();
var app = new App();

new BootstrapStack(app, "BootstrapStack", settings, new StackProps
{
    Env = new Amazon.CDK.Environment { Account = settings.AccountId, Region = Settings.Region },
});

new CertStack(app, "CertStack", settings, new StackProps
{
    Env = new Amazon.CDK.Environment { Account = settings.AccountId, Region = "us-east-1" },
});

// From apps/web/scripts/csp-hashes.mjs at release; empty for local synth.
var cspScriptHashes = app.Node.TryGetContext("cspScriptHashes") as string ?? "";
new WebStack(app, "WebStack", settings, cspScriptHashes, new StackProps
{
    Env = new Amazon.CDK.Environment { Account = settings.AccountId, Region = Settings.Region },
});

// Only defined once WebStack's DistributionId output is known, so it can't be deployed with a placeholder.
if (app.Node.TryGetContext("distributionId") is string { Length: > 0 } distributionId)
{
    new WebAlarmStack(app, "WebAlarmStack", settings, distributionId, new StackProps
    {
        Env = new Amazon.CDK.Environment { Account = settings.AccountId, Region = "us-east-1" },
    });
}

app.Synth();
