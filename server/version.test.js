// server/versions.test.js
process.env.API_KEYS = 'test-key';
const request = require('supertest');
const express = require('express');
const v1 = require('./v1');
const v2 = require('./v2');

const app = express();
app.use((req, res, next) => {
    if (req.get('X-API-Key') !== 'test-key') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});
app.use('/v2', v2);
app.use('/v1', v1);
app.use('/', v1);

const KEY = { 'X-API-Key': 'test-key' };

describe('v1 is frozen', () => {
    test('GET /v1/memberships keeps original shape', async () => {
        const res = await request(app).get('/v1/memberships').set(KEY);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(Object.keys(res.body[0]).sort()).toEqual(['details', 'price', 'tier']);
    });

    test('old unversioned /memberships still answers same way', async () => {
        const a = await request(app).get('/memberships').set(KEY);
        const b = await request(app).get('/v1/memberships').set(KEY);
        expect(a.status).toBe(200);
        expect(a.body).toEqual(b.body);
    });
});

describe('v2 has new shape', () => {
    test('list is wrapped with rate instead of price', async () => {
        const res = await request(app).get('/v2/memberships').set(KEY);
        expect(res.status).toBe(200);
        expect(res.body.count).toBe(3);
        expect(Object.keys(res.body.data[0]).sort()).toEqual(['details', 'rate', 'tier']);
    });
});

describe('deprecation headers', () => {
    test('v1 and unversioned routes carry deprecation headers', async () => {
        for (const path of ['/v1/memberships', '/memberships']) {
            const res = await request(app).get(path).set(KEY);
            expect(res.headers.deprecation).toBe('true');
            expect(res.headers.sunset).toBeDefined();
            expect(res.headers.link).toContain('rel="successor-version"');
        }
    });

    test('v2 routes do not carry deprecation headers', async () => {
        const res = await request(app).get('/v2/memberships').set(KEY);
        expect(res.headers.deprecation).toBeUndefined();
    });
});