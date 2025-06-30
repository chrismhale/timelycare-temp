jest.mock("aws-sdk", () => {
  const mockPut = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({ put: mockPut })),
    },
  };
});

import { handler } from '../functions/createProperty/index';

test('should return 201 and create a property', async () => {
  const mockEvent = {
    body: JSON.stringify({ title: "Test", price: 123000 }),
  } as any;

  const response = await handler(mockEvent);
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(response.body);
  expect(body.title).toBe("Test");
});

test('should handle bad input', async () => {
  const response = await handler({ body: null } as any);
  expect(response.statusCode).toBe(500);
});