import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import { getCorsHeaders } from '../cors';

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || "Properties";

/**
 * Create a new property listing.
 * @param {APIGatewayProxyEvent} event - Incoming request with property data.
 * @returns {APIGatewayProxyResult} Response indicating success or failure.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  const CORS_HEADERS = getCorsHeaders(event.headers?.origin || event.headers?.Origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.title || !body.price) {
      throw new Error('Invalid input');
    }

    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const token = authHeader.split(' ')[1];

    const newItem = {
      id: uuidv4(),
      title: body.title,
      price: body.price,
      streetAddress1: body.streetAddress1,
      streetAddress2: body.streetAddress2,
      city: body.city,
      state: body.state,
      zipcode: body.zipcode,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      description: body.description,
      status: body.status,
      agentToken: token,
    };
    await dynamo.put({ TableName: TABLE_NAME, Item: newItem }).promise();

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify(newItem),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to create property" }),
    };
  }
};