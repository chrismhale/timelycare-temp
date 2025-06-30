import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { getCorsHeaders } from '../cors';

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'Inquiries';

export const handler: APIGatewayProxyHandler = async (event) => {
  const CORS_HEADERS = getCorsHeaders(event.headers?.origin || event.headers?.Origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '', isBase64Encoded: false };
  }
  try {
    const result = await dynamo.scan({ TableName: TABLE_NAME }).promise();
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result.Items),
      isBase64Encoded: false,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to fetch inquiries' }),
      isBase64Encoded: false,
    };
  }
}; 