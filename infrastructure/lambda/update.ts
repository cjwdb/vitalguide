import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { checkBasicAuth, unauthorizedResponse } from './auth';
import { Product, ProductInput } from './types';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

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

  let body: Partial<ProductInput>;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const existing_product = unmarshall(existing.Item) as Product;
  const updated: Product = {
    ...existing_product,
    name: body.name ?? '',
    description: body.description ?? '',
    affiliate_link: body.affiliate_link ?? '',
    image_url: body.image_url ?? '',
    categories: body.categories ?? [],
    article_ids: body.article_ids ?? [],
    rating: body.rating ?? 0,
    reviews: body.reviews ?? 0,
    best_rating: body.best_rating ?? 5,
    worst_rating: body.worst_rating ?? 1,
    updatedAt: new Date().toISOString(),
  };

  await client.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(updated),
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  };
};
