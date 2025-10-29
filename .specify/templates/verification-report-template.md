# Verification Report - WP[###]: [WP Name]

**Work Package**: WP[###] - [WP Name]
**Verification Date**: [TIMESTAMP]
**Status**: [✅ PASS | ❌ FAIL]

---

## 🤖 AI 讀取指引（AI 必讀！）

**如果你是 AI，請遵循以下規則以節省上下文**：

1. **優先讀取**: 只讀下面的「📋 Summary」區塊
2. **如果 Status = ✅ PASS**:
   - 停止讀取，不需要看其他部分
   - 直接回報：驗證通過，可進入下一個 WP
3. **如果 Status = ❌ FAIL**:
   - 讀取「📋 Summary」的統計數字
   - **跳到** `diagnosis-report.md` 查看詳細診斷和修正建議
   - **不要讀** 本文件的詳細檢查區塊（那是給人類看的）

**節省上下文原則**:
- Summary 以下的所有詳細區塊（✅ Contract Verification, 🧪 Test Coverage 等）僅供人類閱讀
- AI 只需要知道「通過」或「失敗」，詳細診斷在 `diagnosis-report.md`

---

## 📋 Summary

**Overall Result**: [✅ PASS | ❌ FAIL]

**Quick Stats**:
- Total Checks: [X]
- Passed: [Y]
- Failed: [Z]
- Test Coverage: [X]%

**Next Action**:
- [如果 PASS] ✅ 驗證通過，可進入下一個 WP 或執行 `/speckit.integrate`
- [如果 FAIL] ❌ 查看 `diagnosis-report.md` 了解問題和修正建議

---

## ✅ Contract Verification

### Field Names Check

**Status**: [✅ PASS | ❌ FAIL]

| Field | Expected (contract-expected.yaml) | Implemented (contract-implementation.yaml) | Status |
|-------|-----------------------------------|---------------------------------------------|--------|
| [field1] | [type] | [type] | [✅ Match | ❌ Mismatch] |
| [field2] | [type] | [type] | [✅ Match | ❌ Mismatch] |

**Issues Found**:
- [如果有問題，列出]
- [例如：Expected `user_id` but found `userId`]

---

### Field Types Check

**Status**: [✅ PASS | ❌ FAIL]

| Field | Expected Type | Implemented Type | Status |
|-------|---------------|------------------|--------|
| [field1] | [string] | [string] | [✅ Match | ❌ Mismatch] |
| [field2] | [integer] | [number] | [❌ Type mismatch] |

**Issues Found**:
- [如果有問題，列出]
- [例如：Field `age` should be `integer` but is `string`]

---

### Validation Rules Check

**Status**: [✅ PASS | ❌ FAIL]

| Field | Rule | Expected | Implemented | Status |
|-------|------|----------|-------------|--------|
| [email] | required | true | true | ✅ |
| [email] | format | email | email | ✅ |
| [email] | maxLength | 255 | 255 | ✅ |
| [password] | minLength | 8 | [not implemented] | ❌ |

**Issues Found**:
- ❌ Missing validation: `password` field is missing `minLength: 8` validation
- [其他問題]

---

### Error Messages Check

**Status**: [✅ PASS | ❌ FAIL]

| Error Case | Expected Message | Implemented Message | Status |
|------------|------------------|---------------------|--------|
| Invalid credentials | "Invalid credentials" | "Invalid credentials" | ✅ |
| Email required | "Email is required" | "Email field is required" | ❌ |

**Issues Found**:
- ❌ Error message mismatch: Expected "Email is required" but found "Email field is required"
- [其他問題]

---

### API Endpoints Check (如果適用)

**Status**: [✅ PASS | ❌ FAIL]

| Endpoint | Expected Path | Implemented Path | Expected Method | Implemented Method | Status |
|----------|---------------|------------------|-----------------|-------------------|--------|
| Login | /api/auth/login | /api/auth/login | POST | POST | ✅ |
| Register | /api/auth/register | /api/user/register | POST | POST | ❌ |

**Issues Found**:
- ❌ Path mismatch: Register endpoint should be `/api/auth/register` but is `/api/user/register`

---

### Extra Fields Check (Hallucination Detection)

**Status**: [✅ PASS | ❌ FAIL]

**Fields in implementation but NOT in contract** (potential AI hallucination):
- [field1] - [type] - [❌ Should not exist]
- [field2] - [type] - [❌ Should not exist]

**Issues Found**:
- ❌ Extra field `username` found in implementation but not in contract
- [其他問題]

---

### Missing Fields Check

**Status**: [✅ PASS | ❌ FAIL]

**Fields in contract but NOT in implementation**:
- [field1] - [type] - [❌ Missing]
- [field2] - [type] - [❌ Missing]

**Issues Found**:
- ❌ Missing field: `passwordHash` is required by contract but not implemented
- [其他問題]

---

## 🧪 Test Coverage

**Status**: [✅ PASS (≥80%) | ⚠️ WARNING (<80%) | ❌ FAIL (<60%)]

**Coverage Stats**:
- Overall Coverage: [X]%
- Statements: [X]%
- Branches: [X]%
- Functions: [X]%
- Lines: [X]%

**Files Tested**:
- `[file1.ts]`: [X]% coverage
- `[file2.ts]`: [X]% coverage

**Issues Found**:
- [如果覆蓋率 < 80%，列出]
- [例如：Coverage is 65%, below required 80%]

---

## 📁 Files Checked

**Implementation Files**:
- `[src/features/login/login.model.ts]`
- `[src/features/login/login.service.ts]`
- `[src/features/login/login.controller.ts]`

**Test Files**:
- `[src/features/login/login.test.ts]`

---

## ❌ All Issues (Summary)

[如果 FAIL，列出所有問題的完整清單]

### Critical Issues (Must Fix):
1. ❌ **Field name mismatch**: Expected `user_id` but found `userId` in User model
2. ❌ **Missing validation**: `password` field missing `minLength: 8` validation
3. ❌ **Extra field**: `username` field not in contract (AI hallucination)

### Warnings (Should Fix):
1. ⚠️ **Test coverage**: Coverage is 75%, below recommended 80%
2. ⚠️ **Error message**: Slight wording difference in error message

---

## 🔧 How to Fix

[如果 FAIL，提供修復建議]

### Fix 1: Field Name Mismatch
**File**: `src/features/login/login.model.ts`
**Issue**: Field name `userId` should be `user_id`
**Fix**:
```typescript
// Change this:
interface User {
  userId: string;
}

// To this:
interface User {
  user_id: string;  // Match contract exactly
}
```

### Fix 2: Missing Validation
**File**: `src/features/login/login.model.ts`
**Issue**: Missing `minLength: 8` validation on `password` field
**Fix**:
```typescript
// Add validation:
password: {
  type: String,
  required: true,
  minLength: 8  // Add this
}
```

### Fix 3: Remove Extra Field
**File**: `src/features/login/login.model.ts`
**Issue**: Extra field `username` not in contract
**Fix**: Remove the `username` field entirely

---

## ✅ Next Steps

[如果 PASS]:
- ✅ Verification passed! This Work Package is ready.
- Next: Proceed to next Work Package or run integration verification

[如果 FAIL]:
- ❌ Verification failed. Fix the issues listed above.
- Re-run verification: `/speckit.verify --wp WP[###]`
- Repeat until all checks pass

---

## 📊 Contract Comparison Details

### contract-expected.yaml
```yaml
[粘貼相關的契約片段]
```

### contract-implementation.yaml (Extracted from Code)
```yaml
[粘貼從程式碼提取的契約片段]
```

---

## 🔍 Verification Method

**How this verification was performed**:
1. Extracted contract from implementation code → `contract-implementation.yaml`
2. Compared with `contract-expected.yaml`
3. Checked field names (exact match, case-sensitive)
4. Checked field types (exact match)
5. Checked validation rules (all rules must be implemented)
6. Checked error messages (word-for-word match)
7. Checked for extra fields (hallucination detection)
8. Checked for missing fields (completeness check)
9. Ran test suite and measured coverage

**Tools Used**:
- Contract extractor: [extractor script/tool]
- Contract comparator: [comparator script/tool]
- Test coverage: [coverage tool]

---

## 📝 Notes

[任何額外的註記或觀察]

- [註記 1]
- [註記 2]

---

**Generated by**: SpecKit V2 Verification System
**Report Version**: 1.0.0
