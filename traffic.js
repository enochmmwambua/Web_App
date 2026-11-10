// traffic.js: Generates diverse traffic mix to exercise GymBuddy observability
const API = process.env.API || 'http://localhost:5000';
const KEY = process.env.KEY || 'gymbuddy_partner_key_10';
const N = Number(process.env.N || 60);

const mix = [
    { method: 'GET', path: '/memberships', key: true },
    { method: 'GET', path: '/trainers', key: true },
    { method: 'GET', path: '/hours', key: true },
    { method: 'GET', path: '/api/gym-reports/SB-88219', key: true },
    { method: 'GET', path: '/api/gym-reports/SB-00000', key: true }, // Expected 404
    { method: 'GET', path: '/memberships', key: false },             // Expected 401 (no key)
    { method: 'GET', path: '/not-a-route', key: true }              // Expected 404 (no route)
];

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log(`Sending ${N} requests to ${API}...`);
    const counts = {};

    for (let i = 0; i < N; i++) {
        const r = mix[Math.floor(Math.random() * mix.length)];
        try {
            const res = await fetch(API + r.path, {
                method: r.method,
                headers: r.key ? { 'X-API-Key': KEY } : {}
            });
            counts[res.status] = (counts[res.status] || 0) + 1;
        } catch (err) {
            counts.failed = (counts.failed || 0) + 1;
        }
        await pause(50);
    }

    console.log('Finished! Status codes received:', counts);
})();   