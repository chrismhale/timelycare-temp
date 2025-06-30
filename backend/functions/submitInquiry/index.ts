import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';
import { getCorsHeaders } from '../cors';

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'Inquiries';

/**
 * Submit a buyer inquiry.
 * @param {APIGatewayProxyEvent} event - Inquiry data.
 * @returns {APIGatewayProxyResult} Save result.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  const CORS_HEADERS = getCorsHeaders(event.headers?.origin || event.headers?.Origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '', isBase64Encoded: false };
  }

  try {
    const { name, email, message, propertyId } = JSON.parse(event.body || '{}');
    const inquiry = {
      id: uuidv4(),
      name,
      email,
      message,
      propertyId,
      createdAt: new Date().toISOString(),
    };
    await dynamo.put({ TableName: TABLE_NAME, Item: inquiry }).promise();
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true }),
      isBase64Encoded: false,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to save inquiry' }),
      isBase64Encoded: false,
    };
  }
};