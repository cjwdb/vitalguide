import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class InfrastructureStack extends cdk.Stack {
  public readonly api: apigw.RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, 'VitalguideProducts', {
      tableName: 'vitalguide_products',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Basic auth credentials: "username:password" base64 decoded
    // Set BASIC_AUTH_CREDENTIALS env var before deploying, or override in CDK context
    const basicAuthCredentials =
      this.node.tryGetContext('basicAuthCredentials') ||
      process.env.BASIC_AUTH_CREDENTIALS ||
      'admin:changeme';

    const commonEnv = {
      TABLE_NAME: table.tableName,
      BASIC_AUTH_CREDENTIALS: basicAuthCredentials,
    };

    const RUNTIME = lambda.Runtime.NODEJS_22_X;
    const ARCH = lambda.Architecture.ARM_64;
    const TIMEOUT = cdk.Duration.seconds(10);
    const MEMORY = 256;

    function makeCode(entryFile: string): lambda.AssetCode {
      return lambda.Code.fromAsset(path.join(__dirname, '../lambda'), {
        bundling: {
          image: lambda.Runtime.NODEJS_22_X.bundlingImage,
          command: [
            'bash', '-c',
            `npx esbuild ${entryFile} --bundle --platform=node --target=node22 --outfile=/asset-output/${entryFile.replace('.ts', '.js')}`,
          ],
          local: {
            tryBundle(outputDir: string): boolean {
              const { execSync } = require('child_process');
              try {
                execSync(
                  `cd ${path.join(__dirname, '../lambda')} && npx --yes esbuild ${entryFile} --bundle --platform=node --target=node22 --outfile=${outputDir}/${entryFile.replace('.ts', '.js')}`,
                  { stdio: 'inherit' },
                );
                return true;
              } catch {
                return false;
              }
            },
          },
        },
      });
    }

    const makeFn = (id: string, name: string, entry: string) =>
      new lambda.Function(this, id, {
        functionName: name,
        handler: `${entry.replace('.ts', '')}.handler`,
        code: makeCode(entry),
        runtime: RUNTIME,
        architecture: ARCH,
        timeout: TIMEOUT,
        memorySize: MEMORY,
        environment: commonEnv,
      });

    const postFn = makeFn('PostProduct', 'vitalguide-products-post', 'post.ts');
    const getFn = makeFn('GetProduct', 'vitalguide-products-get', 'get.ts');
    const updateFn = makeFn('UpdateProduct', 'vitalguide-products-update', 'update.ts');
    const patchFn = makeFn('PatchProduct', 'vitalguide-products-patch', 'patch.ts');
    const deleteFn = makeFn('DeleteProduct', 'vitalguide-products-delete', 'delete.ts');
    const listFn = makeFn('ListProducts', 'vitalguide-products-list', 'list.ts');

    // Grant DynamoDB permissions to all Lambda functions
    [postFn, getFn, updateFn, patchFn, deleteFn, listFn].forEach(fn =>
      table.grantReadWriteData(fn),
    );

    // API Gateway REST API
    this.api = new apigw.RestApi(this, 'VitalguideProductsApi', {
      restApiName: 'vitalguide-products-api',
      description: 'VitalGuide Products API',
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // / (root) — list and create
    this.api.root.addMethod('GET', new apigw.LambdaIntegration(listFn));
    this.api.root.addMethod('POST', new apigw.LambdaIntegration(postFn));

    // /{id} — get, update, patch, delete
    const byId = this.api.root.addResource('{id}');
    byId.addMethod('GET', new apigw.LambdaIntegration(getFn));
    byId.addMethod('PUT', new apigw.LambdaIntegration(updateFn));
    byId.addMethod('PATCH', new apigw.LambdaIntegration(patchFn));
    byId.addMethod('DELETE', new apigw.LambdaIntegration(deleteFn));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway base URL',
    });
    new cdk.CfnOutput(this, 'ProductsEndpoint', {
      value: `${this.api.url}`,
      description: 'Products API base URL',
    });
    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'DynamoDB table name',
    });
  }
}
