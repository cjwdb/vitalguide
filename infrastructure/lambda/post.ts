import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { checkBasicAuth, unauthorizedResponse } from './auth';
import { Product, ProductInput } from './types';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  if (!checkBasicAuth(event.headers || {})) {
    return unauthorizedResponse();
  }

  let body: Partial<ProductInput>;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const now = new Date().toISOString();
  const item: Product = {
    id: randomUUID(),
    name: body.name || '',
    description: body.description || '',
    affiliate_link: body.affiliate_link || '',
    image_url: body.image_url || '',
    categories: body.categories || [],
    article_ids: body.article_ids || [],
    rating: body.rating ?? 0,
    reviews: body.reviews ?? 0,
    best_rating: body.best_rating ?? 5,
    worst_rating: body.worst_rating ?? 1,
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
