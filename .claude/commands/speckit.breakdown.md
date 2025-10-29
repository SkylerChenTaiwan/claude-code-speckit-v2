---
description: Break down design spec into Work Packages with contract verification points.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command transforms **design specifications** into **Work Packages** (executable work units for parallel development). This bridges Layer 3 and Layer 4:

1. **Requirements Spec** (spec.md) - Simple user stories
2. **Visual Spec** (visual-spec/) - UI designs, flows, contracts
3. **Design Spec** (design-spec.yaml) - Technical design ← **INPUT**
4. **Implementation Spec** (implementation-spec.yaml) - From code

Each Work Package represents a **small, independent unit of work** that:
- Can be completed within one AI context window (~30K tokens)
- Has clear inputs (design spec sections) and outputs (code files)
- Can be verified against the design spec (contract testing)
- **MUST have ZERO dependencies** - Can be developed in parallel with ALL other Work Packages

## Purpose

Work Packages solve the problems of:
- **AI context limits**: Each WP is small enough to fit in one conversation
- **AI memory**: Each WP is self-contained with all needed information
- **Parallel development**: Multiple AIs can work on different WPs simultaneously
- **Verification**: Each WP can be verified against design spec independently

## Execution Steps

### Step 1: Setup and Prerequisites

```bash
# Run prerequisite check
.specify/scripts/bash/check-prerequisites.sh --json --paths-only
```

Parse JSON output for:
- `FEATURE_DIR`: The feature directory path

**Check prerequisites**:
- `FEATURE_DIR/spec.md` must exist
- `FEATURE_DIR/visual-spec/` must exist
- `FEATURE_DIR/design-spec.yaml` must exist
- If design spec is missing: ERROR "Run /speckit.plan first"

**Load context**:
1. Read `FEATURE_DIR/spec.md` (user stories)
2. Read `FEATURE_DIR/visual-spec/contracts/*.yaml` (API contracts)
3. Read `FEATURE_DIR/design-spec.yaml` (technical design)

### Step 2: 垂直切分功能（Zero Dependency）

**核心原則：每個 WP 是一個完整的垂直功能切片**

不要按技術層切分（Model、Service、API、UI 分開），而是按**功能**垂直切分。

#### ❌ 錯誤的切分方式（水平切分，有相依性）
```
WP001: User Model (後端)
WP002: Auth Service (後端，相依 WP001)
WP003: Login API (後端，相依 WP002)
WP004: Login Page (前端，相依 WP003)
```
**問題**：必須循序執行，無法平行開發！

#### ✅ 正確的切分方式（垂直切分，零相依）
```
WP001: 登入功能（完整）
  - Model: User
  - API: POST /api/auth/login
  - UI: LoginPage
  - Tests: login.test.ts

WP002: 註冊功能（完整）
  - Model: User (如果需要額外欄位，自己加)
  - API: POST /api/auth/register
  - UI: RegisterPage
  - Tests: register.test.ts

WP003: 密碼重設功能（完整）
  - API: POST /api/auth/reset
  - UI: ResetPasswordPage
  - Email: 發送重設連結
  - Tests: reset.test.ts
```

**每個 WP 完全獨立，可以同時開始執行！**

### Step 3: 確保至少 6 個 Work Packages

**最少數量**：無論功能大小，至少拆成 **6 個 WP**

**原因**：
- 提供足夠的平行開發機會
- 降低單個 WP 的複雜度
- 每個 WP 更容易驗證

**數量指南**：
- 小型功能（1-3 個 User Stories）：6-8 個 WP
- 中型功能（4-7 個 User Stories）：8-12 個 WP
- 大型功能（8+ 個 User Stories）：15+ 個 WP

### Step 4: 垂直切分策略

**按功能切分，每個 WP 包含**：
1. **自己的資料模型**（如果需要）
2. **自己的後端 API**
3. **自己的前端 UI**
4. **自己的測試**（TDD）

**允許重複**：
- 如果多個 WP 需要相同的元件（如 Button），每個 WP 自己建立
- **整合時再去重複**（未來會有 `/speckit.integrate` 指令）

**檔案隔離**：
- WP001: `src/features/login/*`
- WP002: `src/features/register/*`
- WP003: `src/features/reset-password/*`
- 不會修改到其他 WP 的檔案

**大小指南**：每個 WP 應該：
- 200-500 行程式碼
- 可在 1-2 小時內完成
- 包含 2-5 個 tasks

### Step 5: 每個 WP 必須包含測試（TDD）

**重要**：每個 Work Package 都必須採用 **TDD（測試驅動開發）**

在每個 WP 的 tasks 中，必須包含：
1. **Task 1**: 寫測試（先寫失敗的測試）
2. **Task 2**: 實作功能（讓測試通過）
3. **Task 3**: 重構（如果需要）

**為什麼需要 TDD？**
- 每個 WP 獨立開發，必須獨立驗證
- 整合前就能確保功能正確
- 避免整合時才發現問題

### Step 6: Generate Work Package Directory Structure

Create:
```
FEATURE_DIR/
└── work-packages/
    ├── WP001-login-feature/
    │   ├── README.md              # WP 概述和目標
    │   ├── task-001-write-tests.md        # Task 1: 寫測試
    │   ├── task-002-implement-api.md      # Task 2: 實作 API
    │   ├── task-003-implement-ui.md       # Task 3: 實作 UI
    │   ├── task-004-integration.md        # Task 4: 整合測試
    │   ├── contract-expected.yaml         # 整個 WP 的契約
    │   └── journal.md                     # 工作日誌
    │
    ├── WP002-register-feature/
    │   ├── README.md
    │   ├── task-001-write-tests.md
    │   ├── task-002-implement-api.md
    │   ├── task-003-implement-ui.md
    │   ├── task-004-email-integration.md
    │   ├── contract-expected.yaml
    │   └── journal.md
    │
    └── WP003-reset-password-feature/
        └── ...
```

### Step 7: Load Templates

Before generating Work Package files, load the templates:

```bash
cat .specify/templates/wp-readme-template.md
cat .specify/templates/task-template.md
cat .specify/templates/contract-expected-template.yaml
cat .specify/templates/journal-template.md
```

These templates define the **exact structure** for all Work Package files.

### Step 8: Generate README.md for Each WP

Using `wp-readme-template.md`, create README.md for each Work Package by filling in:

1. **Metadata**: WP ID, name, status, timestamp
2. **Overview**: What this WP implements (one clear sentence)
3. **Objectives**: What should be accomplished, which User Stories are covered
4. **Tasks Breakdown**: List of 2-5 tasks
5. **Dependencies**: Explicitly state "零相依" (zero dependencies)
6. **Deliverables**: List of files that will be created
7. **Contract**: Key contract requirements this WP must meet
8. **Verification**: How this WP will be verified
9. **Traceability**: Links back to design-spec.yaml sections

**Key principle**: Follow the template structure exactly - do not add or remove sections

### Step 9: Generate Task Files for Each WP

Using `task-template.md`, create 2-5 task files for each Work Package.

每個 Work Package 必須分解成 2-5 個小任務（task），每個 task 是一個獨立的 markdown 檔案。

**Task 命名規則**：
- `task-001-write-tests.md` - 寫測試（TDD 第一步）
- `task-002-implement-backend.md` - 實作後端
- `task-003-implement-frontend.md` - 實作前端
- `task-004-integration.md` - 整合測試

**Fill in the template with**:
1. **Task metadata**: WP ID, task ID, type, estimated time, dependencies
2. **Task objective**: One clear sentence describing the task
3. **TDD flow**: Specific test examples for this task
4. **Contract section**: Extract relevant contract requirements
5. **Files to create**: Specific file paths
6. **Test examples**: Concrete test cases for this task
7. **Completion checklist**: Task-specific checklist items

**Key principle**: Follow task-template.md structure exactly

**Task 拆分範例**（WP001: 登入功能）：

```
task-001-write-tests.md
  - 寫登入 API 測試
  - 寫登入 UI 測試

task-002-implement-api.md
  - 實作 User Model
  - 實作 POST /api/auth/login
  - 讓 API 測試通過

task-003-implement-ui.md
  - 實作 LoginPage 元件
  - 實作表單驗證
  - 讓 UI 測試通過

task-004-integration.md
  - 整合 API 和 UI
  - 端對端測試
```

### Step 10: Generate contract-expected.yaml for Each WP

Using `contract-expected-template.yaml`, create the contract file for each Work Package.

**Fill in the template with**:
1. **Work package metadata**: ID, name, type
2. **Data model**: If this WP implements a model, extract all fields with exact types and validation
3. **API endpoints**: If this WP implements APIs, extract exact request/response schemas
4. **UI components**: If this WP implements UI, extract exact element IDs, labels, placeholders
5. **Validation rules**: ALL validation rules (client-side and server-side)
6. **Error messages**: EXACT error messages (word-for-word)
7. **Testing requirements**: Required test cases
8. **File structure**: Expected files after implementation
9. **Traceability**: Links back to design-spec.yaml and visual-spec/
10. **Verification points**: What will be checked during verification

**Key principle**: Contract must be EXACT and COMPLETE - no interpretation, no hallucination

This contract is what `/speckit.verify` will compare against.

### Step 11: Generate journal.md for Each WP

Using `journal-template.md`, create an empty journal file for each Work Package.

The journal will be filled in during implementation as tasks are completed. It records:
- What was done
- Files created/modified
- Test results
- Important decisions
- Problems encountered and solutions

**Key principle**: Create empty journal with template structure - AI will fill it in during implementation

### Step 12: Generate Work Package Summary

Create `FEATURE_DIR/work-packages/README.md`:
```markdown
# Work Packages: [Feature Name]

**Generated**: [DATE]
**Source**: design-spec.yaml
**Total WPs**: [X]

## Execution Order

### Phase 1: Foundational (no dependencies)
- WP001: User Model
- WP002: Session Model

### Phase 2: Services (depends on Phase 1)
- WP003: Auth Service (depends on WP001, WP002)

### Phase 3: APIs (depends on Phase 2)
- WP004: Login API (depends on WP003)
- WP005: Logout API (depends on WP003)

### Phase 4: Frontend (depends on API contracts)
- WP006: Login Page (depends on WP004 contract)
- WP007: Dashboard Page (depends on WP005 contract)

## Parallel Opportunities

**Can run in parallel**:
- Phase 1: WP001 + WP002 (different models)
- Phase 3: WP004 + WP005 (different APIs, but same service)
- Phase 4: WP006 + WP007 (different pages)

**Must run sequentially**:
- Phase 1 → Phase 2 → Phase 3 → Phase 4

## Contract Verification Points

After each WP completes, run:
```bash
/speckit.verify --wp WP[###]
```

This will:
1. Extract contract from implemented code
2. Compare with contract-expected.yaml
3. Report PASS or FAIL

## Integration Verification

Before merging frontend + backend, run:
```bash
/speckit.verify --integration
```

This will:
1. Compare all backend contract-implementation.yaml
2. With all frontend contract-expectation.yaml
3. Ensure frontend expectations match backend implementations
```

### Step 13: Report

Output:
- Path to work-packages/ directory
- Total number of WPs generated
- Breakdown by type (X backend, Y frontend)
- Dependency graph summary
- Parallel opportunities identified
- **Next command**: `/speckit.implement --wp WP001` (start implementing)

## Guidelines

### Work Package Sizing

**Good WP** (right size):
- 200-500 lines of code
- 1-3 files
- Can be described in < 2 pages
- Has < 5 dependencies

**Too Large** (split it):
- > 1000 lines of code
- > 5 files
- Description is > 5 pages
- AI will lose context

**Too Small** (merge it):
- < 50 lines of code
- Trivial work (copy-paste)
- No value in isolation

### Contract Verification

**What to verify**:
- Field names (EXACT match)
- Field types (EXACT match)
- Validation rules (ALL implemented)
- Error messages (WORD-FOR-WORD)

**What NOT to verify** (implementation details):
- Variable names in code
- Function names
- Code structure
- Comments

### Dependency Management

**Clear dependencies**:
- WP003 depends on WP001 ← Good (explicit)

**Avoid hidden dependencies**:
- WP003 assumes WP001 has field "username" but WP001 contract doesn't specify it ← Bad

**Use contracts to communicate**:
- WP001's contract-expected.yaml defines what it must provide
- WP003's assignment.md references WP001's contract
- No hidden assumptions

## Error Handling

- If design-spec.yaml is missing: ERROR "Run /speckit.plan first"
- If design-spec.yaml has no data_models: ERROR "No data models found in design spec"
- If circular dependencies detected: ERROR "Circular dependency: WP### → WP### → WP###"

## Context for Breakdown

User-provided context: $ARGUMENTS

Use this context to guide breakdown strategy (e.g., "focus on backend first", "frontend WPs should be small", "prioritize authentication WPs").
