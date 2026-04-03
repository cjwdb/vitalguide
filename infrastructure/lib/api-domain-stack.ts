import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';

const DOMAIN_NAME = 'api.vitalguide.life';
const HOSTED_ZONE_ID = 'Z079432616DX8S61HR9MS';
const HOSTED_ZONE_NAME = 'vitalguide.life';

export interface ApiDomainStackProps extends cdk.StackProps {
  productsApi: apigw.RestApi;
  articlesApi: apigw.RestApi;
}

export class ApiDomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiDomainStackProps) {
    super(scope, id, props);

    // Look up the existing Route53 hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'VitalguideZone', {
      hostedZoneId: HOSTED_ZONE_ID,
      zoneName: HOSTED_ZONE_NAME,
    });

    // ACM certificate for api.vitalguide.life with DNS validation
    const certificate = new acm.Certificate(this, 'ApiCertificate', {
      domainName: DOMAIN_NAME,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // API Gateway custom domain (REGIONAL endpoint type)
    const customDomain = new apigw.DomainName(this, 'ApiCustomDomain', {
      domainName: DOMAIN_NAME,
      certificate,
      endpointType: apigw.EndpointType.REGIONAL,
      securityPolicy: apigw.SecurityPolicy.TLS_1_2,
    });

    // Base path mappings: /products → products API, /articles → articles API
    new apigw.BasePathMapping(this, 'ProductsBasePathMapping', {
      domainName: customDomain,
      restApi: props.productsApi,
      basePath: 'products',
      stage: props.productsApi.deploymentStage,
    });

    new apigw.BasePathMapping(this, 'ArticlesBasePathMapping', {
      domainName: customDomain,
      restApi: props.articlesApi,
      basePath: 'articles',
      stage: props.articlesApi.deploymentStage,
    });

    // Route53 A record (alias) pointing api.vitalguide.life to the custom domain
    new route53.ARecord(this, 'ApiAliasRecord', {
      zone: hostedZone,
      recordName: 'api',
      target: route53.RecordTarget.fromAlias(
        new route53targets.ApiGatewayDomain(customDomain),
      ),
    });

    // Outputs
    new cdk.CfnOutput(this, 'CustomDomainName', {
      value: DOMAIN_NAME,
      description: 'Custom domain name for the API',
    });
    new cdk.CfnOutput(this, 'ProductsUrl', {
      value: `https://${DOMAIN_NAME}/products`,
      description: 'Products API URL',
    });
    new cdk.CfnOutput(this, 'ArticlesUrl', {
      value: `https://${DOMAIN_NAME}/articles`,
      description: 'Articles API URL',
    });
  }
}
