import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";
import { getCorsHeaders } from '../cors';

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || "Properties";

/**
 * Delete a property listing by ID.
 * @param {APIGatewayProxyEvent} event - Request with path param `id`.
 * @returns {APIGatewayProxyResult} Deletion result.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  const CORS_HEADERS = getCorsHeaders(event.headers?.origin || event.headers?.Origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const id = event.pathParameters?.id;

  if (!id) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing id" }) };
  }

  try {
    await dynamo.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Property deleted' }) };
  } catch {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to delete property' }),
    };
  }
};