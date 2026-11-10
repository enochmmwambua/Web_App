# Security Audit & Self-Assessment — Week 9

**Application:** GymBuddy Backend (Evolve Fitness Lang'ata)  
**Date:** October 27, 2026  
**Auditor:** Nancy Kyuna
**Scope:** Express server (`server/index.js`), MySQL database queries, environment variables, authentication middleware, and rate limiting.

---

## 1. Route Access & API Key Architecture

### Keyed vs. Unkeyed Routes Rationale
We chose a hybrid model where partner routes require an API key, while public health, documentation, and internal frontend application routes do not.

* **Public / Unkeyed Routes:**
  * `GET /`: Basic health check ping to verify the server container is alive.
  * `GET /docs/*`: Swagger UI documentation pages and OpenAPI assets, kept accessible so external evaluators and prospective integration partners can inspect the specification without pre-shared credentials.
  * `GET, POST, PUT, DELETE /api/workouts`: Core workout logger used directly by the in-browser single-page app.
  * `POST /api/login`, `GET /api/users/:id`, `PUT /api/users/:id`: Member authentication and profile screens.
  * `POST, GET /api/gym-reports/*`: The member-facing incident reporting client that proxies reports upstream.
* **Protected Routes (Require `X-API-Key`):**
  * `GET /memberships`
  * `GET /trainers`
  * `GET /testimonials`
  * `GET /schedules`
  * `GET /hours`
  * `POST /users` (External user registration / onboarding by partner apps)

**Why this split?**  
Requiring an API key on the internal frontend routes would force us to expose the partner API key inside client-side JavaScript (`script.js` or `localStorage`), completely defeating the security of the key. Keeping the partner endpoints protected prevents arbitrary outside scrapers from hitting contract data unchecked.

---

## 2. Credential & Sensitive Data Leakage Audit

* **User Passwords:**
  * In `POST /api/login`, `GET /api/users/:id`, and `PUT /api/users/:id`, database queries explicitly enumerate columns (`SELECT id, full_name, email, phone, membership_tier FROM users ...`) rather than using `SELECT *`.
  * Passwords and password hashes are never returned in JSON response bodies to the client.
* **Registration Responses:**
  * `POST /users` sanitizes the return payload, explicitly returning only `id`, `fullName`, `email`, `phone`, and `tier`. The submitted password is excluded from the response.
* **Environment Configuration & Git Hygiene:**
  * All sensitive strings (`API_KEYS`, `DB_PASSWORD`, `SHIELDBOX_API_KEY`) reside exclusively in `server/.env`.
  * `.gitignore` explicitly prevents `.env` and `node_modules` from being pushed to source control.
  * Live secrets are injected solely through Railway environment variables.

---

## 3. Database Error Sanitization & Information Disclosure

* **Zero Stack Trace Leaks:**  
  Raw database errors (such as SQL syntax mistakes, column mismatches, or internal database table structures) are caught in `try / catch` blocks.
* **Generic Client Errors:**  
  Instead of forwarding the raw MySQL driver error object, all catch blocks return sanitized, generic error strings:
  ```json
  { "error": "Failed to fetch workouts" }
  { "error": "Could not fetch user profile." }