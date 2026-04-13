import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { checkBasicAuth, unauthorizedResponse } from './auth';
import { Article, ArticleInput } from './types';

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

  let body: Partial<ArticleInput>;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const existing_article = unmarshall(existing.Item) as Article;
  const updated: Article = {
    ...existing_article,
    slug: body.slug ?? existing_article.slug ?? '',
    title: body.title ?? '',
    sub_title: body.sub_title ?? '',
    summary: body.summary ?? '',
    body: body.body ?? '',
    image_url: body.image_url ?? '',
    categories: body.categories ?? [],
    date: body.date ?? '',
    time_to_read_in_minutes: body.time_to_read_in_minutes ?? 0,
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
