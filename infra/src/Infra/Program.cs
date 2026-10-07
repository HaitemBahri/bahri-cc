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

app.Synth();
