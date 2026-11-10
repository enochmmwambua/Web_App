const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, config = {}) {
    const { timeoutMs = 1500, retries = 2, delayMs = 200 } = config;
    const method = (options.method || 'GET').toUpperCase();
    // Never retry write operations (POST, PUT, PATCH, DELETE) to preserve idempotency
    const maxRetries = method === 'GET' ? retries : 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        let wait = delayMs * (2 ** attempt); // Exponential backoff: 200ms, then 400ms

        try {
            const res = await fetch(url, {
                ...options,
                signal: AbortSignal.timeout(timeoutMs) // Cut off hanging requests
            });

            // If successful, or if it's a client error (400, 401, 404), return immediately
            if (!RETRY_STATUSES.has(res.status) || attempt >= maxRetries) {
                return res;
            }

            // Honor Retry-After header if 429
            const retryAfter = Number(res.headers.get('Retry-After'));
            if (res.status === 429 && retryAfter > 0) {
                wait = Math.min(retryAfter * 1000, 5000);
            }

            console.warn(`[RETRY] Attempt ${attempt + 1} for ${url} returned ${res.status}. Retrying in ${wait}ms...`);
            await sleep(wait);
        } catch (err) {
            if (attempt >= maxRetries) throw err;
            const reason = err.name === 'TimeoutError' ? 'timeout' : (err.cause?.code || err.message);
            console.warn(`[RETRY] Attempt ${attempt + 1} failed (${reason}). Retrying in ${wait}ms...`);
            await sleep(wait);
        }
    }
}

module.exports = { fetchWithRetry };