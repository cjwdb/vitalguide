import { DynamoDBClient, DeleteItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { checkBasicAuth, unauthorizedResponse } from './auth';

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

  await client.send(new DeleteItemCommand({
    TableName: TABLE_NAME,
    Key: { id: { S: id } },
  }));

  return {
    statusCode: 204,
    body: '',
  };
};
