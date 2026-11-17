# WEEK 14 RETROSPECTIVE REPORT

**Name:** Enoch Mutai Mwambua - 220883  
**Project:** GymBuddy – Evolve Fitness Lang'ata  
**Team:** Team 9 (Group A)  
**Role:** Resilience, Observability & Versioning Lead


## 1. The hardest part of the lifecycle

The hardest part of the project for me was Version (Week 13) along with Integrate and Harden (Weeks 10–11). Writing new endpoints for Evolve Fitness Lang'ata early in the semester was simple enough because we controlled everything on our end. By Week 13, though, I had to roll out a breaking change on **GET /memberships** (wrapping the list inside a **{ data, count }** object and renaming **price** to **rate**) without breaking Group 10 (NyumbaHub), who still expected the old flat array.

What actually made it stressful was Express route order and running out of time right before Demo Day. When I first wired **v1.js** and **v2.js** into **server/index.js**, the old hardcoded **/memberships** routes were still sitting lower down in the file. They blocked the new routers, so **GET /v2/memberships** kept throwing a **404 Not Found** error during our test run. Cleaning up those routes while making sure **Deprecation: true**, **Sunset**, and **Link** headers showed up on **/v1** and unversioned calls (but never on **/v2**) took a lot of trial and error. At the same time, tuning **fetchWithRetry** (**timeoutMs: 1500**, 2 retries, and **200ms**/**400ms** backoff) meant finding a sweet spot where a slow partner tunnel wouldn't hang our page, without giving up too early on a normal request.

## 2. One real cross-team issue

A real cross-team headache happened during Weeks 11 and 13 with our upstream partner, Group 8 (ShieldBox). We proxy their maintenance report endpoint (**GET /reports/:code**) through our own **GET /api/gym-reports/:caseCode** route. Two things went wrong around the same time. First, ShieldBox's Cloudflare tunnel had random lag spikes that jumped up to **1450ms** in our **GET /stats** logs, whereas our local MySQL endpoints took around **1.5ms**. Second, when ShieldBox pushed their v2 update, they wrapped their JSON response inside **{ data: ... }** instead of returning a flat object, which broke our proxy code whenever it tried to read **caseCode** and **status**.

We spotted the lag by checking the route averages on **/stats**, and we caught the payload change when our integration checks started failing against their new URL. To fix it without rewriting our main routes every time they updated their API, I created **server/partner.js** as a separate parser controlled by **PARTNER_VERSION=v2** in **.env**. I also connected our **lastGoodReports** cache into **fetchWithRetry** so if ShieldBox timed out, our server would return the saved report with **"stale": true** and an **asof** timestamp instead of crashing. 

## 3. What I would design differently

If we started GymBuddy over from day one, I would write contract shape tests back in Week 6 instead of leaving them until Week 13. Waiting that long meant duplicate inline routes in **server/index.js** slowly drifted away from what we wrote in **openapi.yaml**, which is why I ran into route-shadowing bugs when splitting out **v1.js** and **v2.js** at the end.

I would also store our **lastGoodReports** cache and **100 req/min** rate-limit counters in Redis instead of in-memory Node.js **Map** objects. Right now, every time our Railway container restarts or redeploys, all cached maintenance reports and rate-limit windows get wiped back to zero. What I would definitely keep is the **server/partner.js** adapter setup (which made handling ShieldBox's v2 schema change much easier) and the SHA-256 key hashing (**"caller":"key-0ebcf6"**) in **server/monitoring.js**. That kept raw partner API keys completely out of our terminal logs while still letting us see who was calling what.

## 4. My contribution

I would rate my contribution honestly at 8.5 out of 10. I owned the reliability, monitoring, and versioning pieces of the backend: I wrote **resilientFetch.js** (**fetchWithRetry** and the **lastGoodReports** stale cache), built **server/monitoring.js** (single-line JSON logs, SHA-256 key hashing, and the **GET /stats** endpoint), and put together the Week 13 versioning code (**v1.js**, **v2.js**, **deprecate.js**, **partner.js**, plus **version.test.js** and **partner.test.js**).

I pulled more weight in Weeks 11 through 13 when ShieldBox's tunnel kept lagging, **/stats** numbers needed verification, and the v2 routing conflict almost broke our Demo Day run sheet. To be fully honest, my teammates carried me through Weeks 3 to 8, however I did contribute. They set up the MySQL (**mysql2**) tables, wrote the core CRUD routes (**/memberships**, **/trainers**, **/schedules**, **/hours**, and **/users**), added **requireApiKey** auth and rate limiting, and handled the Week 8 Swagger UI (**/docs/**) swap with the Artist API team while I was tied up with some out of school personal issues for most of the semester.
