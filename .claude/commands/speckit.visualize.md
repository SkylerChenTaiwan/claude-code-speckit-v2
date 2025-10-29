---
description: Generate visual specifications (UI/UX designs, user flows, and API contracts) from the requirements spec.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command transforms the requirements spec (spec.md) into **visual specifications** that are human-readable and reviewable. This is Layer 2 of the four-layer spec system:

1. **Requirements Spec** (spec.md) - Simple user stories ← Created by `/speckit.specify`
2. **Visual Spec** (visual-spec/) - UI designs, flows, contracts ← **THIS COMMAND**
3. **Design Spec** (design-spec.yaml) - Technical design ← Created by `/speckit.plan`
4. **Implementation Spec** (implementation-spec.yaml) - From code ← Created during `/speckit.implement`

## Purpose

The visual spec layer serves as:
- **Review layer**: User can see UI mockups, flow diagrams, and API contracts
- **Contract layer**: Defines explicit agreements between frontend/backend
- **Communication layer**: Bridges business requirements and technical design

## Execution Steps

### Step 1: Setup and Load Context

```bash
# Run prerequisite check
.specify/scripts/bash/check-prerequisites.sh --json --paths-only
```

Parse JSON output for:
- `FEATURE_DIR`: The feature directory path
- `FEATURE_SPEC`: Path to spec.md

Read the requirements spec:
- `FEATURE_SPEC` (spec.md)

### Step 2: Analyze Requirements

Extract from spec.md:
1. **User Stories**: Each story with priority and acceptance scenarios
2. **Functional Requirements**: What the system must do
3. **Key Entities**: Data structures mentioned
4. **Success Criteria**: Measurable outcomes

### Step 3: Generate Visual Spec Structure

Create directory structure:
```
FEATURE_DIR/
└── visual-spec/
    ├── pages/           # Page-by-page UI specifications
    ├── flows/           # User flow diagrams
    ├── contracts/       # API contracts (frontend-backend agreements)
    └── components/      # Reusable UI component specs (if needed)
```

### Step 4: Generate Page Specifications

For each user story that involves UI:

1. **Identify pages needed**: Based on user scenarios in spec.md
2. **Generate page spec file**: `visual-spec/pages/[page-name].md`

**Page spec must include**:
- **Page Layout**: ASCII art or description of layout
- **Components**: Detailed specs for each UI element (inputs, buttons, etc.)
  - Label, placeholder, validation rules
  - Size, styling guidelines
  - States (default, hover, loading, error, disabled)
- **User Interactions**: Step-by-step scenarios
  - Successful paths
  - Error paths
  - Edge cases
- **API Contract** (if page calls APIs):
  - Exact request format
  - Exact response format
  - Error responses
  - Frontend behavior for each response

3. **Generate AI mockup** (optional but recommended):
   - Use ASCII art for simple layouts
   - Or generate description detailed enough that user can visualize

### Step 5: Generate User Flow Diagrams

For each user story:

1. **Create flow file**: `visual-spec/flows/[flow-name].md`
2. **Document flow steps**:
   ```
   1. User lands on [page]
   2. User sees [elements]
   3. User clicks [button]
   4. System shows [feedback]
   5. System calls [API]
   6. User redirects to [page]
   ```
3. **Include decision points**: What happens on success vs. error
4. **Generate flow diagram**: Use ASCII art or mermaid syntax

### Step 6: Generate API Contracts

For each API endpoint needed:

1. **Create contract file**: `visual-spec/contracts/[domain]-api.yaml`
2. **Use OpenAPI 3.0 format** (YAML)
3. **Include**:
   - Endpoint path and method
   - Request schema (exact field names, types, validation)
   - Response schemas (success and all error cases)
   - **Exact examples** (complete JSON)
   - **Exact error messages** (word-for-word)

**CRITICAL**: Field names must be EXACT. Not "user_id" vs "userId" ambiguity.

Example:
```yaml
/api/auth/login:
  post:
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
                minLength: 8
          example:
            email: "test@example.com"
            password: "ValidPass123"
    responses:
      '200':
        description: Login successful
        content:
          application/json:
            schema:
              type: object
              required: [user, token]
              properties:
                user:
                  type: object
                  properties:
                    id: { type: string, format: uuid }
                    email: { type: string }
                token: { type: string }
            example:
              user:
                id: "550e8400-e29b-41d4-a716-446655440000"
                email: "test@example.com"
              token: "eyJhbGci..."
      '401':
        description: Invalid credentials
        content:
          application/json:
            schema:
              type: object
              properties:
                error: { type: string, enum: ["Invalid credentials"] }
            example:
              error: "Invalid credentials"
```

### Step 7: Generate Index/Summary

Create `visual-spec/README.md`:
- List of all pages with links
- List of all flows with links
- List of all API contracts with links
- Quick reference for reviewers

### Step 8: User Review

**CRITICAL**: Present the visual spec to the user for review.

1. **Show page specs**: Display key pages (especially main user flows)
2. **Show flow diagrams**: Display critical user journeys
3. **Show API contracts**: Highlight frontend-backend agreements
4. **Ask for approval**:
   - "Does the UI layout match your expectations?"
   - "Are the user flows correct?"
   - "Are the API contracts reasonable?"
   - "Any changes needed before proceeding to technical design?"

5. **Handle feedback**:
   - If user requests changes: Update visual spec files
   - If user approves: Proceed to finalization

### Step 9: Finalization

1. **Validate visual spec completeness**:
   - Every user story has corresponding pages/flows
   - Every page that calls APIs has contract defined
   - Every contract has exact field names and examples

2. **Generate summary report**:
   ```
   Visual Spec Generated:
   - Pages: 3 (login.md, dashboard.md, settings.md)
   - Flows: 2 (login-flow.md, logout-flow.md)
   - Contracts: 1 (auth-api.yaml)

   Review checklist:
   ✅ All user stories covered
   ✅ UI layouts defined
   ✅ User flows documented
   ✅ API contracts specified
   ✅ Field names are exact
   ✅ Error messages are exact
   ```

3. **Update spec.md status**:
   - Add a section at the top indicating visual spec is complete

### Step 10: Report

Output:
- Path to visual-spec/ directory
- List of generated files
- Summary of what was created
- **Next command**: `/speckit.plan` (to generate design spec from visual spec)

## Guidelines

### Page Specification Guidelines

**DO**:
- Use exact labels, placeholders, button text
- Specify exact validation rules and error messages
- Define all UI states (loading, error, success, disabled)
- Include exact API contracts on the same page
- Use concrete examples (not "user data" but "test@example.com")

**DON'T**:
- Use vague terms ("nice UI", "good UX")
- Leave validation rules to "industry standards"
- Skip error states
- Separate API contracts from pages that use them

### API Contract Guidelines

**DO**:
- Use exact field names (not alternatives)
- Provide complete JSON examples
- Specify exact error messages (word-for-word)
- Use standard HTTP status codes
- Follow OpenAPI 3.0 spec

**DON'T**:
- Use ambiguous field names (avoid "userId" vs "user_id" confusion)
- Omit examples
- Use generic error messages ("Error occurred")
- Invent custom status codes

### Flow Diagram Guidelines

**DO**:
- Number steps sequentially
- Show decision points (if success / if error)
- Include all edge cases
- Reference specific pages and APIs

**DON'T**:
- Skip error paths
- Use vague steps ("process data")
- Omit UI feedback steps

## Example Output Structure

```
specs/001-user-auth/
├── spec.md                          # Requirements (already exists)
└── visual-spec/                     # Generated by this command
    ├── README.md                    # Index of all visual specs
    ├── pages/
    │   ├── login-page.md            # Login page UI spec
    │   └── dashboard-page.md        # Dashboard page UI spec
    ├── flows/
    │   ├── login-flow.md            # Login user flow
    │   └── password-reset-flow.md   # Password reset flow
    └── contracts/
        └── auth-api.yaml            # Authentication API contract
```

## Error Handling

- If spec.md is missing: ERROR "Run /speckit.specify first"
- If spec.md has no user stories: ERROR "No user stories found in spec"
- If spec.md has [NEEDS CLARIFICATION]: WARN "Resolve clarifications first with /speckit.clarify"

## Context for Generation

User-provided context: $ARGUMENTS

Use this context to guide visual spec generation (e.g., "focus on mobile UI", "emphasize API contracts", "detailed flow diagrams").
