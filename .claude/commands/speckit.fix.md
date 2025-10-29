---
description: Fix Work Package implementation issues diagnosed during verification.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command fixes issues found during Work Package verification (`/speckit.verify --wp WP###`). It reads the diagnosis report for a specific WP, applies fixes, and re-verifies.

**Key principle**: Fix WP-level issues systematically based on contract verification diagnosis.

## Purpose

This command solves:
- **Spec mismatches**: Implementation doesn't match contract-expected.yaml
- **Missing implementations**: Required fields or features not implemented
- **Extra implementations**: AI hallucinated fields/features not in spec
- **Type mismatches**: Field types don't match expected types
- **Validation mismatches**: Validation rules don't match spec

## Modes

### Mode 1: Auto-fix Issues

```bash
/speckit.fix --wp WP001 --auto
```

Automatically fixes all issues for WP001 that are safe to auto-fix.

### Mode 2: Fix Specific Issue

```bash
/speckit.fix --wp WP001 --issue "Extra field: username"
```

Manually specify which issue to fix in WP001.

### Mode 3: Interactive Fix

```bash
/speckit.fix --wp WP001
```

If no `--issue` or `--auto` flag, prompt user to choose issues to fix.

## Execution: Mode 1 (Auto-fix)

### Step 1: Setup

Parse arguments:
- `--wp WP[###]`: Which Work Package to fix (required)
- `--auto`: Auto-fix all safe issues
- `--issue "..."`: Fix specific issue

Locate paths:

```bash
# Get paths from prerequisites script
source .specify/scripts/bash/check-prerequisites.sh
# Returns: FEATURE_DIR, WP_DIR, etc.

WP_DIR="$FEATURE_DIR/work-packages/WP001"
DIAGNOSIS_REPORT="$WP_DIR/diagnosis-report.md"
CONTRACT_EXPECTED="$WP_DIR/contract-expected.yaml"
VERIFICATION_REPORT="$WP_DIR/verification-report.md"
JOURNAL="$WP_DIR/journal.md"
```

Verify prerequisites:
- WP directory exists
- `diagnosis-report.md` exists (verification failed and generated diagnosis)
- If missing: ERROR "Run /speckit.verify --wp WP### first"

### Step 2: Read Diagnosis Report

Read: `work-packages/WP[###]/diagnosis-report.md`

Extract:
1. **Problem summary table**
2. **Fix instructions for each problem**
3. **Affected files and line numbers**
4. **Suggested code changes**

### Step 3: Classify Problems

Determine which problems can be auto-fixed:

**Can auto-fix**:
- ✅ Remove extra fields (AI hallucination)
- ✅ Add missing required fields
- ✅ Fix type mismatches (if straightforward)
- ✅ Fix validation rules (add/update validators)
- ✅ Fix field name typos (e.g., `userName` → `username`)

**Needs manual review**:
- ⚠️ Complex logic changes
- ⚠️ Breaking API changes
- ⚠️ Database migration required
- ⚠️ Ambiguous requirements

Output:

```
📋 WP001 診斷報告分析

發現 3 個問題:
├─ 2 個可自動修正 ✅
│  ├─ 問題 #1: Extra field "username" (spec 未要求)
│  └─ 問題 #2: Missing validation "email" on field "email"
└─ 1 個需要人工確認 ⚠️
   └─ 問題 #3: Type mismatch on "createdAt" (string vs Date)

Auto-fix 模式將修正可自動修正的 2 個問題。
是否繼續? (y/n)
```

### Step 4: Apply Fixes

For each auto-fixable problem:

#### Problem Type 1: Remove Extra Field

**Example**: AI added `username` field not in spec

**Diagnosis excerpt**:
```markdown
### 問題 #1: Extra field "username"

**問題描述**:
- Field `username` is in implementation but NOT in contract-expected.yaml
- Location: src/models/user.model.ts:15

**修正方案**: Remove field from implementation
```

**Fix steps**:

1. Read file: `src/models/user.model.ts`
2. Find the field definition (line 15):
   ```typescript
   username: string;
   ```
3. Remove the line using Edit tool
4. Update any references to this field (search codebase):
   ```bash
   grep -rn "\.username" src/
   ```
5. Remove or comment out references

**Update journal**:
```markdown
### [2025-01-15 16:45] 修正 WP001 問題 #1

**Action**: `/speckit.fix --wp WP001 --issue "Extra field username"`

**Problem**: Extra field "username" not in contract

**Files Modified**:
- src/models/user.model.ts (removed field definition)
- src/services/user.service.ts (removed 2 references)

**Status**: ✅ 修正完成

**Next**: Re-verify WP001

---
```

#### Problem Type 2: Add Missing Field

**Example**: Spec requires `phoneNumber`, but not implemented

**Diagnosis excerpt**:
```markdown
### 問題 #2: Missing field "phoneNumber"

**問題描述**:
- Field `phoneNumber` is in contract-expected.yaml but NOT implemented
- Location: contract-expected.yaml:18

**修正方案**: Add field to implementation

```yaml
# contract-expected.yaml:18
phoneNumber:
  type: string
  validation:
    - optional
    - pattern: "^\\+?[1-9]\\d{1,14}$"
```

Expected implementation:
```typescript
// src/models/user.model.ts
phoneNumber?: string;  // optional field

// Add validation in service or controller
```
```

**Fix steps**:

1. Read contract-expected.yaml to understand field spec
2. Add field to model:
   ```typescript
   // src/models/user.model.ts
   phoneNumber?: string;
   ```
3. Add validation (if applicable):
   ```typescript
   // src/validators/user.validator.ts
   phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
   ```
4. Update database schema (if applicable):
   ```sql
   ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
   ```

#### Problem Type 3: Fix Type Mismatch

**Example**: Spec says `Date`, implementation uses `string`

**Diagnosis excerpt**:
```markdown
### 問題 #3: Type mismatch on "createdAt"

**問題描述**:
- contract-expected.yaml: type = Date
- Implementation: type = string
- Location: src/models/user.model.ts:20

**修正方案**: Change type to Date
```

**Fix steps**:

1. Update type definition:
   ```typescript
   // Before:
   createdAt: string;

   // After:
   createdAt: Date;
   ```

2. Update serialization/deserialization logic:
   ```typescript
   // Ensure dates are properly handled
   toJSON() {
     return {
       ...this,
       createdAt: this.createdAt.toISOString()
     };
   }
   ```

3. Update database mapping (if applicable)

#### Problem Type 4: Fix Validation Rules

**Example**: Missing email validation

**Diagnosis excerpt**:
```markdown
### 問題 #4: Missing validation "email" on field "email"

**問題描述**:
- contract-expected.yaml requires: validation = [required, email, maxLength: 255]
- Implementation only has: required
- Missing: email, maxLength

**修正方案**: Add missing validators
```

**Fix steps**:

1. Find validation code (e.g., Joi schema, class-validator):
   ```typescript
   // Before:
   email: Joi.string().required()

   // After:
   email: Joi.string().required().email().max(255)
   ```

2. Or for class-validator:
   ```typescript
   // Before:
   @IsNotEmpty()
   email: string;

   // After:
   @IsNotEmpty()
   @IsEmail()
   @MaxLength(255)
   email: string;
   ```

### Step 5: Re-verify After Fixes

Automatically run verification:

```bash
echo "🔄 重新驗證 WP001..."
/speckit.verify --wp WP001
```

Wait for verification results.

### Step 6: Report Results

**If verification passes after fixes**:

```
✅ WP001 修正成功！

已修正問題:
├─ ✅ 問題 #1: 移除額外欄位 "username"
└─ ✅ 問題 #2: 新增缺少欄位 "phoneNumber"

驗證結果: ✅ WP001 通過驗證

下一步:
- WP001 已準備好進入整合
- 繼續實作其他 WP 或執行整合: /speckit.integrate

📋 驗證報告: work-packages/WP001/verification-report.md
```

**If verification still fails**:

```
⚠️  WP001 部分修正成功

已修正問題:
├─ ✅ 問題 #1: 移除額外欄位 "username"
└─ ✅ 問題 #2: 新增缺少欄位 "phoneNumber"

驗證結果: ❌ WP001 仍有 1 個問題

剩餘問題:
└─ 問題 #3: Type mismatch on "createdAt" (需人工修正)

下一步:
1. 查看更新的診斷報告: work-packages/WP001/diagnosis-report.md
2. 手動修正問題 #3
3. 再次執行: /speckit.fix --wp WP001
```

### Step 7: Update Journal

Append to: `work-packages/WP[###]/journal.md`

```markdown
### [2025-01-15 16:50] 修正 WP001 驗證問題

**Action**: `/speckit.fix --wp WP001 --auto`

**Problems Fixed**:

1. ✅ **問題 #1: Extra field "username"**
   - Modified: src/models/user.model.ts (removed line 15)
   - Modified: src/services/user.service.ts (removed 2 references)

2. ✅ **問題 #2: Missing field "phoneNumber"**
   - Modified: src/models/user.model.ts (added field)
   - Modified: src/validators/user.validator.ts (added validation)
   - Modified: database/migrations/002_add_phone_number.sql (created)

**Problems Requiring Manual Fix**:

3. ⚠️ **問題 #3: Type mismatch on "createdAt"** (needs manual fix)

**Verification Result**: ⚠️ Partial success (1 issue remains)

**Next**: Manually fix issue #3, then re-verify

---
```

## Execution: Mode 2 (Fix Specific Issue)

```bash
/speckit.fix --wp WP001 --issue "Extra field username"
```

Steps:
1. Read diagnosis report
2. Find problem matching the issue description
3. Apply fix for that problem only
4. Re-verify WP001
5. Report results

## Execution: Mode 3 (Interactive)

```bash
/speckit.fix --wp WP001
```

Prompt user to choose:

```
📋 WP001 診斷報告中發現 3 個問題:

  1. 🔴 Critical - Extra field "username" (可自動修正)
  2. 🔴 Critical - Missing field "phoneNumber" (可自動修正)
  3. 🟡 Warning - Type mismatch on "createdAt" (需人工確認)

選擇行動:
  [a] 自動修正所有可修正問題 (1, 2)
  [1-3] 修正特定問題
  [q] 退出

請輸入選擇:
```

## Fix Strategies by Problem Type

### Strategy 1: Extra Fields (AI Hallucination)

**Detection**: Field in code but NOT in contract-expected.yaml

**Fix**:
1. Remove field from model/interface
2. Remove all references to this field
3. Remove from database schema (if applicable)
4. Remove from tests

**Commands**:
```bash
# Find all references
grep -rn "\.fieldName" src/

# Remove field from model (use Edit tool)
# Remove references (use Edit tool)
```

### Strategy 2: Missing Fields

**Detection**: Field in contract-expected.yaml but NOT in code

**Fix**:
1. Add field to model/interface with correct type
2. Add validation rules (if specified)
3. Add to database schema (if applicable)
4. Add to tests

### Strategy 3: Type Mismatches

**Detection**: Field type in code ≠ type in contract

**Fix**:
1. Update type in model/interface
2. Update serialization/deserialization
3. Update database column type (if applicable)
4. Fix any type errors in dependent code

### Strategy 4: Validation Mismatches

**Detection**: Validation rules in code ≠ rules in contract

**Fix**:
1. Update validator schema
2. Add missing validators (required, email, min, max, pattern, etc.)
3. Remove extra validators not in contract

### Strategy 5: Field Name Typos

**Detection**: Similar field names (e.g., `userName` vs `username`)

**Fix**:
1. Rename field to match contract exactly
2. Update all references
3. Update database column (if applicable)

**Commands**:
```bash
# Rename field everywhere
grep -rn "oldFieldName" src/ | cut -d: -f1 | sort -u | xargs sed -i '' 's/oldFieldName/newFieldName/g'
```

## Safety Checks

### 1. Backup Before Fixing

```bash
# Create backup
BACKUP_FILE="work-packages/WP001/.backup-$(date +%s).tar.gz"
tar -czf "$BACKUP_FILE" work-packages/WP001/
echo "📦 Backup created: $BACKUP_FILE"
```

### 2. Dry Run Mode

```bash
/speckit.fix --wp WP001 --auto --dry-run
```

Shows what would be changed without applying changes.

### 3. Verify After Each Fix

After each fix, run verification to ensure no regressions:

```bash
/speckit.verify --wp WP001
```

## Error Handling

- If WP not found: ERROR "WP### does not exist"
- If diagnosis report missing: ERROR "Run /speckit.verify --wp WP### first"
- If contract-expected.yaml missing: ERROR "WP### has no contract"
- If fix fails: WARN "Could not apply fix for issue X" + manual instructions
- If file to modify not found: ERROR "File X not found"

## Rollback Support

If fixes break something:

```bash
/speckit.fix --wp WP001 --rollback
```

Restores from most recent backup:

```bash
# Find latest backup
LATEST_BACKUP=$(ls -t work-packages/WP001/.backup-*.tar.gz | head -1)

# Restore
tar -xzf "$LATEST_BACKUP" -C work-packages/WP001/
echo "✅ Restored from: $LATEST_BACKUP"
```

## Integration with Git

Auto-commit fixes:

```bash
/speckit.fix --wp WP001 --auto --commit
```

This will:
1. Apply fixes
2. Re-verify
3. If verified: `git commit -m "fix(WP001): Fix contract verification issues"`
4. If failed: Leave changes uncommitted for review

## Context for Fixing

User-provided context: $ARGUMENTS

Use this to:
- Prioritize certain fixes
- Skip certain problems if requested
- Apply custom fix strategies

## Example Workflow

```bash
# After WP verification fails
/speckit.verify --wp WP001
# → FAIL (3 issues)
# → Auto-generates diagnosis-report.md

# Review diagnosis
cat work-packages/WP001/diagnosis-report.md

# Try auto-fix
/speckit.fix --wp WP001 --auto
# → Fixes 2 problems
# → Re-verifies
# → 1 problem remains

# Fix remaining problem manually
/speckit.fix --wp WP001 --issue "Type mismatch"
# → Prompts for fix
# → Apply fix
# → Re-verifies
# → PASS ✅

# WP001 is ready!
```

## Comparison: /speckit.fix vs /speckit.fix-integration

| Aspect | /speckit.fix | /speckit.fix-integration |
|--------|--------------|--------------------------|
| Scope | Single WP | Multiple WPs |
| Input | diagnosis-report.md (WP level) | integration-diagnosis-report.md |
| Problems | Spec mismatches | Integration conflicts |
| Examples | Extra fields, missing fields | Shared component conflicts, data flow issues |
| When to use | After `/speckit.verify --wp WP###` fails | After `/speckit.test --integration` fails |

## Template References

- Diagnosis report: `.specify/templates/diagnosis-report-template.md`
- Verification report: `.specify/templates/verification-report-template.md`
- Journal: `.specify/templates/journal-template.md`
