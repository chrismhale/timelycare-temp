import { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";
import AWS from "aws-sdk";
import { getCorsHeaders } from '../cors';

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || "Properties";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const CORS_HEADERS = getCorsHeaders(event.headers?.origin || event.headers?.Origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '', isBase64Encoded: false };
  }
  try {
    // Support stage prefixes like /prod/properties/{id}
    const match = event.path?.match(/\/properties\/(.+)$/);
    if (match) {
      const id = match[1];
      const getRes = await dynamo.get({ TableName: TABLE_NAME, Key: { id } }).promise();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(getRes.Item ?? null),
        isBase64Encoded: false
      };
    }

    // Otherwise, return all properties
    const scanRes = await dynamo.scan({ TableName: TABLE_NAME }).promise();
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(scanRes.Items),
      isBase64Encoded: false
    };
  } catch {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to fetch properties" }),
      isBase64Encoded: false
    };
  }
};