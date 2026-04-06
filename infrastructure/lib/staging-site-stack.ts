import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';

const STAGING_DOMAIN = 'staging.vitalguide.life';
const HOSTED_ZONE_ID = 'Z079432616DX8S61HR9MS';
const HOSTED_ZONE_NAME = 'vitalguide.life';

export class StagingSiteStack extends cdk.Stack {
  public readonly bucketName: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for staging static site
    const bucket = new s3.Bucket(this, 'StagingBucket', {
      bucketName: 'vitalguide-staging',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: false,
    });
    this.bucketName = bucket.bucketName;

    // Route53 hosted zone (existing)
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'VitalguideZone', {
      hostedZoneId: HOSTED_ZONE_ID,
      zoneName: HOSTED_ZONE_NAME,
    });

    // ACM certificate for staging.vitalguide.life — must be in us-east-1 for CloudFront
    const certificate = new acm.Certificate(this, 'StagingCertificate', {
      domainName: STAGING_DOMAIN,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // CloudFront function for URL rewriting (mirrors production vitalguide-url-rewrite)
    const urlRewriteFn = new cloudfront.Function(this, 'StagingUrlRewrite', {
      functionName: 'vitalguide-staging-url-rewrite',
      code: cloudfront.FunctionCode.fromInline(`
var KEEP_HTML = [
    '/about.html',
    '/privacy-policy.html',
    '/affiliate-disclosure.html',
    '/how-we-review.html',
    '/contact.html'
];

var DIRECTORY_PATHS = [
    '/articles'
];

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (uri === '/') {
        request.uri = '/index.html';
        return request;
    }

    if (uri.endsWith('/')) {
        request.uri = uri + 'index.html';
        return request;
    }

    if (DIRECTORY_PATHS.indexOf(uri) !== -1) {
        request.uri = uri + '/index.html';
        return request;
    }

    if (uri.endsWith('.html') && KEEP_HTML.indexOf(uri) === -1) {
        var extensionless = uri.slice(0, -5);
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                location: { value: extensionless }
            }
        };
    }

    if (!uri.includes('.')) {
        request.uri = uri + '.html';
    }

    return request;
}
      `),
    });

    // Origin Access Control for secure S3 access
    const oac = new cloudfront.S3OriginAccessControl(this, 'StagingOAC', {
      originAccessControlName: 'vitalguide-staging-oac',
    });

    // CloudFront distribution for staging.vitalguide.life
    const distribution = new cloudfront.Distribution(this, 'StagingDistribution', {
      comment: 'VitalGuide Staging — staging.vitalguide.life',
      domainNames: [STAGING_DOMAIN],
      certificate,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          {
            function: urlRewriteFn,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Route53 A record for staging.vitalguide.life
    new route53.ARecord(this, 'StagingAliasRecord', {
      zone: hostedZone,
      recordName: 'staging',
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution),
      ),
    });

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'Staging S3 bucket name',
    });
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'Staging CloudFront distribution ID',
    });
    new cdk.CfnOutput(this, 'StagingUrl', {
      value: `https://${STAGING_DOMAIN}`,
      description: 'Staging site URL',
    });
  }
}
