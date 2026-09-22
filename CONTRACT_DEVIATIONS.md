## Week 6 Deviations
- Endpoint: `POST /users`
  - Scope: Implemented in accordance with `openapi.yaml`.
  - Responses: `201 Created` for valid registrations, `400 Bad Request` for validation failures and duplicate email conflicts.
  - Deviations: None.

### Testing Evidence

#### 1. Happy Path (201 Created)
![POST /users 201 Success](<ss/Screenshot 2026-09-23 024255.png>)

#### 2. Invalid Email Format (400 Bad Request)
![Invalid Email Format 400](<ss/Screenshot 2026-09-23 023624.png>)

#### 3. Duplicate Email (400 Bad Request)
![Duplicate Email 400](<ss/Screenshot 2026-09-23 023747.png>)

#### 4. Invalid Data Type (400 Bad Request)
![Invalid Data Type 400](<ss/Screenshot 2026-09-23 023633.png>)

#### 5. Missing Required Field (400 Bad Request)
![Missing Required Field 400](<ss/Screenshot 2026-09-23 024350.png>)