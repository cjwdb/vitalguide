import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

/**
 * GSC Analytics Stack
 *
 * Deploys a weekly scheduled Lambda that pulls Search Analytics data from
 * Google Search Console and writes JSON + Markdown reports to S3.
 *
 * Prerequisites:
 *   1. GSC site verified for https://vitalguide.life (or sc-domain:vitalguide.life)
 *   2. A GCP service account with Search Console API read access
 *   3. Service account credentials JSON stored in the secret below
 *
 * After deploying, populate the secret:
 *   aws secretsmanager put-secret-value \
 *     --secret-id vitalguide/gsc-service-account \
 *     --secret-string "$(cat path/to/credentials.json)"
 */
export class GscAnalyticsStack extends cdk.Stack {
  public readonly reportsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for GSC reports
    this.reportsBucket = new s3.Bucket(this, 'GscReportsBucket', {
      bucketName: `vitalguide-gsc-reports-${this.account}`,
      versioned: false,
      lifecycleRules: [
        {
          // Keep dated reports for 1 year; latest/ folder kept indefinitely
          prefix: 'gsc-reports/20',
          expiration: cdk.Duration.days(365),
        },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Secrets Manager secret for GSC service account credentials JSON
    // The secret is created empty — populate it after deploy (see stack README)
    const gscSecret = new secretsmanager.Secret(this, 'GscServiceAccountSecret', {
      secretName: 'vitalguide/gsc-service-account',
      description: 'GCP service account credentials JSON for GSC Search Analytics API',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Lambda layer with Google API client libraries
    // We bundle dependencies via Docker during CDK synth/deploy
    const gscLayer = new lambda.LayerVersion(this, 'GscDepsLayer', {
      layerVersionName: 'vitalguide-gsc-deps',
      description: 'google-auth, google-api-python-client for GSC Lambda',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/gsc-analytics'), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_12.bundlingImage,
          command: [
            'bash', '-c',
            'pip install -r requirements.txt -t /asset-output/python --no-cache-dir',
          ],
          local: {
            tryBundle(outputDir: string): boolean {
              const { execSync } = require('child_process');
              try {
                execSync(
                  `pip install -r ${path.join(__dirname, '../lambda/gsc-analytics/requirements.txt')} -t ${outputDir}/python --no-cache-dir`,
                  { stdio: 'inherit' },
                );
                return true;
              } catch {
                return false;
              }
            },
          },
        },
      }),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
    });

    // Lambda function
    const gscFn = new lambda.Function(this, 'GscAnalyticsFunction', {
      functionName: 'vitalguide-gsc-analytics',
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/gsc-analytics'), {
        exclude: ['requirements.txt'],
      }),
      layers: [gscLayer],
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: {
        S3_BUCKET: this.reportsBucket.bucketName,
        SECRET_ARN: gscSecret.secretArn,
        SITE_URL: 'sc-domain:vitalguide.life',
        DAYS: '90',
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Grant permissions
    this.reportsBucket.grantReadWrite(gscFn);
    gscSecret.grantRead(gscFn);

    // Weekly EventBridge rule — every Monday at 06:00 UTC
    const weeklyRule = new events.Rule(this, 'GscWeeklyRule', {
      ruleName: 'vitalguide-gsc-weekly',
      description: 'Triggers GSC analytics Lambda every Monday at 06:00 UTC',
      schedule: events.Schedule.cron({ minute: '0', hour: '6', weekDay: 'MON' }),
    });
    weeklyRule.addTarget(new targets.LambdaFunction(gscFn, {
      retryAttempts: 2,
    }));

    // Outputs
    new cdk.CfnOutput(this, 'ReportsBucketName', {
      value: this.reportsBucket.bucketName,
      description: 'S3 bucket for GSC reports',
    });
    new cdk.CfnOutput(this, 'GscSecretArn', {
      value: gscSecret.secretArn,
      description: 'Secrets Manager ARN — populate with GCP service account JSON after deploy',
    });
    new cdk.CfnOutput(this, 'GscFunctionArn', {
      value: gscFn.functionArn,
      description: 'GSC Analytics Lambda ARN',
    });
    new cdk.CfnOutput(this, 'LatestReportPath', {
      value: `s3://${this.reportsBucket.bucketName}/gsc-reports/latest/report.md`,
      description: 'Always-current latest GSC report (overwritten each run)',
    });
  }
}
