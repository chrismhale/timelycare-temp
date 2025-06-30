const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const docClient = new AWS.DynamoDB.DocumentClient();

const listings = [
  {
    id: '3e2f47b3-fae1-4a5f-8b6c-18649dbb96c6',
    title: 'Modern Family Home',
    price: 550000,
    address: '123 Main St, Anytown',
    streetAddress1: '123 Main St',
    streetAddress2: '',
    city: 'Anytown',
    state: 'CA',
    zipcode: '90210',
    bedrooms: 4,
    bathrooms: 2,
    description: 'Spacious home with modern updates.',
    status: 'active',
    agentToken: 'agent-token-123',
  },
  {
    id: '17f6c18c-6b6a-4422-b003-0b8c3145dbff',
    title: 'Downtown Condo',
    price: 350000,
    address: '456 Market St, Downtown',
    streetAddress1: '456 Market St',
    streetAddress2: 'Unit 12A',
    city: 'Downtown',
    state: 'NY',
    zipcode: '10001',
    bedrooms: 2,
    bathrooms: 1,
    description: 'Convenient condo in the city center.',
    status: 'pending',
    agentToken: 'agent-token-123',
  },
  {
    id: '2fa29e20-cc7e-49ef-b2e7-cf9f5057f7a5',
    title: 'Cozy Cottage',
    price: 250000,
    address: '789 Forest Rd, Suburbia',
    streetAddress1: '789 Forest Rd',
    streetAddress2: '',
    city: 'Suburbia',
    state: 'OR',
    zipcode: '97035',
    bedrooms: 3,
    bathrooms: 2,
    description: 'Charming cottage in the suburbs.',
    status: 'sold',
    agentToken: 'agent-token-123',
  },
  {
    id: '85780a08-87c3-4392-9cc2-d26c88d372c1',
    title: 'Luxury Apartment',
    price: 750000,
    address: '101 Ocean Ave, Beachfront',
    streetAddress1: '101 Ocean Ave',
    streetAddress2: 'Penthouse',
    city: 'Beachfront',
    state: 'FL',
    zipcode: '33139',
    bedrooms: 3,
    bathrooms: 2,
    description: 'Stunning beachfront apartment with ocean views.',
    status: 'active',
    agentToken: 'agent-token-123',
  },
  {
    id: '481ea1c3-46a6-4807-9ee3-6db1ab50b9c5',
    title: 'Rustic Cabin',
    price: 300000,
    address: '123 Forest Rd, Wilderness',
    streetAddress1: '123 Forest Rd',
    streetAddress2: '',
    city: 'Wilderness',
    state: 'CO',
    zipcode: '80435',
    bedrooms: 2,
    bathrooms: 1,
    description: 'Charming cabin in the wilderness.',
    status: 'active',
    agentToken: 'agent-token-123',
  },
  {
    id: 'd2b33a57-0d1c-4661-8029-1872061594f0',
    title: 'Modern Apartment',
    price: 450000,
    address: '456 Market St, Downtown',
    streetAddress1: '456 Market St',
    streetAddress2: 'Unit 8B',
    city: 'Downtown',
    state: 'NY',
    zipcode: '10001',
    bedrooms: 2,
    bathrooms: 1,
    description: 'Modern apartment in the city center.',
    status: 'active',
    agentToken: 'agent-token-123',
  },
  {
    id: '7fa1a0e3-f5e3-4c50-8900-760ba9d2261c',
    title: 'Modern Apartment',
    price: 450000,
    address: '456 Market St, Downtown',
    streetAddress1: '456 Market St',
    streetAddress2: 'Unit 8C',
    city: 'Downtown',
    state: 'NY',
    zipcode: '10001',
    bedrooms: 2,
    bathrooms: 1,
    description: 'Modern apartment in the city center.',
    status: 'active',
    agentToken: 'agent-token-123',
  },
];

const inquiries = [
  {
    id: 'ec9a6f25-36e7-4e06-95f2-9e1a6b0c2bfb',
    propertyId: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    message: 'I am interested in the Modern Family Home. Can I schedule a tour?'
  },
  {
    id: 'b67b1a47-d4fa-4e1f-b73c-09a2954b3d4d',
    propertyId: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    message: 'Is the Downtown Condo still available? What are the HOA fees?'
  }
];

async function seed() {
  for (const item of listings) {
    const params = {
      TableName: "Properties",
      Item: item,
    };
    try {
      await docClient.put(params).promise();
      console.log(`Seeded property: ${item.title}`);
    } catch (err) {
      console.error('Error seeding property:', err);
    }
  }
  for (const inquiry of inquiries) {
    const params = {
      TableName: "Inquiries",
      Item: inquiry,
    };
    try {
      await docClient.put(params).promise();
      console.log(`Seeded inquiry from: ${inquiry.name}`);
    } catch (err) {
      console.error('Error seeding inquiry:', err);
    }
  }
}

seed();