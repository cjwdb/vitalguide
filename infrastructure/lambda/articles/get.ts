import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
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

  const result = await client.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: { id: { S: id } },
  }));

  if (!result.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unmarshall(result.Item)),
  };
};
