import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class StagingProductsStack extends cdk.Stack {
  public readonly api: apigw.RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'StagingVitalguideProducts', {
      tableName: 'vitalguide_staging_products',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

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

    const postFn = makeFn('PostStagingProduct', 'vitalguide-staging-products-post', 'post.ts');
    const getFn = makeFn('GetStagingProduct', 'vitalguide-staging-products-get', 'get.ts');
    const updateFn = makeFn('UpdateStagingProduct', 'vitalguide-staging-products-update', 'update.ts');
    const patchFn = makeFn('PatchStagingProduct', 'vitalguide-staging-products-patch', 'patch.ts');
    const deleteFn = makeFn('DeleteStagingProduct', 'vitalguide-staging-products-delete', 'delete.ts');
    const listFn = makeFn('ListStagingProducts', 'vitalguide-staging-products-list', 'list.ts');

    [postFn, getFn, updateFn, patchFn, deleteFn, listFn].forEach(fn =>
      table.grantReadWriteData(fn),
    );

    this.api = new apigw.RestApi(this, 'StagingVitalguideProductsApi', {
      restApiName: 'vitalguide-staging-products-api',
      description: 'VitalGuide Staging Products API',
      deployOptions: { stageName: 'staging' },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    this.api.root.addMethod('GET', new apigw.LambdaIntegration(listFn));
    this.api.root.addMethod('POST', new apigw.LambdaIntegration(postFn));

    const byId = this.api.root.addResource('{id}');
    byId.addMethod('GET', new apigw.LambdaIntegration(getFn));
    byId.addMethod('PUT', new apigw.LambdaIntegration(updateFn));
    byId.addMethod('PATCH', new apigw.LambdaIntegration(patchFn));
    byId.addMethod('DELETE', new apigw.LambdaIntegration(deleteFn));

    new cdk.CfnOutput(this, 'StagingProductsApiUrl', {
      value: this.api.url,
      description: 'Staging Products API URL',
    });
  }
}
