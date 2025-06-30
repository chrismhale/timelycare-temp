jest.mock("aws-sdk", () => {
  const mockDelete = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({ delete: mockDelete })),
    },
  };
});

import { handler } from '../../backend/functions/deleteProperty/index';

test('should return 204 on success', async () => {
  const mockEvent = {
    pathParameters: { id: "test-id" },
  } as any;

  const response = await handler(mockEvent);
  expect(response.statusCode).toBe(204);
});