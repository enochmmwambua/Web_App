# Blind Test Report — Week 8: API Documentation Swap

**Date of Test:** October 27, 2026  
**Our API:** GymBuddy (Evolve Fitness Lang'ata)  
**Swapped With:** Artist API Server (team outside our ring)  
**Their Base URL:** `https://artist-api-server.onrender.com`  
**How We Tested:** We simply swapped `README.md` files. Neither of us gave the other team hints, explanations, or looked at each other's code.

---

## 1. What Happened When They Tested Our README

The other team tried out GymBuddy (`https://webapp-production-36f4.up.railway.app`) using only our root `README.md`.

* **Time to First Response:** It took them about 3 minutes to get their first working response.
* **Quickstart Command:**
  * They copied and ran our main quickstart command:
    ```bash
    curl [https://webapp-production-36f4.up.railway.app/memberships](https://webapp-production-36f4.up.railway.app/memberships)
    ```
  * It worked right away, returning `200 OK` along with our membership tiers (`Daily Drop-In`, `Monthly Standard`, and `Student`).
* **Checking the Docs Site:**
  * They opened up `https://webapp-production-36f4.up.railway.app/docs/` in their browser and tested out `GET /trainers` and `GET /hours?status=open` directly in Swagger UI with no problems.
* **Where They Ran Into Friction:**
  * **Missing Trailing Slash:** When they initially typed `/docs` without the trailing slash `/`, Railway took a moment to redirect on certain terminal tools. Adding `/docs/` fixed it right up.
  * **Running Signup Twice:** They ran our sample `POST /users` command two times in a row. The first time returned `201 Created`, but the second time threw `400 Bad Request` with `{"error": "Email already exists"}`. They were momentarily confused whether the server broke or if it was expected behavior, until they read the error response.

---

## 2. What We Fixed in Our Docs After Feedback

We made three quick tweaks to our `README.md` based on what they noticed:

1. **Added the Trailing Slash:** We made sure all links in the README explicitly point to `/docs/` so nobody runs into redirect delays.
2. **Clarified Duplicate Email Errors:** We added a quick note under `POST /users` explaining that emails have to be unique, so repeating the test with the same email will intentionally return a 400 error.
3. **Noted Field Naming:** We clearly stated that registration fields use `camelCase` (`fullName`, `email`, `phone`, `tier`, `password`) so people don't accidentally send `snake_case`.

---

## 3. What Happened When We Tested Their README

We tested the Artist API Server (`https://artist-api-server.onrender.com`) using only their `README2.md`.

### Our Test Log

* **Test 1: Quickstart (`GET /api/artists`)**
  * We ran:
    ```bash
    curl [https://artist-api-server.onrender.com/api/artists](https://artist-api-server.onrender.com/api/artists)
    ```
  * **Result:** `200 OK`. The first request took around 40 seconds because Render's free tier was asleep and needed to wake up. Once it booted, it gave back a JSON list of three artists (`Ben`, `Night Echo`, and `Ariana Blue`) in under half a second.
* **Test 2: Health Check (`GET /api/health`)**
  * We ran:
    ```bash
    curl [https://artist-api-server.onrender.com/api/health](https://artist-api-server.onrender.com/api/health)
    ```
  * **Result:** `200 OK` returning `{"api":"ok","database":"connected"}` right away.
* **Test 3: Songs Endpoint (`GET /api/songs`)**
  * We ran:
    ```bash
    curl [https://artist-api-server.onrender.com/api/songs](https://artist-api-server.onrender.com/api/songs)
    ```
  * **Result:** `200 OK` returning their song list with titles, audio links, and genres.
* **Test 4: Error Handling (`GET /api/artists/999999`)**
  * We ran:
    ```bash
    curl -i [https://artist-api-server.onrender.com/api/artists/999999](https://artist-api-server.onrender.com/api/artists/999999)
    ```
  * **Result:** Clean `404 Not Found` returning `{"error":"Artist not found."}`.

### Things That Could Be Clearer in Their Docs

* **No Sample Request Bodies for POST:** They listed endpoints like `POST /api/artists` and `POST /api/songs`, but didn't show what the JSON payload should actually look like. That leaves the user guessing which fields are mandatory.
* **No Working Login to Test:** The docs showed what an invalid login response looks like (401), but didn't provide a seeded username and password so we could test a successful login.
* **Two Different Base Paths:** Having routes at both `/api/artists` and `/artists` caused a little initial confusion on which one to prefer, though the README did mention `/api` is the main one.

---

## 4. Takeaway

Overall, the test went smoothly. Both of us were able to copy a single `curl` command from the docs, paste it into the terminal, and get real data back without needing to ask questions or look at code. The only minor hiccups were small documentation oversights that were easy to explain and update.