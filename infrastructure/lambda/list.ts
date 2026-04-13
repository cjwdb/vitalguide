import { DynamoDBClient, ScanCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { checkBasicAuth, unauthorizedResponse } from './auth';
import { Product } from './types';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const handler = async (event: any) => {
  if (!checkBasicAuth(event.headers || {})) {
    return unauthorizedResponse();
  }

  const qs = event.queryStringParameters || {};
  const limit = Math.min(parseInt(qs.limit || String(DEFAULT_PAGE_SIZE), 10), MAX_PAGE_SIZE);
  const nextToken = qs.nextToken ? JSON.parse(Buffer.from(qs.nextToken, 'base64').toString('utf-8')) : undefined;
  const category = qs.category as string | undefined;
  const articleId = qs.article_id as string | undefined;

  let filterExpression: string | undefined;
  let expressionAttributeValues: Record<string, any> | undefined;

  if (category) {
    filterExpression = 'contains(categories, :category)';
    expressionAttributeValues = marshall({ ':category': category });
  } else if (articleId) {
    filterExpression = 'contains(article_ids, :articleId)';
    expressionAttributeValues = marshall({ ':articleId': articleId });
  }

  const result = await client.send(new ScanCommand({
    TableName: TABLE_NAME,
    Limit: limit,
    ExclusiveStartKey: nextToken,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  }));

  const items: Product[] = (result.Items || []).map(item => unmarshall(item) as Product);
  const newNextToken = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
    : null;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items,
      count: items.length,
      nextToken: newNextToken,
    }),
  };
};
