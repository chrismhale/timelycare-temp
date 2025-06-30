import { handler } from './index';
import AWS from 'aws-sdk';

jest.mock('aws-sdk');

const scanMock = jest.fn();
(AWS.DynamoDB.DocumentClient as any).mockImplementation(() => ({ scan: scanMock }));

describe('listInquiries Lambda', () => {
  beforeEach(() => {
    scanMock.mockReset();
  });

  it('returns all inquiries', async () => {
    scanMock.mockReturnValue({ promise: () => Promise.resolve({ Items: [{ id: '1', name: 'Test' }] }) });
    const event = { httpMethod: 'GET' };
    const res = await handler(event as any);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([{ id: '1', name: 'Test' }]);
  });

  it('returns error on failure', async () => {
    scanMock.mockReturnValue({ promise: () => Promise.reject(new Error('fail')) });
    const event = { httpMethod: 'GET' };
    const res = await handler(event as any);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toHaveProperty('error');
  });
}); 