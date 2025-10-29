---
description: Verify Work Package implementation against expected contract.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command verifies that implemented code matches the expected contract. This is the **core mechanism** that ensures AI doesn't add hallucinated features or deviate from the design spec.

**Verification happens at two levels**:
1. **Single WP Verification**: Does WP[###]'s code match its contract-expected.yaml?
2. **Integration Verification**: Do frontend and backend contracts align?

## Purpose

Contract verification solves:
- **AI hallucination**: Detects when AI adds fields/features not in spec
- **Field name mismatches**: Catches "userId" vs "user_id" problems
- **Missing implementations**: Detects when AI skips required fields
- **Frontend-backend misalignment**: Ensures APIs match what frontend expects

**Key principle**: Verification compares **structure**, not implementation details.

## Modes

### Mode 1: Single Work Package Verification

```bash
/speckit.verify --wp WP001
```

Verifies one Work Package against its expected contract.

### Mode 2: Integration Verification

```bash
/speckit.verify --integration
```

Verifies all frontend-backend contract pairs align.

### Mode 3: Full Feature Verification

```bash
/speckit.verify --all
```

Runs all WP verifications + integration verification.

## Execution: Mode 1 (Single WP)

### Step 1: Setup

Parse arguments:
- `--wp WP[###]`: Which Work Package to verify

Locate:
- `FEATURE_DIR/work-packages/WP[###]/contract-expected.yaml`
- `FEATURE_DIR/work-packages/WP[###]/` (implementation directory)

### Step 2: Extract Contract from Implementation

Scan implementation files to extract the **actual contract**:

**For backend** (data models, APIs):
- Find model definition files (e.g., `src/models/user.model.ts`)
- Extract field definitions
- Extract validation rules
- Extract API endpoint definitions
- Extract request/response schemas

**For frontend** (components, API calls):
- Find API call code (e.g., `axios.post(...)`)
- Extract expected request format
- Extract expected response handling
- Extract field access patterns (e.g., `response.data.user.id`)

Generate: `contract-implementation.yaml`

**Example** (WP001: User Model):
```yaml
# contract-implementation.yaml (extracted from code)

model:
  name: User
  fields:
    id:
      type: uuid
      source_code: "src/models/user.model.ts:12"
    email:
      type: string
      validation: [required, email, maxLength: 255]
      source_code: "src/models/user.model.ts:13"
    passwordHash:
      type: string
      validation: [required, minLength: 60]
      source_code: "src/models/user.model.ts:14"
    username:
      type: string
      source_code: "src/models/user.model.ts:15"  # ← EXTRA FIELD!

  database:
    table: users
    indexes: [[email]]
```

### Step 3: Compare Contracts

Load both:
- `contract-expected.yaml` (what should be implemented)
- `contract-implementation.yaml` (what was actually implemented)

**Comparison algorithm**:
```
FOR EACH field in contract-expected:
  IF field NOT in contract-implementation:
    REPORT: Missing field
  ELSE:
    IF types don't match:
      REPORT: Type mismatch
    IF validation rules don't match:
      REPORT: Validation mismatch

FOR EACH field in contract-implementation:
  IF field NOT in contract-expected:
    REPORT: Extra field (hallucination!)
```

### Step 4: Generate Diff Report

Create: `FEATURE_DIR/work-packages/WP[###]/verification-report.md`

```markdown
# Verification Report: WP001 User Model

**Verified**: 2025-01-15 16:30
**Status**: ❌ FAILED

## Contract Comparison

### Expected Contract
Source: `contract-expected.yaml`
```yaml
fields:
  id: uuid
  email: string
  passwordHash: string
```

### Implemented Contract
Source: `contract-implementation.yaml` (extracted from code)
```yaml
fields:
  id: uuid
  email: string
  passwordHash: string
  username: string  # ← EXTRA!
```

## Issues Found

### ❌ Extra Field: `username`
- **Severity**: ERROR
- **Location**: src/models/user.model.ts:15
- **Issue**: Field `username` is not in contract-expected.yaml
- **Action**: Remove this field from implementation

### ✅ Field `id`: OK
- Type matches: uuid
- Implementation: src/models/user.model.ts:12

### ✅ Field `email`: OK
- Type matches: string
- Validation matches: required, email, maxLength 255
- Implementation: src/models/user.model.ts:13

### ✅ Field `passwordHash`: OK
- Type matches: string
- Validation matches: required, minLength 60
- Implementation: src/models/user.model.ts:14

## Summary

- **Total expected fields**: 3
- **Total implemented fields**: 4
- **Matching fields**: 3
- **Missing fields**: 0
- **Extra fields**: 1 ❌
- **Type mismatches**: 0
- **Validation mismatches**: 0

## Verdict

❌ **FAILED**: Implementation does not match contract

**Required actions**:
1. Remove field `username` from src/models/user.model.ts:15

## Re-verification

After fixing, run:
```bash
/speckit.verify --wp WP001
```
```

### Step 5: Report Results

Output to user:
- Verification status (PASS or FAIL)
- Number of issues found
- Path to detailed report
- If FAILED: List of required actions

## Execution: Mode 2 (Integration Verification)

### Step 1: Identify Contract Pairs

Scan all Work Packages to find:
- **Backend WPs**: Those with API endpoints
- **Frontend WPs**: Those with API calls

Build pairs:
```
WP004 (Login API - backend) ↔ WP006 (Login Page - frontend)
  Contract: POST /api/auth/login

WP005 (Logout API - backend) ↔ WP007 (Dashboard - frontend)
  Contract: POST /api/auth/logout
```

### Step 2: For Each Pair, Compare Contracts

**Extract from backend WP**:
```yaml
# WP004/contract-implementation.yaml (backend)
endpoint: /api/auth/login
method: POST
response:
  success:
    schema:
      user: { id: uuid, email: string }
      token: string
```

**Extract from frontend WP**:
```yaml
# WP006/contract-expectation.yaml (frontend)
endpoint: /api/auth/login
method: POST
expected_response:
  user: { id: uuid, email: string }
  token: string
```

**Compare**:
- Backend provides: `user.id, user.email, token`
- Frontend expects: `user.id, user.email, token`
- Match: ✅

### Step 3: Generate Integration Report

Create: `FEATURE_DIR/verification/integration-report.md`

```markdown
# Integration Verification Report

**Verified**: 2025-01-15 17:00
**Status**: ✅ PASS

## Contract Pairs Verified

### Pair 1: Login API

**Backend**: WP004 (Login API)
**Frontend**: WP006 (Login Page)
**Endpoint**: POST /api/auth/login

**Backend provides**:
```yaml
response:
  user: { id: uuid, email: string }
  token: string
```

**Frontend expects**:
```yaml
response:
  user: { id: uuid, email: string }
  token: string
```

**Result**: ✅ MATCH

---

### Pair 2: Logout API

**Backend**: WP005 (Logout API)
**Frontend**: WP007 (Dashboard Page)
**Endpoint**: POST /api/auth/logout

**Backend provides**:
```yaml
response:
  success: boolean
```

**Frontend expects**:
```yaml
response:
  success: boolean
```

**Result**: ✅ MATCH

---

## Summary

- **Total contract pairs**: 2
- **Matching pairs**: 2
- **Mismatching pairs**: 0

## Verdict

✅ **PASS**: All frontend-backend contracts align

**Ready for integration**: Backend and frontend can be merged.
```

## Execution: Mode 3 (Full Verification)

Run Mode 1 for all WPs + Mode 2:

```
Verifying WP001... ✅ PASS
Verifying WP002... ✅ PASS
Verifying WP003... ✅ PASS
Verifying WP004... ❌ FAIL (1 issue)
Verifying WP005... ✅ PASS
Verifying WP006... ✅ PASS

Integration verification... ✅ PASS

Overall: ❌ FAIL (1 WP failed)

See: FEATURE_DIR/verification/full-report.md
```

## Contract Extraction Strategies

### For TypeScript/JavaScript (Backend)

**Model extraction**:
```typescript
// src/models/user.model.ts
interface User {
  id: string;           // → type: uuid (infer from naming)
  email: string;        // → type: string
  passwordHash: string; // → type: string
}

// Extract to:
fields:
  id: { type: uuid }
  email: { type: string }
  passwordHash: { type: string }
```

**API endpoint extraction**:
```typescript
// src/api/auth.ts
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // ...
  res.json({ user: { id, email }, token });
});

// Extract to:
endpoint: /api/auth/login
method: POST
request:
  fields: [email, password]
response:
  fields: { user: { id, email }, token }
```

### For TypeScript/JavaScript (Frontend)

**API call extraction**:
```typescript
// src/pages/LoginPage.tsx
const response = await axios.post('/api/auth/login', {
  email, password
});
const { user, token } = response.data;
console.log(user.id, user.email);

// Extract to:
endpoint: /api/auth/login
method: POST
request: { email, password }
expected_response: { user: { id, email }, token }
```

### For Python (Backend)

**Model extraction**:
```python
# models/user.py
class User(Model):
    id = UUIDField(primary_key=True)
    email = EmailField(max_length=255)
    password_hash = CharField(max_length=60)

# Extract to:
fields:
  id: { type: uuid }
  email: { type: string, validation: [email, maxLength: 255] }
  password_hash: { type: string, validation: [maxLength: 60] }
```

## Error Handling

- If WP directory not found: ERROR "WP[###] does not exist"
- If contract-expected.yaml missing: ERROR "Run /speckit.breakdown first"
- If no implementation files found: ERROR "WP[###] has no implementation yet"
- If unable to extract contract: WARN "Manual verification needed"

## Automatic Fix (Optional)

```bash
/speckit.verify --wp WP001 --auto-fix
```

If auto-fix is enabled and issues are found:
1. Generate fix instructions
2. Call AI to fix the code
3. Re-verify
4. Repeat until PASS or max iterations (3)

## Context for Verification

User-provided context: $ARGUMENTS

Use this context to guide verification (e.g., "strict mode - fail on any deviation", "lenient - allow extra fields if not breaking").
