jest.mock("aws-sdk", () => {
  const mockScan = jest.fn().mockReturnValue({
    promise: () => Promise.resolve({ Items: [{ id: "1", owner: "agent-token-123" }] }),
  });
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({ scan: mockScan })),
    },
  };
});

import { handler } from '../../backend/functions/getAgentProperties/index';

test('should return 200 with agent properties', async () => {
  const event = {
    headers: { Authorization: 'Bearer agent-token-123' },
  } as any;

  const result = await handler(event);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)[0].owner).toBe('agent-token-123');
});

test('should return 401 if unauthorized', async () => {
  const event = { headers: { Authorization: 'invalid' } } as any;
  const result = await handler(event);
  expect(result.statusCode).toBe(401);
});

test('should return 500 on DynamoDB failure', async () => {
  jest.mocked(require("aws-sdk").DynamoDB.DocumentClient).mockImplementationOnce(() => ({
    scan: () => ({ promise: () => Promise.reject("fail") }),
  }));

  const event = { headers: { Authorization: 'Bearer agent-token-123' } } as any;
  const result = await handler(event);
  expect(result.statusCode).toBe(500);
});