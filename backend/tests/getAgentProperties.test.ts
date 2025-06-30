import { handler } from '../functions/getAgentProperties/index';

describe('GET /agent/properties Integration', () => {
  test('should return 200 and filter agent listings with correct token', async () => {
    const event = {
      headers: {
        Authorization: 'Bearer agent-token-123',
      },
    } as any;

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const data = JSON.parse(result.body);
    expect(Array.isArray(data)).toBe(true);
  });

  test('should return 401 with missing/invalid token', async () => {
    const event = {
      headers: {
        Authorization: 'wrong-token',
      },
    } as any;

    const result = await handler(event);
    expect(result.statusCode).toBe(401);
  });
});