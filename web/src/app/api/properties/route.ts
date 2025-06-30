import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export async function GET() {
  if (!TABLE_NAME) {
    throw new Error("DynamoDB table name is not set.");
  }
    
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);

    return NextResponse.json(response.Items);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(request: Request) {
    if (!TABLE_NAME) throw new Error("DynamoDB table name is not set.");

    try {
        const data = await request.json();
        const newProperty = {
            id: uuidv4(),
            ...data,
            createdAt: new Date().toISOString(),
        };

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: newProperty,
        });

        await docClient.send(command);
        return NextResponse.json(newProperty, { status: 201 });
    } catch (error) {
        console.error("Error creating property:", error);
        return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
    }
} 