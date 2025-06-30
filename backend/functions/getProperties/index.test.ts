jest.mock("aws-sdk", () => {
  const mockScan = jest.fn().mockReturnValue({
    promise: () => Promise.resolve({ Items: [{ id: "1", title: "Mock Property" }] }),
  });
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({ scan: mockScan })),
    },
  };
});

import { handler } from '../../backend/functions/getProperties/index';

test('should return 200 and list properties', async () => {
  const event = {} as any;
  const result = await handler(event);
  expect(result.statusCode).toBe(200);
  expect(Array.isArray(JSON.parse(result.body))).toBe(true);
});

test('should handle internal failure', async () => {
  jest.mocked(require("aws-sdk").DynamoDB.DocumentClient).mockImplementationOnce(() => ({
    scan: () => ({ promise: () => Promise.reject(new Error("Dynamo failed")) }),
  }));

  const event = {} as any;
  const result = await handler(event);
  expect(result.statusCode).toBe(500);
});