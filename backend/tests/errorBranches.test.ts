import * as del from '../functions/deleteProperty/index';
import * as update from '../functions/updateProperty/index';
import * as inquiry from '../functions/submitInquiry/index';
import { handler as getAgentHandler } from '../functions/getAgentProperties/index';

// Access global mocks defined in jest.setup
const { mockDelete, mockUpdate, mockPut, mockScan } = (global as any).dynamoMocks;

describe('Error branch coverage', () => {
  afterEach(() => {
    // Reset mocks back to resolved state
    mockDelete.mockReturnValue({ promise: () => Promise.resolve() });
    mockUpdate.mockReturnValue({ promise: () => Promise.resolve() });
    mockPut.mockReturnValue({ promise: () => Promise.resolve() });
    mockScan.mockReturnValue({ promise: () => Promise.resolve({ Items: [] }) });
  });

  test('deleteProperty returns 500 on DynamoDB error', async () => {
    mockDelete.mockReturnValueOnce({ promise: () => Promise.reject(new Error('db')) });
    const res = await (del.handler as any)({ pathParameters: { id: 'x' } });
    expect((res as any).statusCode).toBe(500);
  });

  test('updateProperty returns 500 on DynamoDB error', async () => {
    mockUpdate.mockReturnValueOnce({ promise: () => Promise.reject(new Error('db')) });
    const eventValid = { pathParameters: { id: '1' }, body: JSON.stringify({ title: 'x', price: 1 }) } as any;
    const res = await (update.handler as any)(eventValid);
    expect((res as any).statusCode).toBe(500);
  });

  test('submitInquiry returns 500 on DynamoDB error', async () => {
    mockPut.mockReturnValueOnce({ promise: () => Promise.reject(new Error('db')) });
    const eventValid2 = { body: JSON.stringify({ name: 't', message: 'hello' }) } as any;
    const res = await (inquiry.handler as any)(eventValid2);
    expect((res as any).statusCode).toBe(500);
  });

  test('getAgentProperties returns 500 when scan fails', async () => {
    mockScan.mockReturnValueOnce({ promise: () => Promise.reject(new Error('db')) });
    const event = { headers: { Authorization: 'Bearer agent-token-123' } } as any;
    const res = await (getAgentHandler as any)(event);
    expect((res as any).statusCode).toBe(500);
  });

  test('deleteProperty returns 400 when id missing', async () => {
    const res = await (del.handler as any)({} );
    expect((res as any).statusCode).toBe(400);
  });

  test('updateProperty returns 400 when id missing', async () => {
    const event = { body: JSON.stringify({ title: 'x' }) } as any;
    const res = await (update.handler as any)(event);
    expect((res as any).statusCode).toBe(400);
  });

  test('updateProperty returns 400 when no data', async () => {
    const event = { pathParameters: { id: '1' }, body: JSON.stringify({}) } as any;
    const res = await (update.handler as any)(event);
    expect((res as any).statusCode).toBe(400);
  });

  test('submitInquiry returns 400 when body invalid', async () => {
    const event = { body: JSON.stringify({}) } as any;
    const res = await (inquiry.handler as any)(event);
    expect((res as any).statusCode).toBe(400);
  });
}); 