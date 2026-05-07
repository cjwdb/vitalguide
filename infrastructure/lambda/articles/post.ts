import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { checkBasicAuth, unauthorizedResponse } from './auth';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  if (!checkBasicAuth(event.headers || {})) {
    return unauthorizedResponse();
  }

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const title = body.title || '';
  const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (!slug) {
    return { statusCode: 400, body: JSON.stringify({ error: 'title or slug is required' }) };
  }

  const id = randomUUID();
  const item = {
    id,
    slug,
    title,
    sub_title: body.sub_title || '',
    summary: body.summary || '',
    body: body.body || '',
    image_url: body.image_url || '',
    categories: body.categories || [],
    date: body.date || '',
    time_to_read_in_minutes: body.time_to_read_in_minutes ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
