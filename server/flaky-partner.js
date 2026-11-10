// flaky-partner.js: Test harness for Week 11 Resilience
const express = require('express');
const app = express();
app.use(express.json());

let mode = 'ok'; // 'ok' | 'slow' | 'flaky' | 'error'
let calls = 0;

const sampleReport = {
    caseCode: "SB-88219",
    category: "maintenance",
    description: "Cable crossover machine pulley is frayed and slipping under load.",
    status: "In Review",
    createdAt: "2026-09-09T05:30:00.000Z",
    notes: [{ noteId: "not-17", message: "Staff has cordoned off the area around the machine." }]
};

app.get('/_mode/:m', (req, res) => {
    mode = req.params.m;
    calls = 0;
    console.log(`[STAND-IN] Switched mode to: ${mode}`);
    res.json({ mode });
});

app.get('/reports/:code', async (req, res) => {
    calls += 1;
    console.log(`[STAND-IN] GET /reports/${req.params.code} (Call #${calls}, Mode: ${mode})`);

    if (mode === 'slow') {
        // Sleep for 10 seconds to simulate hanging server
        await new Promise(r => setTimeout(r, 10000));
    }

    if (mode === 'flaky' && calls % 3 !== 0) {
        // Fails twice, succeeds on the 3rd attempt
        return res.status(503).json({ message: "Temporary database lock, try again." });
    }

    if (mode === 'error') {
        // Always fail with internal server error
        return res.status(500).json({ message: "Internal server error." });
    }

    res.json(sampleReport);
});

app.listen(4000, () => console.log('Stand-in partner running on http://localhost:4000'));