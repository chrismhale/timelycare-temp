import { handler } from './index';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

jest.mock('aws-sdk');
jest.mock('uuid');

const putMock = jest.fn();
(AWS.DynamoDB.DocumentClient as any).mockImplementation(() => ({ put: putMock }));
(uuidv4 as jest.Mock).mockReturnValue('test-uuid');

describe('submitInquiry Lambda', () => {
  beforeEach(() => {
    putMock.mockReset();
  });

  it('saves inquiry and returns success', async () => {
    putMock.mockReturnValue({ promise: () => Promise.resolve() });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'a@b.com', message: 'Hi', propertyId: '123' }),
    };
    const res = await handler(event as any);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ success: true });
    expect(putMock).toHaveBeenCalled();
  });

  it('returns error on failure', async () => {
    putMock.mockReturnValue({ promise: () => Promise.reject(new Error('fail')) });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'a@b.com', message: 'Hi', propertyId: '123' }),
    };
    const res = await handler(event as any);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toHaveProperty('error');
  });
});