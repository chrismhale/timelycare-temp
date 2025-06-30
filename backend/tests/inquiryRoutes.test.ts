import * as inquiry from '../functions/submitInquiry/index';

describe('Inquiry Route Integration', () => {
  test('POST /inquiries should submit an inquiry', async () => {
    const event = { body: JSON.stringify({ name: "Test User", message: "Hello" }) } as any;
    const res = await inquiry.handler(event);
    expect(res.statusCode).toBe(201);
  });
});