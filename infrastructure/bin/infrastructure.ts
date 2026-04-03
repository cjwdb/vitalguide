#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { ArticlesStack } from '../lib/articles-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '249608714856',
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

new InfrastructureStack(app, 'VitalguideProductsStack', {
  env,
  description: 'VitalGuide Products API — DynamoDB + Lambda + API Gateway',
});

new ArticlesStack(app, 'VitalguideArticlesStack', {
  env,
  description: 'VitalGuide Articles API — DynamoDB + Lambda + API Gateway',
});
