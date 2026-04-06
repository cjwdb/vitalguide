import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';

const DOMAIN_NAME = 'api.staging.vitalguide.life';
const HOSTED_ZONE_ID = 'Z079432616DX8S61HR9MS';
const HOSTED_ZONE_NAME = 'vitalguide.life';

export interface StagingApiDomainStackProps extends cdk.StackProps {
  productsApi: apigw.RestApi;
  articlesApi: apigw.RestApi;
}

export class StagingApiDomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StagingApiDomainStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'VitalguideZone', {
      hostedZoneId: HOSTED_ZONE_ID,
      zoneName: HOSTED_ZONE_NAME,
    });

    const certificate = new acm.Certificate(this, 'StagingApiCertificate', {
      domainName: DOMAIN_NAME,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const customDomain = new apigw.DomainName(this, 'StagingApiCustomDomain', {
      domainName: DOMAIN_NAME,
      certificate,
      endpointType: apigw.EndpointType.REGIONAL,
      securityPolicy: apigw.SecurityPolicy.TLS_1_2,
    });

    new apigw.BasePathMapping(this, 'StagingProductsBasePathMapping', {
      domainName: customDomain,
      restApi: props.productsApi,
      basePath: 'products',
      stage: props.productsApi.deploymentStage,
    });

    new apigw.BasePathMapping(this, 'StagingArticlesBasePathMapping', {
      domainName: customDomain,
      restApi: props.articlesApi,
      basePath: 'articles',
      stage: props.articlesApi.deploymentStage,
    });

    new route53.ARecord(this, 'StagingApiAliasRecord', {
      zone: hostedZone,
      recordName: 'api.staging',
      target: route53.RecordTarget.fromAlias(
        new route53targets.ApiGatewayDomain(customDomain),
      ),
    });

    new cdk.CfnOutput(this, 'StagingApiCustomDomainName', {
      value: DOMAIN_NAME,
      description: 'Staging API custom domain name',
    });
    new cdk.CfnOutput(this, 'StagingProductsUrl', {
      value: `https://${DOMAIN_NAME}/products`,
      description: 'Staging Products API URL',
    });
    new cdk.CfnOutput(this, 'StagingArticlesUrl', {
      value: `https://${DOMAIN_NAME}/articles`,
      description: 'Staging Articles API URL',
    });
  }
}
