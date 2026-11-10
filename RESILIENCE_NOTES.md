# Resilience Notes — Week 11: Timeouts, Retries & Fallbacks

**Application:** GymBuddy (Evolve Fitness Lang'ata)  
**Partner Integration:** ShieldBox Incident Reporting API (Group 8)  
**Feature:** Incident & Maintenance Case Tracking (`/reports.html` -> `/api/gym-reports/:caseCode`)

---

## 1. Failure Modes & Test Results

| Failure Mode | Stand-in / Partner State | What User Saw | Terminal / Log Output |
|---|---|---|---|
| **Normal (Baseline)** | Stand-in in `ok` mode | Live report rendered immediately (< 50ms) | `GET /reports/SB-88219 (Call #1, Mode: ok)` |
| **Slow Partner** | Stand-in in `slow` mode (10s delay) | Cut off after ~1.5s per attempt; served saved data with amber banner: *"Showing saved data from..."* | `[RETRY] Attempt 1 failed (timeout)` -> 2 retries -> served cache |
| **Flaky Partner** | Stand-in in `flaky` mode (fails 2x with 503, succeeds 3rd) | Live report loaded seamlessly; user experienced no failure | Terminal showed 2 retry warnings, then 200 OK on attempt 3 |
| **Complete Outage** | Stand-in in `error` mode (500) or partner stopped | Amber banner showing saved data; or friendly red offline banner if cache empty | Exactly 2 retries logged with exponential backoff (200ms, 400ms), then halted |
| **Bad Case Code** | Queried non-existent code `SB-00000` | Immediate "No report found" message (no retries) | Returned 404 immediately; did not enter retry loop |

---

## 2. Our Numbers & Arithmetic

* **Normal baseline measured:** ~38 ms locally; ~280 ms over Cloudflare tunnel.
* **Timeout chosen (`timeoutMs`):** **1,500 ms (1.5 seconds)**. This provides ample headroom above normal network latency while cutting off hung processes before users abandon the page.
* **Retries chosen (`retries`):** **2 attempts** (GET read operations only).
* **Backoff delay (`delayMs`):** **200 ms initial, doubling to 400 ms** (exponential backoff).
* **Worst-Case Wait Arithmetic:**
  $$\text{Worst-case wait} = (\text{retries} + 1) \times \text{timeout} + \text{delays}$$
  $$\text{Worst-case wait} = (2 + 1) \times 1,500\,\text{ms} + 200\,\text{ms} + 400\,\text{ms} = 5,100\,\text{ms}\ (5.1\text{ seconds})$$
  A 5.1-second worst-case wait is acceptable for an incident lookup fallback and avoids indefinite browser spinners.

---

## 3. Real User Experience Without This Code

Without this resilience implementation, a gym member checking the repair status of broken equipment on `reports.html` would experience an indefinite browser hang whenever ShieldBox experiences database locks or Cloudflare tunnel lag. The user sits staring at a frozen button for 30 to 60 seconds until the browser or proxy gateway times out with a blank screen or raw socket error. Thinking the app is broken, the user repeatedly mashes the "Query Status" button, triggering an accidental denial-of-service burst against the struggling partner server. With this code in place, transient hiccups resolve transparently behind the scenes, timeouts cut hanging requests at 1.5 seconds, and members always receive cached progress updates with clear timestamps.

---

## 4. What We Did Not Build (Circuit Breaker)

A **circuit breaker** is an automated state machine that trips "open" after repeated failures, immediately short-circuiting calls and serving cached data without attempting the partner API, periodically testing the connection with a single "half-open" probe request. While our current implementation still attempts every user request up to three times, a circuit breaker would eliminate the 5.1-second wait entirely during an extended partner outage.

SHIELDBOX_BASE_URL=https://distributions-learning-workstation-ecological.trycloudflare.com
SHIELDBOX_API_KEY=9a8b7c6d5e4f3a2b1c0d9e8f