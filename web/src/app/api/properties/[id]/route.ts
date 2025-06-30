import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from 'next/server';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!TABLE_NAME) {
    throw new Error("DynamoDB table name is not set.");
  }
  
  const id = params.id;

  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(response.Item);
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error);
    return NextResponse.json({ error: `Failed to fetch property ${id}` }, { status: 500 });
  }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!TABLE_NAME) throw new Error("DynamoDB table name is not set.");
    const id = params.id;
    try {
        const data = await request.json();
        // A more robust implementation would validate the incoming data
        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set #title = :t, #price = :p, #streetAddress1 = :sa1, #streetAddress2 = :sa2, #city = :c, #state = :s, #zipcode = :z, #bedrooms = :bed, #bathrooms = :bath, #description = :d, #status = :st",
            ExpressionAttributeNames: {
                "#title": "title", "#price": "price", "#streetAddress1": "streetAddress1", "#streetAddress2": "streetAddress2", "#city": "city", "#state": "state", "#zipcode": "zipcode", "#bedrooms": "bedrooms", "#bathrooms": "bathrooms", "#description": "description", "#status": "status"
            },
            ExpressionAttributeValues: {
                ":t": data.title, ":p": data.price, ":sa1": data.streetAddress1, ":sa2": data.streetAddress2, ":c": data.city, ":s": data.state, ":z": data.zipcode, ":bed": data.bedrooms, ":bath": data.bathrooms, ":d": data.description, ":st": data.status
            },
            ReturnValues: "ALL_NEW",
        });
        const response = await docClient.send(command);
        return NextResponse.json(response.Attributes);
    } catch (error) {
        console.error(`Error updating property ${id}:`, error);
        return NextResponse.json({ error: `Failed to update property ${id}` }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!TABLE_NAME) throw new Error("DynamoDB table name is not set.");
    const id = params.id;
    try {
        const command = new DeleteCommand({ TableName: TABLE_NAME, Key: { id } });
        await docClient.send(command);
        return NextResponse.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error(`Error deleting property ${id}:`, error);
        return NextResponse.json({ error: `Failed to delete property ${id}` }, { status: 500 });
    }
} 