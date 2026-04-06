#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { ArticlesStack } from '../lib/articles-stack';
import { ApiDomainStack } from '../lib/api-domain-stack';
import { StagingSiteStack } from '../lib/staging-site-stack';
import { StagingProductsStack } from '../lib/staging-products-stack';
import { StagingArticlesStack } from '../lib/staging-articles-stack';
import { StagingApiDomainStack } from '../lib/staging-api-domain-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '249608714856',
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// --- Production stacks ---

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

// --- Staging stacks ---

new StagingSiteStack(app, 'VitalguideStagingSiteStack', {
  env,
  description: 'VitalGuide Staging site — S3 + CloudFront + ACM + Route53 for staging.vitalguide.life',
});

const stagingProductsStack = new StagingProductsStack(app, 'VitalguideStagingProductsStack', {
  env,
  description: 'VitalGuide Staging Products API — DynamoDB + Lambda + API Gateway',
});

const stagingArticlesStack = new StagingArticlesStack(app, 'VitalguideStagingArticlesStack', {
  env,
  description: 'VitalGuide Staging Articles API — DynamoDB + Lambda + API Gateway',
});

new StagingApiDomainStack(app, 'VitalguideStagingApiDomainStack', {
  env,
  description: 'VitalGuide api.staging.vitalguide.life — ACM cert, custom domain, Route53',
  productsApi: stagingProductsStack.api,
  articlesApi: stagingArticlesStack.api,
});
