jest.mock("aws-sdk", () => {
  const mockUpdate = jest.fn().mockReturnValue({ promise: () => Promise.reject() });
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({ update: mockUpdate })),
    },
  };
});

import { handler } from '../../backend/functions/updateProperty/index';

test('should return 500 on failure', async () => {
  const mockEvent = {
    pathParameters: { id: 'bad-id' },
    body: JSON.stringify({ title: "Updated" }),
  } as any;

  const response = await handler(mockEvent);
  expect(response.statusCode).toBe(500);
});