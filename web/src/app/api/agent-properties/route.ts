import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export async function GET() {
  // During local builds or preview deployments the table may not exist.
  // Instead of throwing (which breaks `next build`), return an empty list so
  // pages can still be generated.
  if (!TABLE_NAME) {
    console.warn("[agent-properties] DYNAMODB_TABLE_NAME not set – returning empty list.");
    return NextResponse.json({ properties: [] });
  }
    
  // TODO: Add authentication and filter properties by agent ID
  // For now, we return all properties.
    
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);

    return NextResponse.json({ properties: response.Items });
  } catch (error) {
    // If the table is missing in the target account (eg. local build), just
    // return an empty list so the caller can handle it gracefully.
    if ((error as any)?.name === "ResourceNotFoundException") {
      return NextResponse.json({ properties: [] });
    }

    console.error("Error fetching agent properties:", error);
    return NextResponse.json({ error: "Failed to fetch agent properties" }, { status: 500 });
  }
} 