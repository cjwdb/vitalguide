import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { checkBasicAuth, unauthorizedResponse } from './auth';
import { Article, ArticleInput } from './types';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

const ALLOWED_FIELDS: (keyof ArticleInput)[] = [
  'slug', 'title', 'sub_title', 'summary', 'body', 'image_url',
  'categories', 'date', 'time_to_read_in_minutes',
];

export const handler = async (event: any) => {
  if (!checkBasicAuth(event.headers || {})) {
    return unauthorizedResponse();
  }

  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };
  }

  const existing = await client.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: { id: { S: id } },
  }));

  if (!existing.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  }

  let body: Partial<ArticleInput>;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const fields = (Object.keys(body) as (keyof ArticleInput)[]).filter(k => ALLOWED_FIELDS.includes(k));
  if (fields.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No valid fields to update' }) };
  }

  const expressionParts: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  for (const field of fields) {
    expressionParts.push(`#${field} = :${field}`);
    expressionAttributeNames[`#${field}`] = field;
    expressionAttributeValues[`:${field}`] = body[field];
  }

  expressionParts.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const result = await client.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: { id: { S: id } },
    UpdateExpression: `SET ${expressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ReturnValues: 'ALL_NEW',
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unmarshall(result.Attributes!) as Article),
  };
};
