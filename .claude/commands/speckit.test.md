---
description: Execute integration tests for Work Packages and E2E flows.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command executes integration tests after Work Packages have been individually implemented and verified. It ensures that:
1. Individual WP features still work correctly after integration
2. Cross-WP workflows (E2E) function properly
3. Shared components work consistently across all features
4. API contracts align between frontend and backend

**Key principle**: Integration testing happens AFTER individual WPs are verified but BEFORE final deployment.

## Purpose

Integration testing solves:
- **Integration conflicts**: Detects when merging WPs breaks individual features
- **Cross-WP flow issues**: Catches data flow problems between WPs (e.g., token passing)
- **Shared component issues**: Finds inconsistencies in shared components
- **API integration issues**: Detects mismatches between frontend and backend

## Modes

### Mode 1: Full Integration Test

```bash
/speckit.test --integration
```

Executes all four test categories:
1. Individual WP feature tests (regression check)
2. Cross-WP E2E flow tests
3. Shared component tests
4. API integration tests

### Mode 2: Single WP Regression Test

```bash
/speckit.test --wp WP001
```

Tests only one WP's features to verify it wasn't broken by integration.

### Mode 3: E2E Flow Tests Only

```bash
/speckit.test --e2e
```

Tests only cross-WP workflows (e.g., register → login → profile → logout).

### Mode 4: Shared Component Tests Only

```bash
/speckit.test --shared
```

Tests only shared components extracted during integration.

## Execution: Mode 1 (Full Integration Test)

### Step 1: Setup

Parse arguments and locate paths:

```bash
# Get paths from prerequisites script
source .specify/scripts/bash/check-prerequisites.sh
# Returns: FEATURE_DIR, INTEGRATION_DIR, SPEC_FILE, etc.
```

Verify prerequisites:
- `integration/integration-report.md` exists (integration completed)
- `integration/integration-analysis.md` exists (analysis completed)
- All WPs have `verification-report.md` (individual verification passed)

If missing: ERROR "Run /speckit.analyze and /speckit.integrate first"

### Step 2: Read Integration Analysis

Read `integration/integration-analysis.md` to understand:
- Which WPs are being integrated
- Which shared components were created
- Which E2E flows need testing
- Expected API contracts

### Step 3: Prepare Test Environment

```bash
# Install dependencies if needed
npm install --no-save

# Set up test database (if applicable)
npm run test:setup

# Start test server (if needed)
npm run test:start &
TEST_SERVER_PID=$!
```

### Step 4: Execute Test Categories

#### Category 1: Individual WP Feature Tests

Purpose: Ensure integration didn't break any WP's functionality

```bash
# For each WP in integration-analysis.md:
echo "Testing WP001 - Login Feature..."
npm test -- work-packages/WP001/tests/
# OR: pytest work-packages/WP001/tests/
# OR: cargo test --manifest-path work-packages/WP001/Cargo.toml

# Record results:
# - Total tests
# - Passed tests
# - Failed tests
# - Test time
```

If ANY WP tests fail:
- Mark WP as FAILED
- Record failure details (test name, error message, location)
- Continue testing other WPs (don't stop)

#### Category 2: Cross-WP E2E Flow Tests

Purpose: Test complete user workflows spanning multiple WPs

```bash
echo "Testing E2E flows..."
npm test -- tests/integration/e2e/
# OR: pytest tests/integration/e2e/
```

Common E2E flows (based on integration-analysis.md):
- Complete auth flow: Register → Login → View Profile → Logout
- Password reset flow: Request Reset → Receive Email → Reset Password → Login
- Session expiry flow: Login → Wait for expiry → Access protected resource → Redirect to login

If ANY E2E test fails:
- This is CRITICAL (blocks user workflows)
- Record detailed failure info (which step failed, expected vs actual)

#### Category 3: Shared Component Tests

Purpose: Ensure shared components work consistently everywhere

```bash
echo "Testing shared components..."
npm test -- src/shared/components/
# OR: pytest src/shared/components/
```

Tests to run (extracted from integration-report.md):
- Each shared component renders correctly
- Props work as expected across all WPs
- State management is consistent
- Accessibility standards met

#### Category 4: API Integration Tests

Purpose: Ensure frontend and backend APIs align

```bash
echo "Testing API integration..."
npm test -- tests/integration/api/
# OR: pytest tests/integration/api/
```

Tests to verify:
- All API endpoints respond correctly
- Request/response formats match contracts
- Error handling works properly
- Authentication/authorization functions

### Step 5: Collect Test Coverage

```bash
# Generate coverage report
npm test -- --coverage
# OR: pytest --cov=src --cov-report=json

# Extract coverage metrics:
STMT_COV=$(jq '.total.statements.pct' coverage/coverage-summary.json)
BRANCH_COV=$(jq '.total.branches.pct' coverage/coverage-summary.json)
FUNC_COV=$(jq '.total.functions.pct' coverage/coverage-summary.json)
LINE_COV=$(jq '.total.lines.pct' coverage/coverage-summary.json)
```

### Step 6: Collect Performance Metrics

```bash
# Measure API response times (if applicable)
node tests/performance/api-benchmark.js

# Measure page load times (if applicable)
node tests/performance/page-benchmark.js
```

### Step 7: Run Security Checks

```bash
# Check for common vulnerabilities
npm audit
# OR: poetry check / cargo audit

# Run security tests
npm test -- tests/security/
```

### Step 8: Generate Test Report

Create: `integration/integration-test-report.md`

Use template: `.specify/templates/integration-test-report-template.md`

Fill in:
- Test statistics (total, passed, failed, skipped, pass rate)
- Coverage metrics (statement, branch, function, line)
- Performance metrics (API response times, page load times)
- List of passed test categories
- List of failed tests (if any)
- Detailed test results for each category

**Important sections**:

```markdown
## 📋 測試摘要（AI 優先讀取）

### 測試統計

| 測試類別 | 總數 | 通過 | 失敗 | 跳過 | 通過率 |
|---------|------|------|------|------|--------|
| 個別 WP 功能測試 | [X] | [Y] | [Z] | [A] | [P]% |
| 跨 WP 流程測試 (E2E) | [X] | [Y] | [Z] | [A] | [P]% |
| 共用元件測試 | [X] | [Y] | [Z] | [A] | [P]% |
| API 整合測試 | [X] | [Y] | [Z] | [A] | [P]% |
| **總計** | [X] | [Y] | [Z] | [A] | [P]% |

### 測試覆蓋率

| 類型 | 覆蓋率 | 狀態 |
|------|--------|------|
| 語句覆蓋率 (Statements) | [X]% | [✅ ≥80% / ⚠️ <80%] |
| 分支覆蓋率 (Branches) | [X]% | [✅ ≥80% / ⚠️ <80%] |
| 函數覆蓋率 (Functions) | [X]% | [✅ ≥80% / ⚠️ <80%] |
| 行數覆蓋率 (Lines) | [X]% | [✅ ≥80% / ⚠️ <80%] |

### 下一步行動

- [如果通過] ✅ 執行 `/speckit.verify --final` 進行最終驗證
- [如果失敗] ❌ 查看 `integration-diagnosis-report.md` 了解失敗原因
- [如果失敗] ❌ 執行 `/speckit.fix-integration` 修正問題
```

### Step 9: Determine Test Status

```
IF all_tests_passed AND coverage >= 80%:
  STATUS = ✅ PASS
  OUTPUT = "All integration tests passed!"
ELSE:
  STATUS = ❌ FAIL
  OUTPUT = "Integration tests failed. See integration-test-report.md"
  TRIGGER = Auto-generate diagnosis report
```

### Step 10: Auto-Generate Diagnosis (If Failed)

If tests failed, automatically run diagnosis:

```bash
# Analyze failures
/speckit.diagnose-integration
```

This creates: `integration/integration-diagnosis-report.md`

Use template: `.specify/templates/integration-diagnosis-report-template.md`

Fill in:
- Problem summary table (problem type, severity, affected WPs, suggested fix)
- Fix instructions for each problem
- Root cause analysis
- Suggested fix order (by severity and dependency)

**Common problem types**:
1. **Shared component issues**: Props mismatch, API inconsistency
2. **Cross-WP flow issues**: Data flow problems (e.g., token storage)
3. **Import path issues**: Paths not updated after integration
4. **API contract mismatches**: Frontend expects different format than backend provides
5. **Test coverage gaps**: Missing test cases

### Step 11: Update Integration Journal

Append to: `integration/integration-journal.md`

```markdown
### [2025-01-15 17:30] Integration Testing

**Action**: `/speckit.test --integration`

**Test Results**:
- Individual WP tests: 55/55 passed ✅
- E2E flow tests: 6/8 passed ⚠️
  - Failed: "Register → Login flow" (token not passed)
  - Failed: "Session expiry handling" (redirect not working)
- Shared component tests: 41/41 passed ✅
- API integration tests: 14/14 passed ✅

**Status**: ❌ FAILED (2 E2E tests failed)

**Coverage**:
- Statements: 87%
- Branches: 82%
- Functions: 91%
- Lines: 86%

**Next**: Review `integration-diagnosis-report.md` for fix instructions

---
```

### Step 12: Cleanup Test Environment

```bash
# Stop test server
kill $TEST_SERVER_PID

# Clean up test database
npm run test:cleanup

# Remove temporary test files
rm -rf .test-cache
```

### Step 13: Report to User

Output summary:

```
🧪 Integration Test Results

Tests Executed: 116
├─ ✅ Individual WP tests: 55/55 passed (100%)
├─ ⚠️  E2E flow tests: 6/8 passed (75%)
├─ ✅ Shared component tests: 41/41 passed (100%)
└─ ✅ API integration tests: 14/14 passed (100%)

Coverage: 87% statements, 82% branches

Status: ❌ FAILED

📋 Detailed report: integration/integration-test-report.md
🔍 Diagnosis report: integration/integration-diagnosis-report.md

Next steps:
1. Review diagnosis report for failure details
2. Run: /speckit.fix-integration --auto
   OR: /speckit.fix-integration --issue "specific issue"
```

If all tests passed:

```
🧪 Integration Test Results

Tests Executed: 116
├─ ✅ Individual WP tests: 55/55 passed (100%)
├─ ✅ E2E flow tests: 8/8 passed (100%)
├─ ✅ Shared component tests: 41/41 passed (100%)
└─ ✅ API integration tests: 14/14 passed (100%)

Coverage: 87% statements, 82% branches

Status: ✅ ALL TESTS PASSED

📋 Detailed report: integration/integration-test-report.md

Next steps:
1. Run: /speckit.verify --final
2. Run: /speckit.cleanup (optional)
3. Ready for deployment! 🚀
```

## Execution: Mode 2 (Single WP Regression Test)

Test only one WP:

```bash
/speckit.test --wp WP001
```

Steps:
1. Run tests only for WP001: `npm test -- work-packages/WP001/tests/`
2. Report results (passed/failed)
3. If failed: Create mini diagnosis report for that WP only

Output:

```
🧪 WP001 Regression Test

Tests: 15/15 passed ✅
Coverage: 92%
Status: ✅ PASS

WP001 was not broken by integration.
```

## Execution: Mode 3 (E2E Tests Only)

```bash
/speckit.test --e2e
```

Steps:
1. Run only E2E tests: `npm test -- tests/integration/e2e/`
2. Report E2E flow results
3. If failed: Diagnose which step in which flow failed

## Execution: Mode 4 (Shared Component Tests Only)

```bash
/speckit.test --shared
```

Steps:
1. Run only shared component tests: `npm test -- src/shared/components/`
2. Report component test results
3. If failed: Identify which component and which props/behavior failed

## Test Discovery Strategy

### For JavaScript/TypeScript Projects

**Test file patterns**:
- `*.test.ts`, `*.test.tsx`, `*.test.js`, `*.test.jsx`
- `*.spec.ts`, `*.spec.tsx`, `*.spec.js`, `*.spec.jsx`
- `__tests__/**/*.ts`, `__tests__/**/*.js`

**Test commands**:
- Jest: `npm test` or `npx jest`
- Vitest: `npm test` or `npx vitest run`
- Mocha: `npm test` or `npx mocha`

**Coverage**:
- Jest: `npm test -- --coverage`
- Vitest: `npm test -- --coverage`

### For Python Projects

**Test file patterns**:
- `test_*.py`, `*_test.py`
- `tests/**/*.py`

**Test commands**:
- pytest: `pytest tests/`
- unittest: `python -m unittest discover`

**Coverage**:
- pytest-cov: `pytest --cov=src --cov-report=json`

### For Rust Projects

**Test discovery**:
- Built-in: `cargo test`

**Coverage**:
- tarpaulin: `cargo tarpaulin --out Json`

## Error Handling

- If integration not done: ERROR "Run /speckit.integrate first"
- If test command fails: WARN "Test execution failed" + show error
- If coverage tools missing: WARN "Coverage unavailable" + continue
- If no tests found: WARN "No tests found for [category]" + mark as skipped

## Performance

For large test suites:
- Run tests in parallel: `npm test -- --maxWorkers=4`
- Cache test results: Use `--cache` flag if available
- Skip slow tests in quick mode: `--testTimeout=5000`

## Context for Testing

User-provided context: $ARGUMENTS

Use this to:
- Focus on specific test categories if requested
- Adjust coverage thresholds if specified
- Enable/disable specific test types

## Example: Full Workflow

```bash
# After all WPs are implemented and verified
/speckit.analyze                    # Analyze WPs
/speckit.integrate --full          # Integrate WPs
/speckit.test --integration        # Run integration tests

# If tests fail:
# → Auto-generates integration-diagnosis-report.md
# → Read diagnosis and fix issues:
/speckit.fix-integration --auto    # Auto-fix all diagnosed issues

# After fixes, rerun tests:
/speckit.test --integration        # Should pass now

# Once all tests pass:
/speckit.verify --final            # Final verification
/speckit.cleanup                   # Clean up temp files
```

## Integration with CI/CD

This command can be used in CI pipelines:

```yaml
# .github/workflows/integration-test.yml
- name: Run Integration Tests
  run: /speckit.test --integration

- name: Upload Test Report
  uses: actions/upload-artifact@v2
  with:
    name: integration-test-report
    path: integration/integration-test-report.md
```

## Important Notes

- **NEVER skip failed tests**: All failures must be diagnosed
- **Always run all test categories**: Don't skip E2E or shared component tests
- **Auto-generate diagnosis**: If tests fail, immediately create diagnosis report
- **Update journal**: Record all test executions in integration-journal.md
- **Coverage matters**: Aim for ≥80% coverage in all metrics

## Template References

- Test report template: `.specify/templates/integration-test-report-template.md`
- Diagnosis report template: `.specify/templates/integration-diagnosis-report-template.md`
- Journal template: `.specify/templates/integration-journal-template.md`
