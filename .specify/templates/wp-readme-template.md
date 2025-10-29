# Work Package [ID]: [Name]

**Work Package ID**: WP[###]
**Type**: [Complete Feature - Full Stack]
**Status**: ⏳ Not Started
**Generated**: [TIMESTAMP]
**Source**: design-spec.yaml

---

## 📋 Overview

[一句話描述這個 Work Package 要實作什麼完整功能]

**功能範圍**：
- 後端：[Model + API endpoint(s)]
- 前端：[UI Page/Component]
- 測試：[Unit tests + Integration tests]

---

## 🎯 Objectives

**實作目標**：
- [ ] 實作完整的 [功能名稱] 功能
- [ ] 包含前後端完整整合
- [ ] 所有測試通過（覆蓋率 ≥ 80%）
- [ ] 契約驗證通過

**涵蓋的 User Stories**：
- ✅ US[###]: [User Story 簡述]
- ✅ US[###]: [User Story 簡述]

**驗收標準**：
- [ ] [具體的驗收標準 1]
- [ ] [具體的驗收標準 2]
- [ ] [具體的驗收標準 3]

---

## 📚 Tasks Breakdown

此 Work Package 包含以下 tasks（依序執行）：

### Task 1: 寫測試 (TDD - Red)
**檔案**: `task-001-write-tests.md`
**預估時間**: 30-45 分鐘
**目標**: 撰寫會失敗的測試，定義預期行為

### Task 2: 實作後端 (TDD - Green)
**檔案**: `task-002-implement-backend.md`
**預估時間**: 45-60 分鐘
**目標**: 實作 Model + API，讓後端測試通過

### Task 3: 實作前端 (TDD - Green)
**檔案**: `task-003-implement-frontend.md`
**預估時間**: 45-60 分鐘
**目標**: 實作 UI，讓前端測試通過

### Task 4: 整合與重構 (TDD - Refactor)
**檔案**: `task-004-integration.md`
**預估時間**: 30-45 分鐘
**目標**: 前後端整合，端對端測試，重構

---

## 🔗 Dependencies

**重要**: 此 Work Package **零相依**

- ✅ 可以立即開始執行
- ✅ 不需要等待其他 Work Package
- ✅ 可與所有其他 WP 平行執行

**檔案隔離**：
- 此 WP 的所有檔案位於：`src/features/[feature-name]/`
- 不會修改其他 WP 的檔案
- 如果需要共用元件（如 Button），自己建立一個簡單版本

---

## 📝 Deliverables

完成此 Work Package 後，應該建立以下檔案：

### 後端檔案
```
src/features/[feature-name]/
  ├── [feature].model.ts          # 資料模型
  ├── [feature].service.ts        # 業務邏輯
  ├── [feature].controller.ts     # API 端點
  └── [feature].test.ts           # 後端測試
```

### 前端檔案
```
src/features/[feature-name]/
  ├── [Feature]Page.tsx           # 主頁面
  ├── [Feature]Page.test.tsx      # 頁面測試
  └── components/
      ├── [Component].tsx         # 子元件
      └── [Component].test.tsx    # 元件測試
```

### 整合測試
```
tests/
  └── e2e/
      └── [feature].spec.ts       # 端對端測試
```

---

## 🎯 Contract (契約)

**重要**: 此 Work Package 必須嚴格遵守 `contract-expected.yaml` 中定義的契約

契約檔案：`work-packages/WP[###]/contract-expected.yaml`

### 關鍵契約要求

**資料模型欄位**（EXACT - 不可修改）:
- [列出關鍵欄位和類型]

**API 端點**（EXACT - 不可修改）:
- [列出 API path 和 method]

**Request/Response 格式**（EXACT - 不可修改）:
- [列出關鍵的 request/response 欄位]

**驗證規則**（ALL - 不可省略）:
- [列出所有驗證規則]

---

## ✅ Verification (驗證)

完成所有 tasks 後，執行驗證：

```bash
/speckit.verify --wp WP[###]
```

驗證會檢查：
1. ✅ 所有測試通過
2. ✅ 測試覆蓋率 ≥ 80%
3. ✅ 實作的欄位名稱與契約完全一致
4. ✅ 實作的 API 路徑與契約完全一致
5. ✅ 所有驗證規則都已實作
6. ✅ 錯誤訊息與契約完全一致

---

## 🚫 Out of Scope

**不要實作**以下內容（它們在其他 Work Package）：
- [列出不在此 WP 範圍內的功能]
- [列出其他 WP 負責的功能]

**不要修改**以下檔案：
- [列出其他 WP 的檔案路徑]

---

## 📖 How to Execute

### Step 1: 閱讀此 README
了解整個 Work Package 的目標和範圍

### Step 2: 依序執行 Tasks
```bash
# Task 1: 寫測試
/speckit.implement WP[###]/task-001

# Task 2: 實作後端
/speckit.implement WP[###]/task-002

# Task 3: 實作前端
/speckit.implement WP[###]/task-003

# Task 4: 整合
/speckit.implement WP[###]/task-004
```

### Step 3: 驗證
```bash
/speckit.verify --wp WP[###]
```

### Step 4: 檢查 Journal
檢查 `journal.md` 確認所有工作都已記錄

---

## 📝 Work Journal

所有實作過程的決定和進度都記錄在：`work-packages/WP[###]/journal.md`

每完成一個 task，必須在 journal 中記錄：
- 做了什麼
- 建立/修改了哪些檔案
- 遇到什麼問題
- 做了什麼決定

---

## 🔄 Traceability

**來源**：
- Requirements: `spec.md#US[###]`
- Visual Spec: `visual-spec/pages/[page].md`, `visual-spec/contracts/[api].yaml`
- Design Spec: `design-spec.yaml#[section]`

**契約**：
- Expected: `work-packages/WP[###]/contract-expected.yaml`
- Implemented: (執行 verify 後生成)

**驗證報告**：
- `work-packages/WP[###]/verification-report.md` (verify 後生成)
