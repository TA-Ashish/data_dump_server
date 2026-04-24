import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../src/app';
import { Dump } from '../../src/models/dump.model';

const app = createApp();
let mongod: MongoMemoryServer;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
}, 30_000);

afterEach(async () => {
    await Dump.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

describe('POST /api/v1/dump', () => {
    it('stores payload and returns 201 with id and userId', async () => {
        const payload = { temperature: 22.5, sensor: 'A1', tags: ['iot', 'env'] };

        const res = await request(app)
            .post('/api/v1/dump')
            .set('x-user-id', 'user-123')
            .send(payload)
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.userId).toBe('user-123');
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.createdAt).toBeDefined();

        const doc = await Dump.findById(res.body.data.id);
        expect(doc).not.toBeNull();
        expect(doc!.userId).toBe('user-123');
        expect(doc!.payload).toMatchObject(payload);
    });

    it('stores deeply nested JSON payloads', async () => {
        const payload = {
            user: { profile: { name: 'Alice', age: 30 } },
            metrics: [1, 2, 3],
        };

        const res = await request(app)
            .post('/api/v1/dump')
            .set('x-user-id', 'user-456')
            .send(payload)
            .expect(201);

        const doc = await Dump.findById(res.body.data.id);
        expect(doc!.payload).toMatchObject(payload);
    });

    it('returns 400 when x-user-id header is missing', async () => {
        const res = await request(app).post('/api/v1/dump').send({ foo: 'bar' }).expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.error).toMatch(/x-user-id/);
    });

    it('returns 400 when x-user-id is blank', async () => {
        const res = await request(app)
            .post('/api/v1/dump')
            .set('x-user-id', '   ')
            .send({ foo: 'bar' })
            .expect(400);

        expect(res.body.success).toBe(false);
    });

    it('returns 404 for unknown routes', async () => {
        const res = await request(app).get('/api/v1/unknown').expect(404);
        expect(res.body.success).toBe(false);
    });

    it('GET /health returns ok', async () => {
        const res = await request(app).get('/health').expect(200);
        expect(res.body.status).toBe('ok');
    });
});
