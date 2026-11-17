// server/test.js
const API_BASE = 'http://localhost:5000';
const KEY = 'gymbuddy_partner_key_10';

async function runSuite() {
    console.log('\n========================================');
    console.log('   GYMBUDDY API AUTOMATED TEST SUITE    ');
    console.log('========================================\n');

    const tests = [
        { name: 'GET /memberships (Authenticated Read)', url: `${API_BASE}/memberships`, headers: { 'X-API-Key': KEY }, expected: 200 },
        { name: 'GET /memberships (Security Rejection)', url: `${API_BASE}/memberships`, headers: {}, expected: 401 },
        { name: 'GET /hours?status=open (Filtered Availability)', url: `${API_BASE}/hours?status=open`, headers: { 'X-API-Key': KEY }, expected: 200 },
        { name: 'GET /trainers (Staff Directory)', url: `${API_BASE}/trainers`, headers: { 'X-API-Key': KEY }, expected: 200 },
        { name: 'GET /api/workouts (Frontend Workouts)', url: `${API_BASE}/api/workouts`, headers: {}, expected: 200 },
        { name: 'POST /api/users (Tenant Registration)', url: `${API_BASE}/api/users`, method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY }, body: JSON.stringify({ fullName: 'Audit Test User', email: `audit.${Date.now()}@example.com`, tier: 'Monthly Standard', password: 'Password123!' }), expected: 201 },
        { name: 'GET /stats (System Observability)', url: `${API_BASE}/stats`, headers: { 'X-API-Key': KEY }, expected: 200 }
    ];

    let passed = 0;
    for (const t of tests) {
        try {
            const res = await fetch(t.url, { method: t.method || 'GET', headers: t.headers, body: t.body });
            if (res.status === t.expected) {
                console.log(`[PASS] HTTP ${res.status} - ${t.name}`);
                passed++;
            } else {
                console.log(`[FAIL] Expected ${t.expected}, got ${res.status} - ${t.name}`);
            }
        } catch (err) {
            console.log(`[ERROR] Connection failed for ${t.name}`);
        }
    }

    console.log(`\nSummary: ${passed}/${tests.length} tests passed successfully.`);
    console.log('========================================\n');
}

runSuite();