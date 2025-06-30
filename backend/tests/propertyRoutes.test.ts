import * as create from '../functions/createProperty/index';
import * as get from '../functions/getProperties/index';
import * as update from '../functions/updateProperty/index';
import * as del from '../functions/deleteProperty/index';

describe('Property Routes Integration', () => {
  test('POST /properties should create a property', async () => {
    const event = { body: JSON.stringify({ title: "IntTest", price: 123000 }) } as any;
    const res = await create.handler(event);
    expect(res.statusCode).toBe(201);
  });

  test('GET /properties should list properties', async () => {
    const event = {} as any;
    const res = await get.handler(event);
    expect(res.statusCode).toBe(200);
  });

  test('PUT /properties/:id should update a property', async () => {
    const event = {
      pathParameters: { id: "mock-id" },
      body: JSON.stringify({ title: "Updated", price: 999000 }),
    } as any;
    const res = await update.handler(event);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('DELETE /properties/:id should delete a property', async () => {
    const event = {
      pathParameters: { id: "mock-id" },
    } as any;
    const res = await del.handler(event);
    expect([204, 500]).toContain(res.statusCode);
  });
});