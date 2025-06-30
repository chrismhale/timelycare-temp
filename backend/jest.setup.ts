import { jest } from '@jest/globals';

const mockPut = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
const mockScan = jest.fn().mockReturnValue({ promise: () => Promise.resolve({ Items: [] }) });
const mockQuery = jest.fn().mockReturnValue({ promise: () => Promise.resolve({ Items: [] }) });
const mockUpdate = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
const mockDelete = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: mockPut,
        scan: mockScan,
        query: mockQuery,
        update: mockUpdate,
        delete: mockDelete,
      })),
    },
  };
});

(global as any).dynamoMocks = { mockPut, mockScan, mockQuery, mockUpdate, mockDelete }; 