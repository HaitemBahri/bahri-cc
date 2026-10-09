using Amazon.CDK;
using Amazon.CDK.AWS.CloudWatch;
using Amazon.CDK.AWS.CloudWatch.Actions;
using Amazon.CDK.AWS.SNS;
using Amazon.CDK.AWS.SNS.Subscriptions;
using Constructs;

namespace Infra;

// CloudFront publishes metrics only in us-east-1, and alarms only see metrics in their own region,
// so the web alarm lives here. Deployed after WebStack with `-c distributionId=<WebStack output>`.
sealed class WebAlarmStack : Stack
{
    public WebAlarmStack(Construct scope, string id, Settings settings, string distributionId, IStackProps props) : base(scope, id, props)
    {
        var topic = new Topic(this, "Alerts", new TopicProps { TopicName = "bahri-cc-web-alerts" });
        topic.AddSubscription(new EmailSubscription(settings.AlertEmail));

        var errorRate = new Metric(new MetricProps
        {
            Namespace = "AWS/CloudFront",
            MetricName = "5xxErrorRate",
            DimensionsMap = new Dictionary<string, string> { ["DistributionId"] = distributionId, ["Region"] = "Global" },
            Statistic = "Average",
            Period = Duration.Minutes(5),
        });

        var alarm = new Alarm(this, "ErrorRateAlarm", new AlarmProps
        {
            AlarmDescription = "bahri.cc CloudFront 5xx error rate above 5% over 5 minutes",
            Metric = errorRate,
            Threshold = 5,
            ComparisonOperator = ComparisonOperator.GREATER_THAN_THRESHOLD,
            EvaluationPeriods = 1,
            TreatMissingData = TreatMissingData.NOT_BREACHING,
        });
        alarm.AddAlarmAction(new SnsAction(topic));
    }
}
