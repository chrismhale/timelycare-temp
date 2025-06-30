import { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";
import AWS from "aws-sdk";
import { getCorsHeaders } from '../cors';

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || "Properties";

/**
 * List properties belonging to a mock agent.
 * @returns {APIGatewayProxyResult} Properties owned by the agent.
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const CORS_HEADERS = getCorsHeaders(event.headers?.origin || event.headers?.Origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '', isBase64Encoded: false };
  }

  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }), isBase64Encoded: false };
  }
  const token = authHeader.split(' ')[1];

  try {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "agentToken = :token",
      ExpressionAttributeValues: {
        ":token": token,
      },
    };
    const result = await dynamo.scan(params).promise();
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result.Items),
      isBase64Encoded: false
    };
  } catch (err) {
    console.error('Agent properties Lambda error', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to fetch agent properties" }),
      isBase64Encoded: false
    };
  }
};