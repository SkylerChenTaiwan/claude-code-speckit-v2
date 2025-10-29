---
description: Implement a specific Work Package with contract verification.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command implements a **single Work Package** from the breakdown created by `/speckit.breakdown`. This is the core implementation step in the four-layer spec system:

1. **Requirements Spec** (spec.md) - Simple user stories
2. **Visual Spec** (visual-spec/) - UI designs, flows, contracts
3. **Design Spec** (design-spec.yaml) - Technical design
4. **Work Packages** (work-packages/) - Implementation units ← **THIS COMMAND**

Each Work Package is:
- Small enough to fit in one AI context (~30K tokens)
- Self-contained with all necessary information
- Independently verifiable against its contract
- Can be developed in parallel with other independent WPs

## Purpose

This command:
- Executes implementation for a specific Work Package
- Follows the exact contract specified in contract-expected.yaml
- Records decisions and progress in journal.md
- Produces code that can be verified by `/speckit.verify`

**Key principle**: AI translates spec to code, does NOT make design decisions.

## Execution Steps

### Step 1: Setup and Parse Arguments

Parse arguments:
- `--wp WP[###]`: Which Work Package to implement (required)
- `--auto-verify`: Automatically run verification after implementation (optional)

Example:
```bash
/speckit.implement --wp WP001
/speckit.implement --wp WP002 --auto-verify
```

### Step 2: Locate Work Package

```bash
# Run prerequisite check
.specify/scripts/bash/check-prerequisites.sh --json --paths-only
```

Parse JSON output for:
- `FEATURE_DIR`: The feature directory path

Locate Work Package:
- `FEATURE_DIR/work-packages/WP[###]/`
- If not found: ERROR "Work Package WP[###] does not exist. Run /speckit.breakdown first."

### Step 3: Load Work Package Context

**Read files in this order**:

1. **`work-packages/WP[###]/README.md`** (REQUIRED - Start here)
   - Overview of the Work Package
   - Objectives and success criteria
   - List of tasks to complete
   - Dependencies (should be 零相依 - zero dependencies)
   - Deliverables (what files to create)
   - Contract summary

2. **`work-packages/WP[###]/contract-expected.yaml`** (REQUIRED - This is your contract)
   - EXACT data model fields with types and validation
   - EXACT API request/response schemas
   - EXACT error messages (word-for-word)
   - EXACT validation rules (must implement ALL)
   - This is what `/speckit.verify` will check against

3. **`work-packages/WP[###]/task-00X-[name].md`** (REQUIRED - Read the task you're working on)
   - Specific instructions for this task
   - TDD flow (Red-Green-Refactor)
   - Contract sections relevant to this task
   - Test examples
   - Files to create for this task
   - Completion checklist

4. **`work-packages/WP[###]/journal.md`** (REQUIRED - You will write to this)
   - Record of all implementation decisions
   - Problems encountered and solutions
   - Files created/modified
   - Test results
   - You must update this as you work

**OPTIONAL files for additional context**:
- `design-spec.yaml#[section]` - Full technical design (for broader context)
- `visual-spec/contracts/[relevant].yaml` - Original API contracts (for clarification)
- `visual-spec/pages/[relevant].md` - UI specifications (for frontend WPs)

### Step 4: Check Dependencies

From `README.md`, check the dependencies section:

```markdown
## 🔗 Dependencies

**重要**: 此 Work Package **零相依**

- ✅ 可以立即開始執行
- ✅ 不需要等待其他 Work Package
- ✅ 可與所有其他 WP 平行執行
```

**In the new workflow, all Work Packages should have ZERO dependencies**. If README.md shows dependencies, this is an error in the breakdown.

If dependencies are listed:
1. Check if `work-packages/WP[dep]/verification-report.md` exists
2. Check if status is ✅ PASS
3. If any dependency is incomplete: ERROR "Dependency WP[dep] not completed"

But ideally, this should never happen because all WPs are designed to be independent.

### Step 5: Determine Which Task to Execute

Parse the user's input to determine which task to work on:

**Argument formats**:
- `/speckit.implement WP001` - Start with task-001 (default)
- `/speckit.implement WP001/task-002` - Execute specific task
- `/speckit.implement WP001 --auto-verify` - Execute and verify

**Task Selection Logic**:
1. If specific task specified: Use that task
2. If no task specified: Check journal.md for last completed task, use next task
3. If journal is empty: Start with task-001

Example: If journal shows task-001 and task-002 completed, automatically select task-003.

### Step 6: Read the Task File

Read `work-packages/WP[###]/task-00X-[name].md` to understand:
- What this specific task requires
- TDD steps (Red-Green-Refactor)
- Contract sections relevant to this task
- Test examples
- Files to create/modify
- Completion checklist

**Follow the task instructions exactly** - the task file is your detailed guide.

### Step 7: Update Journal - Start Session

Append to `work-packages/WP[###]/journal.md` using the template structure:

```markdown
## Session X: Task-00X - [Task Name]

**執行時間**: [START_TIME] - [將在完成時更新]
**狀態**: ⏳ 進行中

### 做了什麼
[將在執行過程中記錄]

### 建立的檔案
[將記錄建立的檔案]

### 修改的檔案
[將記錄修改的檔案]

### 測試結果
[將記錄測試結果]

### 重要決定
[將記錄重要決定]

### 遇到的問題
[將記錄問題和解決方法]

### 契約檢查
- [ ] 所有欄位名稱與 contract-expected.yaml 一致
- [ ] 所有驗證規則已實作
- [ ] 錯誤訊息與契約完全相同
- [ ] 沒有新增契約外的欄位
```

### Step 8: Execute Implementation (TDD Flow)

**Follow the TDD flow from the task file**:

#### Step 8.1: Write Tests First (Red) 🔴

**IMPORTANT**: Always write tests FIRST, before implementation.

1. Read the test examples from the task file
2. Create test file (e.g., `[feature].test.ts`)
3. Write failing tests that define expected behavior:
   - Success path tests (happy path)
   - Error path tests (validation failures, edge cases)
   - All validation rules from contract
4. Run tests: `npm test` (or test command from design-spec.yaml)
5. **Verify tests FAIL** - this confirms tests are valid

#### Step 8.2: Implement Code (Green) 🟢

Now implement the MINIMUM code to make tests pass:

**For backend (models, services, APIs)**:
- Use EXACT field names from contract-expected.yaml
- Implement ALL validation rules from contract
- Use EXACT error messages from contract (word-for-word)
- Follow file structure from design-spec.yaml

**For frontend (pages, components)**:
- Use EXACT element IDs, labels, placeholders from contract
- Call APIs with EXACT field names from contract
- Display EXACT error messages from contract
- Follow component structure from design-spec.yaml

**Critical rules**:
- ✅ Use EXACT field names from contract (no interpretation)
- ✅ Implement ALL required fields (no skipping)
- ✅ Use EXACT validation rules from contract (no changes)
- ✅ Use EXACT error messages from contract (word-for-word)
- ❌ DO NOT add fields not in contract (no hallucination)
- ❌ DO NOT change field types
- ❌ DO NOT skip validation rules

#### Step 8.3: Run Tests Again

Run tests: `npm test`

**Expected**: ✅ All tests pass

If tests fail:
1. Review error messages
2. Check contract compliance
3. Fix implementation
4. Re-run tests
5. Repeat until all pass

#### Step 8.4: Refactor (Refactor) 🔵

If needed, refactor code while keeping tests passing:
- Eliminate duplication
- Improve naming
- Optimize structure
- Re-run tests after each refactor

**IMPORTANT**: Tests must stay passing during refactoring.

### Step 9: Update Journal with Progress

As you work, continuously update the session section in journal.md:

```markdown
### 做了什麼
- 建立測試檔案 src/features/login/login.test.ts
- 寫了 5 個測試案例（成功登入、錯誤密碼、錯誤 email 格式、空欄位、SQL injection 防護）
- 執行測試：5 個測試全部失敗（符合 Red 階段預期）
- 實作 User Model：id, email, passwordHash 欄位
- 實作 Login API：POST /api/auth/login
- 執行測試：5 個測試全部通過（Green 階段完成）

### 建立的檔案
- `src/features/login/login.model.ts` (45 行) - User model 定義
- `src/features/login/login.service.ts` (78 行) - 登入業務邏輯
- `src/features/login/login.controller.ts` (52 行) - API endpoint
- `src/features/login/login.test.ts` (124 行) - 測試檔案

### 修改的檔案
- `src/app.ts` (新增 3 行) - 註冊 login route

### 測試結果
- 測試數量：5 個
- 測試通過：5 個
- 測試失敗：0 個
- 測試覆蓋率：87%

### 重要決定

#### 決定 1: 密碼雜湊演算法
**問題**: contract 只說要 passwordHash，沒說用什麼演算法
**選項**:
- 選項 A: bcrypt (業界標準)
- 選項 B: argon2 (更安全但較新)
**決定**: 選擇 bcrypt
**原因**: constitution.md 指定使用 bcrypt，且專案其他地方也在用

### 遇到的問題

#### 問題 1: email 驗證正則表達式
**描述**: contract 要求 email 格式驗證，但沒有指定正則表達式
**解決方法**: 使用 visual-spec/contracts/auth-api.yaml 中的範例，採用標準 RFC 5322 簡化版
**耗時**: 10 分鐘

### 契約檢查
- [x] 所有欄位名稱與 contract-expected.yaml 一致
- [x] 所有驗證規則已實作
- [x] 錯誤訊息與契約完全相同
- [x] 沒有新增契約外的欄位
```

### Step 10: Mark Task Complete

Update the session status in journal.md:

```markdown
**執行時間**: [START_TIME] - [END_TIME]
**狀態**: ✅ 完成
```

If this was the last task in the Work Package, update README.md status:

```markdown
**Status**: ✅ 已完成（等待驗證）
```

### Step 11: Auto-Verify (if --auto-verify flag used)

If `--auto-verify` flag was provided:
```bash
/speckit.verify --wp WP[###]
```

This will:
1. Extract contract from implemented code
2. Compare with contract-expected.yaml
3. Generate verification report
4. Show PASS or FAIL status

### Step 12: Report Completion

Output to user:
```
Task Complete: WP[###] / Task-00X - [Task Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Status: Completed

📁 Files created/modified:
  - src/features/[feature]/[file1].ts (45 lines)
  - src/features/[feature]/[file2].test.ts (124 lines)

🧪 Tests:
  - Total: 5
  - Passed: 5
  - Failed: 0
  - Coverage: 87%

📋 Contract Checklist:
  - ✅ All field names match contract
  - ✅ All validations implemented
  - ✅ Error messages match exactly
  - ✅ No extra fields added

📝 Journal: work-packages/WP[###]/journal.md
  - Session recorded with decisions and problems

Next steps:
  1. If more tasks remain: /speckit.implement WP[###]/task-[next]
  2. If all tasks complete: /speckit.verify --wp WP[###]
  3. After verification passes: Proceed to next Work Package
```

## Implementation Guidelines

### Field Name Strictness

**ALWAYS use exact names from contract**:
- Contract says `user_id` → Use `user_id` (NOT `userId`)
- Contract says `email` → Use `email` (NOT `userEmail`)
- Contract says `passwordHash` → Use `passwordHash` (NOT `password_hash`)

### Validation Rules

**Implement ALL validation rules**:
```yaml
# contract-expected.yaml
fields:
  email:
    type: string
    validation: [required, email, maxLength: 255]
```

Translates to (TypeScript example):
```typescript
email: {
  type: String,
  required: true,
  validate: {
    validator: (v) => /\S+@\S+\.\S+/.test(v),
    message: 'Invalid email format'
  },
  maxlength: 255
}
```

### Error Messages

**Use EXACT error messages from contract**:
```yaml
# contract-expected.yaml
error_messages:
  invalid_credentials: "Invalid credentials"
```

Code:
```typescript
throw new Error("Invalid credentials"); // EXACT match
```

### No Hallucination

**Do NOT add features not in contract**:
```yaml
# contract-expected.yaml has: id, email, passwordHash
```

❌ BAD:
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  username: string; // ← NOT in contract!
}
```

✅ GOOD:
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
}
```

### When Unclear

**If something is unclear**:
1. Log the question in journal.md
2. Check visual-spec/ for clarification
3. Check design-spec.yaml for context
4. If still unclear: Follow contract literally, document assumption
5. Verification will catch if assumption is wrong

## Error Handling

- If WP directory not found: ERROR "Run /speckit.breakdown first"
- If README.md missing: ERROR "Corrupted Work Package structure"
- If contract-expected.yaml missing: ERROR "No contract found for this WP"
- If task file missing: ERROR "Task file not found. Check WP[###]/README.md for task list"
- If dependencies not met: ERROR "Complete WP[###] first"
- If tests fail after implementation: ERROR "Tests failing. Review and fix before proceeding"
- If files already exist and user didn't approve overwrite: WARN "Files exist, overwrite? (yes/no)"

## Journal Format

The journal.md file follows the template from `journal-template.md`:

```markdown
# Work Package WP[###] - Implementation Journal

**Work Package**: WP[###] - [WP Name]
**Created**: [TIMESTAMP]

---

## Session 1: Task-001 - [Task Name]

**執行時間**: [START_TIME] - [END_TIME]
**狀態**: [⏳ 進行中 | ✅ 完成 | ❌ 失敗]

### 做了什麼
- [列出主要完成的工作項目]

### 建立的檔案
- `[file path]` ([行數] 行) - [檔案用途]

### 修改的檔案
- `[file path]` (新增 [X] 行，刪除 [Y] 行)

### 測試結果
- 測試數量：[X] 個
- 測試通過：[Y] 個
- 測試失敗：[Z] 個
- 測試覆蓋率：[X]%

### 重要決定
[記錄技術決定]

### 遇到的問題
[記錄問題和解決方法]

### 契約檢查
- [ ] 所有欄位名稱與 contract-expected.yaml 一致
- [ ] 所有驗證規則已實作
- [ ] 錯誤訊息與契約完全相同
- [ ] 沒有新增契約外的欄位

---

## Session 2: Task-002 - [Task Name]
[同上格式]
```

## Parallel Development

**If multiple AIs are working on different WPs**:

1. **Independent WPs** (no shared files):
   - Can run simultaneously
   - No coordination needed
   - Each AI works in isolation

2. **File conflicts** (WPs modify same files):
   - Use git worktrees or separate branches
   - Merge after verification passes
   - Use contracts to ensure compatibility

**Example parallel execution**:
```bash
# Terminal 1
/speckit.implement --wp WP001  # User Model

# Terminal 2 (at same time)
/speckit.implement --wp WP002  # Session Model

# Terminal 3 (at same time)
/speckit.implement --wp WP004  # Login API (if deps met)
```

## Integration with Verification

After implementation, ALWAYS verify:
```bash
/speckit.verify --wp WP[###]
```

**If verification FAILS**:
1. Read verification-report.md
2. Identify specific issues (field mismatches, missing validations, etc.)
3. Fix the code
4. Re-run verification
5. Repeat until PASS

**Do NOT proceed to next WP until current WP passes verification.**

## Context for Implementation

User-provided context: $ARGUMENTS

Use this context to guide implementation (e.g., "prioritize error handling", "add detailed logging", "focus on performance").
