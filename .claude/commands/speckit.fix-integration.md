---
description: Fix integration issues diagnosed during integration testing.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command fixes integration issues after `/speckit.test --integration` fails. It reads the diagnosis report, applies fixes, and automatically re-tests to verify the fixes worked.

**Key principle**: Fix integration issues systematically based on diagnosis, then verify fixes immediately.

## Purpose

This command solves:
- **Shared component conflicts**: Props mismatch, API inconsistency
- **Cross-WP data flow issues**: Token storage, state passing problems
- **Import path issues**: Outdated paths after integration
- **API contract mismatches**: Frontend-backend alignment issues
- **Test coverage gaps**: Missing test cases

## Modes

### Mode 1: Auto-fix All Issues

```bash
/speckit.fix-integration --auto
```

Automatically fixes all issues listed in `integration-diagnosis-report.md` that are safe to auto-fix.

### Mode 2: Fix Specific Issue

```bash
/speckit.fix-integration --issue "Session token 傳遞問題"
```

Manually specify which issue to fix (matches problem title in diagnosis report).

### Mode 3: Interactive Fix

```bash
/speckit.fix-integration
```

If no flags provided, prompt user to choose which issues to fix.

## Execution: Mode 1 (Auto-fix)

### Step 1: Setup

Parse arguments and locate paths:

```bash
# Get paths from prerequisites script
source .specify/scripts/bash/check-prerequisites.sh
# Returns: FEATURE_DIR, INTEGRATION_DIR, SPEC_FILE, etc.
```

Verify prerequisites:
- `integration/integration-diagnosis-report.md` exists (diagnosis completed)
- If missing: ERROR "Run /speckit.test --integration first to generate diagnosis"

### Step 2: Read Diagnosis Report

Read: `integration/integration-diagnosis-report.md`

Extract:
1. **Problem summary table**:
   ```
   | # | 問題類型 | 嚴重度 | 影響範圍 | 建議指令 |
   |---|---------|--------|----------|----------|
   | 1 | 共用元件問題 | 🔴 Critical | Button ... | ... |
   | 2 | 跨 WP 流程問題 | 🔴 Critical | token ... | ... |
   ```

2. **Fix instructions for each problem** (from "🔧 修正指引" section):
   - Problem type
   - Severity
   - Affected files
   - Suggested fix code
   - Verification steps

### Step 3: Classify Problems by Auto-fix Capability

For each problem, determine if it's safe to auto-fix:

**Can auto-fix**:
- ✅ Import path updates (e.g., `./Button` → `@/shared/components/Button`)
- ✅ Prop name changes (e.g., `variant` → `type`)
- ✅ Consistent API field renames (e.g., `id` → `userId`)
- ✅ Storage mechanism alignment (e.g., `sessionStorage` → `localStorage`)

**Needs manual review**:
- ⚠️ API contract changes (may affect other code)
- ⚠️ Complex logic changes
- ⚠️ Database schema changes
- ⚠️ Test case additions (requires understanding context)

Output to user:

```
📋 診斷報告分析

發現 5 個問題:
├─ 3 個可自動修正 ✅
│  ├─ 問題 #1: Button Props 不一致
│  ├─ 問題 #2: Session Token 傳遞問題
│  └─ 問題 #3: Import 路徑未更新
├─ 2 個需要人工確認 ⚠️
   ├─ 問題 #4: API Contract 不一致
   └─ 問題 #5: 測試覆蓋率不足

Auto-fix 模式將修正可自動修正的 3 個問題。
```

Ask user confirmation (only if not using `--force` flag):

```
是否繼續? (y/n)
```

### Step 4: Fix Problems by Priority

Sort problems by:
1. Severity (🔴 Critical > 🟡 Warning > 🟢 Info)
2. Dependency (fix foundational issues first)

For each auto-fixable problem:

#### Fix Problem #1: Button Props 不一致

**Problem**: WP003 使用 `variant` prop，但整合後的 Button 使用 `type`

**Diagnosis excerpt**:
```markdown
### 問題 #1: Button Props 不一致

**修正方案 A: 更新 WP003 使用新 API（建議）**

```typescript
// 檔案: src/features/auth/reset-password/ResetPasswordPage.tsx
// 修正前:
<Button variant="primary">重設密碼</Button>
// 修正後:
<Button type="primary">重設密碼</Button>
```
```

**Fix steps**:

1. Read file: `src/features/auth/reset-password/ResetPasswordPage.tsx`
2. Search for all `<Button variant=` patterns
3. Replace `variant=` with `type=`
4. Save file

```bash
# Use Edit tool to fix
# File: src/features/auth/reset-password/ResetPasswordPage.tsx
# Find: variant="primary"
# Replace: type="primary"
```

5. Update journal:

```markdown
### [2025-01-15 18:00] 修正問題 #1: Button Props 不一致

**Action**: `/speckit.fix-integration --issue "Button Props 不一致"`

**Files Modified**:
- src/features/auth/reset-password/ResetPasswordPage.tsx (1 change)

**Changes**:
- Updated Button prop from `variant` to `type`
- Affects 1 Button instance in WP003

**Status**: ✅ 修正完成

**Next**: 重新執行整合測試驗證

---
```

#### Fix Problem #2: Session Token 傳遞問題

**Problem**: WP001 寫入 localStorage，WP004 讀取 sessionStorage

**Diagnosis excerpt**:
```markdown
### 問題 #2: Session Token 傳遞問題

**修正方案 B: 建立共用的 Auth Storage 工具（更好）**

```typescript
// 檔案: src/shared/utils/auth-storage.ts (新建)
export const AuthStorage = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
  // ...
};
```

然後更新所有使用 token 的地方 [list of files]
```

**Fix steps**:

1. Create new file: `src/shared/utils/auth-storage.ts` (use Write tool)
2. Find all files that access token:
   ```bash
   grep -r "localStorage.getItem('authToken')" src/
   grep -r "sessionStorage.getItem('authToken')" src/
   grep -r "localStorage.setItem('authToken'" src/
   grep -r "sessionStorage.setItem('authToken'" src/
   ```
3. For each file found:
   - Add import: `import { AuthStorage } from '@/shared/utils/auth-storage';`
   - Replace `localStorage.getItem('authToken')` → `AuthStorage.getToken()`
   - Replace `localStorage.setItem('authToken', token)` → `AuthStorage.setToken(token)`
   - Replace `localStorage.removeItem('authToken')` → `AuthStorage.removeToken()`
4. Save all files
5. Update journal (as above)

#### Fix Problem #3: Import 路徑未更新

**Problem**: WP004 使用舊路徑 `./components/Button`

**Fix steps**:

1. Search for old import patterns:
   ```bash
   grep -r "from '\./.*\/Button'" src/features/profile/
   grep -r "from '\./.*\/Input'" src/features/profile/
   grep -r "from '\./.*\/Card'" src/features/profile/
   ```

2. For each file found:
   - Replace `from './components/Button'` → `from '@/shared/components/Button'`
   - Replace `from './components/Input'` → `from '@/shared/components/Input'`
   - etc.

3. Save all files
4. Update journal

### Step 5: Handle Manual Review Problems

For problems that need manual review, generate instructions:

```
⚠️  以下問題需要人工確認:

問題 #4: API Contract 不一致
- Severity: 🔴 Critical
- Description: Backend 回傳 `id`，Frontend 期望 `userId`
- Suggested fix: 修改 Backend 回應格式
- File: src/features/profile/profile.controller.ts
- Review instructions: integration-diagnosis-report.md#問題-4

建議:
1. 檢查 contract-expected.yaml 確認正確欄位名稱
2. 決定是修改 Backend 還是 Frontend
3. 手動修正後執行: /speckit.test --integration

問題 #5: 測試覆蓋率不足
- Severity: 🟡 Warning
- Description: 共用元件測試覆蓋率僅 75%
- Suggested fix: 補充無障礙和 edge case 測試
- Review instructions: integration-diagnosis-report.md#問題-5

建議:
1. 查看 integration-test-report.md 了解哪些測試缺少
2. 撰寫補充測試案例
3. 執行: /speckit.test --shared
```

### Step 6: Verify Fixes

After applying auto-fixes, automatically re-run integration tests:

```bash
echo "🔄 重新執行整合測試以驗證修正..."
/speckit.test --integration
```

Wait for test results.

### Step 7: Report Results

**If tests pass after fixes**:

```
✅ 修正成功！

已修正問題:
├─ ✅ 問題 #1: Button Props 不一致
├─ ✅ 問題 #2: Session Token 傳遞問題
└─ ✅ 問題 #3: Import 路徑未更新

測試結果: ✅ 所有整合測試通過

下一步:
- 執行 /speckit.verify --final
- 執行 /speckit.cleanup (optional)

📋 詳細報告: integration/integration-test-report.md
```

**If tests still fail**:

```
⚠️  修正部分成功

已修正問題:
├─ ✅ 問題 #1: Button Props 不一致
├─ ✅ 問題 #2: Session Token 傳遞問題
└─ ✅ 問題 #3: Import 路徑未更新

測試結果: ❌ 仍有 2 個測試失敗

剩餘問題:
├─ 問題 #4: API Contract 不一致 (需人工修正)
└─ 問題 #5: 測試覆蓋率不足 (需人工修正)

下一步:
1. 查看更新的診斷報告: integration-diagnosis-report.md
2. 手動修正剩餘問題
3. 再次執行: /speckit.fix-integration
```

**If fixes caused new failures** (regression):

```
❌ 修正導致新問題

已修正問題:
├─ ✅ 問題 #1: Button Props 不一致
├─ ✅ 問題 #2: Session Token 傳遞問題
└─ ✅ 問題 #3: Import 路徑未更新

但是:
❌ 新增 1 個失敗測試
   - WP002 Register Page: Button style broken

已生成新的診斷報告: integration-diagnosis-report.md

建議:
- 檢查最近的變更是否影響其他 WP
- 執行: /speckit.fix-integration --issue "新問題描述"
```

### Step 8: Update Journal

Append comprehensive record to: `integration/integration-journal.md`

```markdown
### [2025-01-15 18:15] 修正整合問題

**Action**: `/speckit.fix-integration --auto`

**Problems Fixed**:

1. ✅ **問題 #1: Button Props 不一致**
   - Modified: src/features/auth/reset-password/ResetPasswordPage.tsx
   - Changed `variant` → `type` (1 instance)

2. ✅ **問題 #2: Session Token 傳遞問題**
   - Created: src/shared/utils/auth-storage.ts
   - Modified: src/features/auth/login/login.service.ts
   - Modified: src/features/profile/profile.service.ts
   - Modified: src/features/auth/logout/logout.service.ts
   - Unified token storage mechanism

3. ✅ **問題 #3: Import 路徑未更新**
   - Modified: src/features/profile/components/ProfileHeader.tsx
   - Modified: src/features/profile/components/ProfileForm.tsx
   - Updated 5 import statements

**Problems Requiring Manual Review**:

4. ⚠️ **問題 #4: API Contract 不一致** (needs manual fix)
5. ⚠️ **問題 #5: 測試覆蓋率不足** (needs manual fix)

**Test Results After Fixes**:
- Individual WP tests: 55/55 passed ✅
- E2E flow tests: 8/8 passed ✅
- Shared component tests: 41/41 passed ✅
- API integration tests: 12/14 passed ⚠️ (2 still failing due to issue #4)

**Status**: ⚠️ Partial success (API contract issue remains)

**Next**: Manually fix issue #4, then rerun /speckit.test --integration

---
```

## Execution: Mode 2 (Fix Specific Issue)

```bash
/speckit.fix-integration --issue "Session token 傳遞問題"
```

Steps:
1. Read diagnosis report
2. Find problem matching the issue description
3. Apply fix for that specific problem only
4. Re-run relevant tests (not full suite):
   ```bash
   # If it was an E2E issue, test only E2E:
   /speckit.test --e2e
   ```
5. Report results

## Execution: Mode 3 (Interactive)

```bash
/speckit.fix-integration
```

Prompt user to choose:

```
📋 整合診斷報告中發現 5 個問題:

  1. 🔴 Critical - Button Props 不一致 (可自動修正)
  2. 🔴 Critical - Session Token 傳遞問題 (可自動修正)
  3. 🟡 Warning - Import 路徑未更新 (可自動修正)
  4. 🔴 Critical - API Contract 不一致 (需人工確認)
  5. 🟡 Warning - 測試覆蓋率不足 (需人工確認)

選擇行動:
  [a] 自動修正所有可修正問題 (1, 2, 3)
  [1-5] 修正特定問題
  [q] 退出

請輸入選擇:
```

Based on user choice, execute corresponding fix.

## Fix Strategies by Problem Type

### Strategy 1: Shared Component Issues

**Problem**: Props mismatch after component merge

**Fix approach**:
1. Identify the "canonical" prop name (from integration-report.md)
2. Update all WPs to use canonical prop name
3. OR: Add backward compatibility in component

**Example**:
```typescript
// Backward compatible approach:
interface ButtonProps {
  type?: 'primary' | 'secondary';
  variant?: 'primary' | 'secondary';  // deprecated
}

export function Button({ type, variant, ...props }: ButtonProps) {
  const buttonType = type || variant || 'primary';  // variant as fallback
  // ...
}
```

### Strategy 2: Cross-WP Data Flow Issues

**Problem**: Data not passed correctly between WPs

**Fix approach**:
1. Create shared utility for data management
2. Update all WPs to use shared utility
3. Ensure consistent storage mechanism (localStorage vs sessionStorage)

**Example**: Already shown in auth-storage.ts above

### Strategy 3: Import Path Issues

**Problem**: Old relative paths after moving to shared folder

**Fix approach**:
1. Use grep to find all old import patterns
2. Batch replace with new paths
3. Verify no broken imports

**Commands**:
```bash
# Find old imports
grep -rn "from '\./components/" src/features/

# Replace (example with sed)
find src/features/ -type f -name "*.tsx" -exec sed -i '' "s|from './components/Button'|from '@/shared/components/Button'|g" {} +
```

### Strategy 4: API Contract Mismatches

**Problem**: Frontend expects different fields than backend provides

**Fix approach**:
1. Identify which is "correct" (usually: contract-expected.yaml is source of truth)
2. Update backend to match contract
3. OR: Update frontend if contract was wrong
4. Verify with contract verification: `/speckit.verify --integration`

**Example**:
```typescript
// Backend fix:
// Before:
res.json({ user: { id: user.id, email: user.email } });

// After (matching contract):
res.json({ user: { userId: user.id, email: user.email } });
```

### Strategy 5: Test Coverage Gaps

**Problem**: Missing test cases

**Fix approach**:
1. Identify uncovered code paths from coverage report
2. Write additional test cases
3. Focus on edge cases and accessibility

**Example**:
```typescript
// Add accessibility tests
describe('Button Accessibility', () => {
  it('should have proper ARIA attributes', () => {
    const { getByRole } = render(<Button>Click</Button>);
    expect(getByRole('button')).toHaveAttribute('aria-label');
  });

  it('should support keyboard navigation', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<Button onClick={onClick}>Click</Button>);
    const button = getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Safety Checks

Before applying fixes:

1. **Backup check**: Ensure git is clean or changes are committed
   ```bash
   if ! git diff-index --quiet HEAD --; then
     echo "⚠️  Working directory has uncommitted changes"
     echo "建議先 commit 或 stash 變更"
     exit 1
   fi
   ```

2. **Dry-run mode**: Show what would be changed before applying
   ```bash
   /speckit.fix-integration --auto --dry-run
   ```

3. **Incremental fixes**: Fix one problem at a time, test, commit
   ```bash
   /speckit.fix-integration --issue "Problem 1"
   git add . && git commit -m "fix: Problem 1"
   /speckit.fix-integration --issue "Problem 2"
   git add . && git commit -m "fix: Problem 2"
   ```

## Error Handling

- If diagnosis report missing: ERROR "Run /speckit.test --integration first"
- If issue not found in report: ERROR "Issue 'X' not found in diagnosis report"
- If fix causes test regression: WARN "Fix caused new failures" + rollback option
- If file to fix not found: ERROR "File X not found. Integration may be incomplete."

## Rollback Support

If fixes make things worse:

```bash
/speckit.fix-integration --rollback
```

This reverts the last set of fixes:
```bash
git reset --hard HEAD~1  # if changes were committed
# OR
git checkout -- .  # if changes not committed yet
```

## Iteration Loop

Integration fixing is often iterative:

```
1. /speckit.test --integration → FAIL
2. /speckit.fix-integration --auto → Fix 3 problems
3. /speckit.test --integration → FAIL (2 problems remain)
4. /speckit.fix-integration --issue "Problem 4" → Fix manually
5. /speckit.test --integration → PASS ✅
```

The command should support this loop automatically.

## Context for Fixing

User-provided context: $ARGUMENTS

Use this to:
- Prioritize certain fixes over others
- Apply specific fix strategies if requested
- Skip certain problems if user says so

## Example Full Workflow

```bash
# After integration tests fail
cat integration/integration-diagnosis-report.md

# Try auto-fix
/speckit.fix-integration --auto
# → Fixes 3 problems automatically
# → Re-runs tests
# → 2 problems remain

# Fix remaining problems one by one
/speckit.fix-integration --issue "API Contract 不一致"
# → Prompts for manual changes
# → Apply changes
# → Re-tests

/speckit.fix-integration --issue "測試覆蓋率不足"
# → Write missing test cases
# → Re-tests

# All tests pass!
/speckit.verify --final
```

## Integration with Git

Automatically commit fixes:

```bash
/speckit.fix-integration --auto --commit
```

This will:
1. Apply fixes
2. Test fixes
3. If passed: `git commit -m "fix(integration): Auto-fix 3 integration issues"`
4. If failed: Leave changes uncommitted for manual review

## Template References

- Diagnosis report template: `.specify/templates/integration-diagnosis-report-template.md`
- Journal template: `.specify/templates/integration-journal-template.md`
- Test report template: `.specify/templates/integration-test-report-template.md`
