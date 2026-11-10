const crypto = require('crypto');

const round = n => Math.round(n * 10) / 10;

// Label who called without logging the raw API key (fingerprint only)
function who(req) {
    if (!req.apiKey) return 'none';
    const hash = crypto.createHash('sha256').update(req.apiKey).digest('hex');
    return 'key-' + hash.slice(0, 6);
}

// In-memory running metrics store
const stats = {
    startedAt: new Date().toISOString(),
    total: 0,
    clientErrors: 0, // 4xx: caller mistakes
    serverErrors: 0, // 5xx: our server issues
    totalMs: 0,
    routes: {}
};

function newRoute() {
    return { count: 0, clientErrors: 0, serverErrors: 0, totalMs: 0, maxMs: 0 };
}

function monitor(req, res, next) {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        // High-precision response timing in milliseconds
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        const roundedMs = round(ms);

        // 1. Write one line of structured JSON per request
        console.log(JSON.stringify({
            time: new Date().toISOString(),
            method: req.method,
            path: req.path, // path only, never query strings
            status: res.statusCode,
            ms: roundedMs,
            caller: who(req)
        }));

        // 2. Accumulate metrics grouped by route pattern (prevents ID explosion)
        const route = req.route ? (req.baseUrl || '') + req.route.path : '(no route)';
        const label = `${req.method} ${route}`;

        const r = stats.routes[label] || newRoute();
        stats.routes[label] = r;

        stats.total += 1;
        stats.totalMs += ms;

        r.count += 1;
        r.totalMs += ms;
        r.maxMs = Math.max(r.maxMs, ms);

        if (res.statusCode >= 500) {
            stats.serverErrors += 1;
            r.serverErrors += 1;
        } else if (res.statusCode >= 400) {
            stats.clientErrors += 1;
            r.clientErrors += 1;
        }
    });

    next();
}

function statsHandler(req, res) {
    const routes = {};
    for (const [label, r] of Object.entries(stats.routes)) {
        routes[label] = {
            count: r.count,
            clientErrors: r.clientErrors,
            serverErrors: r.serverErrors,
            avgMs: round(r.count ? r.totalMs / r.count : 0),
            maxMs: round(r.maxMs)
        };
    }

    const rate = stats.total ? (stats.serverErrors / stats.total) * 100 : 0;
    const avg = stats.total ? stats.totalMs / stats.total : 0;

    res.json({
        startedAt: stats.startedAt,
        uptimeSeconds: Math.round(process.uptime()),
        total: stats.total,
        clientErrors: stats.clientErrors,
        serverErrors: stats.serverErrors,
        errorRatePercent: round(rate),
        avgMs: round(avg),
        routes
    });
}

module.exports = { monitor, statsHandler };