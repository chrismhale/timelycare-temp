import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// TODO: Move this to environment variables
const TABLE_NAME = process.env.DYNAMODB_INQUIRIES_TABLE_NAME || 'Inquiries';

export async function GET() {
    if (!TABLE_NAME) {
        throw new Error("DynamoDB inquiries table name is not set.");
    }
    
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
        });
        
        const response = await docClient.send(command);
        
        return NextResponse.json({ inquiries: response.Items });
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
    }
}

export async function POST(request: Request) {
  if (!TABLE_NAME) {
    throw new Error("DynamoDB inquiries table name is not set.");
  }

  try {
    const body = await request.json();
    const { name, email, message, propertyId } = body;

    if (!name || !email || !message || !propertyId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inquiry = {
      id: uuidv4(),
      name,
      email,
      message,
      propertyId,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: inquiry,
    });

    await docClient.send(command);

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error("Error saving inquiry:", error);
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
  }
} 