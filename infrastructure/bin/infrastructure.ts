#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { ArticlesStack } from '../lib/articles-stack';
import { ApiDomainStack } from '../lib/api-domain-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '249608714856',
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const productsStack = new InfrastructureStack(app, 'VitalguideProductsStack', {
  env,
  description: 'VitalGuide Products API — DynamoDB + Lambda + API Gateway',
});

const articlesStack = new ArticlesStack(app, 'VitalguideArticlesStack', {
  env,
  description: 'VitalGuide Articles API — DynamoDB + Lambda + API Gateway',
});

new ApiDomainStack(app, 'VitalguideApiDomainStack', {
  env,
  description: 'VitalGuide api.vitalguide.life — ACM cert, custom domain, Route53',
  productsApi: productsStack.api,
  articlesApi: articlesStack.api,
});
