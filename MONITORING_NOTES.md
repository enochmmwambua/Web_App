# Monitoring Notes — Week 12: Logs, Metrics & API Observability

**Application:** GymBuddy Backend (Evolve Fitness Lang'ata)  
**Date:** November 2026  
**Auditor:** Enoch Mutai Mwambua  

---

## Part A: Initial Predictions (Before Collecting Data)

1. **Slowest Endpoint Prediction:**  
   We predicted `GET /api/gym-reports/:caseCode` would be the slowest endpoint because it makes an outbound network call across the Cloudflare tunnel to our partner's ShieldBox service, adding external network latency and upstream database query time.
2. **Most Errors Prediction:**  
   We predicted `GET /memberships` would log the highest count of 4xx errors due to missing or invalid `X-API-Key` headers during unauthenticated partner requests and client sweeps.

---

## Part B: Log Verification & Key Leakage Audit

Starting the server and inspecting single-line JSON logs verified clean structured output:

```json
{"time":"2026-11-03T16:20:11.204Z","method":"GET","path":"/memberships","status":200,"ms":3.4,"caller":"key-a8f3b2"}
{"time":"2026-11-03T16:20:12.418Z","method":"GET","path":"/memberships","status":401,"ms":0.8,"caller":"none"}