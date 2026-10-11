using Amazon.CDK;
using Amazon.CDK.AWS.Budgets;
using Amazon.CDK.AWS.IAM;
using Constructs;

namespace Infra;

// Deployed once by hand (docs/runbooks/aws-setup.md): GitHub deploy role and cost budget.
sealed class BootstrapStack : Stack
{
    public BootstrapStack(Construct scope, string id, Settings settings, IStackProps props) : base(scope, id, props)
    {
        // The account's GitHub OIDC provider already exists (shared with other repos), so it is imported.
        var provider = OpenIdConnectProvider.FromOpenIdConnectProviderArn(this, "GitHubOidc",
            $"arn:aws:iam::{Account}:oidc-provider/token.actions.githubusercontent.com");

        var role = new Role(this, "DeployRole", new RoleProps
        {
            RoleName = Settings.DeployRoleName,
            AssumedBy = new WebIdentityPrincipal(provider.OpenIdConnectProviderArn, new Dictionary<string, object>
            {
                ["StringEquals"] = new Dictionary<string, object>
                {
                    ["token.actions.githubusercontent.com:aud"] = "sts.amazonaws.com",
                },
                ["StringLike"] = new Dictionary<string, object>
                {
                    ["token.actions.githubusercontent.com:sub"] = new[]
                    {
                        $"{Settings.GitHubSubject}:ref:refs/tags/web/v*",
                        $"{Settings.GitHubSubject}:ref:refs/tags/api/v*",
                    },
                },
            }),
            MaxSessionDuration = Duration.Hours(1),
        });

        role.AddToPolicy(new PolicyStatement(new PolicyStatementProps
        {
            Actions = ["sts:AssumeRole"],
            Resources = [$"arn:aws:iam::{Account}:role/cdk-hnb659fds-*"],
        }));

        // The API release copies the Turnstile secret from 1Password into SSM.
        role.AddToPolicy(new PolicyStatement(new PolicyStatementProps
        {
            Actions = ["ssm:PutParameter"],
            Resources = [$"arn:aws:ssm:{Region}:{Account}:parameter/bahri-cc/api/config/*"],
        }));
        role.AddToPolicy(new PolicyStatement(new PolicyStatementProps
        {
            Actions = ["kms:Encrypt"],
            // IAM matches the key ARN, not the alias, so scope by alias condition.
            Resources = [$"arn:aws:kms:{Region}:{Account}:key/*"],
            Conditions = new Dictionary<string, object>
            {
                ["StringEquals"] = new Dictionary<string, object> { ["kms:ViaService"] = $"ssm.{Region}.amazonaws.com" },
                ["ForAnyValue:StringEquals"] = new Dictionary<string, object> { ["kms:ResourceAliases"] = "alias/aws/ssm" },
            },
        }));

        new CfnBudget(this, "MonthlyBudget", new CfnBudgetProps
        {
            Budget = new CfnBudget.BudgetDataProperty
            {
                BudgetName = "bahri-cc-monthly",
                BudgetType = "COST",
                TimeUnit = "MONTHLY",
                BudgetLimit = new CfnBudget.SpendProperty { Amount = 10, Unit = "USD" },
            },
            NotificationsWithSubscribers = new object[]
            {
                Notification("ACTUAL", 80, settings.AlertEmail),
                Notification("FORECASTED", 100, settings.AlertEmail),
            },
        });

        new CfnOutput(this, "DeployRoleArn", new CfnOutputProps { Value = role.RoleArn });
    }

    static CfnBudget.NotificationWithSubscribersProperty Notification(string type, double threshold, string email) => new()
    {
        Notification = new CfnBudget.NotificationProperty
        {
            NotificationType = type,
            ComparisonOperator = "GREATER_THAN",
            Threshold = threshold,
            ThresholdType = "PERCENTAGE",
        },
        Subscribers = new object[] { new CfnBudget.SubscriberProperty { SubscriptionType = "EMAIL", Address = email } },
    };
}
