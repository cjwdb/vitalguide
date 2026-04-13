import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { checkBasicAuth, unauthorizedResponse } from './auth';
import { Article, ArticleInput } from './types';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  if (!checkBasicAuth(event.headers || {})) {
    return unauthorizedResponse();
  }

  let body: Partial<ArticleInput>;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const now = new Date().toISOString();
  const item: Article = {
    id: randomUUID(),
    slug: body.slug || '',
    title: body.title || '',
    sub_title: body.sub_title || '',
    summary: body.summary || '',
    body: body.body || '',
    image_url: body.image_url || '',
    categories: body.categories || [],
    date: body.date || '',
    time_to_read_in_minutes: body.time_to_read_in_minutes ?? 0,
    createdAt: now,
    updatedAt: now,
  };

  await client.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(item),
  }));

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  };
};
