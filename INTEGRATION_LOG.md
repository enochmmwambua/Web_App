# Integration Log — Week 10: Live Partner API Integration

**Consumer App:** GymBuddy (Evolve Fitness Langata)  
**Provider App:** ShieldBox Incident Reporting API (Group 8)  
**Provider Base URL:** `https://confidential-findings-blogging-fighting.trycloudflare.com`  
**Integration Feature:** Anonymous Gym Equipment & Maintenance Reporting (`reports.html`)

---

## 1. Feature Overview

We integrated Group 8's ShieldBox API into the GymBuddy member portal via `reports.html` and two backend proxy routes (`POST /api/gym-reports` and `GET /api/gym-reports/:caseCode`). Members can report faulty gym equipment or safety hazards anonymously, receive a persistent tracking Case Code, and check resolution status in real time.

---

## 2. Integration Seam & Debugging Log

| # | What broke (symptom) | Root cause | Fix | Whose code, and who fixed it |
|---|---|---|---|---|
| 1 | `curl http://172.20.10.2:3001` timed out | Partner provided a private iPhone/hotspot local IP address unreachable outside their LAN | Requested an externally accessible URL | Partner (Group 8 provided Cloudflare tunnel) |
| 2 | `POST /reports` returned `400 Bad Request` with `{"message":"category must be one of..."}` | Category dropdown sent title-cased values (`"Broken Equipment"`, `"Safety"`) while ShieldBox enforces strict lowercase enums (`"maintenance"`, `"safety"`, `"incident"`, `"harassment"`) | Updated `<select id="category">` options in `reports.html` to send exact lowercase enum values | Consumer (GymBuddy UI) |
| 3 | Upstream calls to `trycloudflare.com` returned `401 Unauthorized` with `{"message":"Missing or invalid API key"}` | Group 8 activated Week 9 `requireApiKey` middleware, but omitted the API key from their Week 8 README contract | Contacted partner, received key (`9a8b7c6d5e4f3a2b1c0d9e8f`), injected into `server/.env`, and forwarded via `X-API-Key` in proxy headers | Both (Partner provided key; GymBuddy configured headers) |
| 4 | First query for new key attempt returned 401 | Partner provided key string with leading formatting character (`:9a8b...`), which failed string equality check | Trimmed string to `9a8b7c6d5e4f3a2b1c0d9e8f` and confirmed via curl | Consumer (GymBuddy configuration) |
| 5 | Upstream simulation test triggered `ECONNREFUSED` | Tested behavior when partner API was offline | Proxy catch block caught socket error, logged `ECONNREFUSED` to terminal, and returned HTTP 502 with friendly UI banner; GymBuddy server remained fully operational | Consumer (GymBuddy backend resilience) |

---

## 3. Graceful Failure Verification

* **Simulated Outage:** Directed `SHIELDBOX_BASE_URL` to an unmapped port (`http://localhost:3099`).
* **Client Behavior:** `reports.html` displayed a clear error notification informing the member that maintenance services were temporarily offline, avoiding blank views or unhandled promise rejections.
* **Server Resilience:** Express logged `ECONNREFUSED` without terminating the process; core gym endpoints (`/memberships`, `/api/workouts`) remained responsive.
* **Automatic Recovery:** Upon restoring the correct partner URL, querying `SB-88219` succeeded immediately without client-side modifications.