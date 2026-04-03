#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
new InfrastructureStack(app, 'VitalguideProductsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '249608714856',
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'VitalGuide Products API — DynamoDB + Lambda + API Gateway',
});
