import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";
import { getCorsHeaders } from '../cors';

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || "Properties";

/**
 * Update an existing property listing.
 * @param {APIGatewayProxyEvent} event - Request with property update info.
 * @returns {APIGatewayProxyResult} Update result.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  const CORS_HEADERS = getCorsHeaders(event.headers?.origin || event.headers?.Origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const id = event.pathParameters?.id;
  const data = JSON.parse(event.body || '{}');

  if (!id) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing id" })
    };
  }

  if (!Object.keys(data).length) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "No update data" })
    };
  }

  const updateParams = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: "set #title = :t, #price = :p, #sa1 = :sa1, #sa2 = :sa2, #city = :city, #state = :state, #zip = :zip, #beds = :b, #baths = :ba, #desc = :d, #stat = :s",
    ExpressionAttributeNames: {
      "#title": "title",
      "#price": "price",
      "#sa1": "streetAddress1",
      "#sa2": "streetAddress2",
      "#city": "city",
      "#state": "state",
      "#zip": "zipcode",
      "#beds": "bedrooms",
      "#baths": "bathrooms",
      "#desc": "description",
      "#stat": "status",
    },
    ExpressionAttributeValues: {
      ":t": data.title,
      ":p": data.price,
      ":sa1": data.streetAddress1,
      ":sa2": data.streetAddress2,
      ":city": data.city,
      ":state": data.state,
      ":zip": data.zipcode,
      ":b": data.bedrooms,
      ":ba": data.bathrooms,
      ":d": data.description,
      ":s": data.status,
    },
    ReturnValues: "ALL_NEW",
  } as const;

  try {
    const result = await dynamo.update(updateParams).promise();
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result.Attributes),
    };
  } catch (err) {
    console.error('Update property error', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to update property" }),
    };
  }
};