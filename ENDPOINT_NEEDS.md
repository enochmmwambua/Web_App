# Week 3: GymBuddy API Endpoint List

This document translates our Week 2 API Needs Statements (for our downstream partner, NyumbaHub) into RESTful endpoints.

## Drafted Endpoints

| Method | Path | Purpose | Maps to Need |
| :--- | :--- | :--- | :--- |
| GET | /memberships | Return all active gym membership tiers and pricing. | "Team 10 needs to read membership tiers..." |
| POST | /users | Register a new tenant as a GymBuddy user. | "Team 10 needs to create a user account..." |
| GET | /trainers | Return active personal trainers and their specializations. | "Team 10 needs to read the list of trainers..." |
| GET | /testimonials | Return verified member success stories for social proof. | "Team 10 needs to read member success stories..." |
| GET | /schedules | Return group class schedules to highlight community events. | "Team 10 needs to read group class schedules..." |
| GET | /hours?status=open | Return gym operating hours and facility availability. | "Team 10 needs to read gym operating hours..." |

## Peer Review & Revisions
* **Feedback received:** "Row 2 path was `/createUser` which is a verb. Needs to be a resource noun."
* **Action taken:** Fixed. Changed path to `/users` and relied on the `POST` method to carry the action.
* **Feedback received:** "Row 6 needs a way to filter for current availability rather than nesting."
* **Action taken:** Fixed. Added the `?status=open` query parameter to the `/hours` endpoint to demonstrate proper filtering.