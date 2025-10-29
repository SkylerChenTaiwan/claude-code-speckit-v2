# Work Package WP001: 專案管理與檔案操作功能

**Work Package ID**: WP001
**Type**: Complete Feature - Full Stack
**Status**: ⏳ Not Started
**Generated**: 2025-10-29
**Source**: design-spec.yaml

---

## 📋 Overview

實作完整的專案檔案管理功能，包含建立專案、載入專案、儲存專案、最近專案列表等。

**功能範圍**：
- 後端：file:read, file:write, file:select, directory:select IPC handlers
- 前端：HomePage 頁面（含最近專案列表、快速動作按鈕）
- 測試：Unit tests + Integration tests + E2E tests

---

## 🎯 Objectives

**實作目標**：
- [ ] 實作完整的專案檔案管理功能（CRUD）
- [ ] 包含 Electron IPC 通道與 Renderer 頁面完整整合
- [ ] 所有測試通過（覆蓋率 ≥ 80%）
- [ ] 契約驗證通過

**涵蓋的 User Stories**：
- ✅ US004: 專案管理與範本功能 - 專案載入與儲存部分

**驗收標準**：
- [ ] 使用者可以建立新專案（開啟檔案儲存對話框）
- [ ] 使用者可以載入現有專案（JSON 格式）
- [ ] 使用者可以看到最近 3 個專案列表
- [ ] 專案檔案符合 ProjectFile 資料結構
- [ ] 檔案操作錯誤有清楚的錯誤訊息

---

## 📚 Tasks Breakdown

此 Work Package 包含以下 tasks（依序執行）：

### Task 1: 寫測試 (TDD - Red)
**檔案**: `task-001-write-tests.md`
**預估時間**: 45 分鐘
**目標**: 撰寫會失敗的測試，定義檔案 IPC 和 HomePage 的預期行為

### Task 2: 實作後端 (TDD - Green)
**檔案**: `task-002-implement-backend.md`
**預估時間**: 60 分鐘
**目標**: 實作 file IPC handlers，讓後端測試通過

### Task 3: 實作前端 (TDD - Green)
**檔案**: `task-003-implement-frontend.md`
**預估時間**: 60 分鐘
**目標**: 實作 HomePage UI，讓前端測試通過

### Task 4: 整合與重構 (TDD - Refactor)
**檔案**: `task-004-integration.md`
**預估時間**: 45 分鐘
**目標**: 前後端整合，端對端測試，重構

---

## 🔗 Dependencies

**重要**: 此 Work Package **零相依**

- ✅ 可以立即開始執行
- ✅ 不需要等待其他 Work Package
- ✅ 可與所有其他 WP 平行執行

**檔案隔離**：
- 此 WP 的所有檔案位於：
  - Main Process: `src/main/ipc/fileHandlers.ts`
  - Renderer: `src/renderer/pages/HomePage/`
  - Tests: 各自的測試檔案
- 不會修改其他 WP 的檔案
- 如果需要共用元件（如 Button），自己建立一個簡單版本

---

## 📝 Deliverables

完成此 Work Package 後，應該建立以下檔案：

### 後端檔案
```
src/main/
  ├── ipc/
  │   ├── fileHandlers.ts          # IPC 通道 handlers
  │   └── fileHandlers.test.ts     # IPC handlers 測試
  └── utils/
      ├── fileValidator.ts         # 檔案驗證邏輯
      └── recentProjects.ts        # 最近專案管理
```

### 前端檔案
```
src/renderer/
  ├── pages/HomePage/
  │   ├── HomePage.tsx             # 首頁元件
  │   ├── HomePage.test.tsx        # 首頁測試
  │   └── components/
  │       ├── RecentProjectCard.tsx
  │       ├── RecentProjectCard.test.tsx
  │       ├── QuickActionButton.tsx
  │       └── QuickActionButton.test.tsx
  └── stores/
      └── projectStore.ts          # 專案狀態管理（Zustand）
```

### 整合測試
```
tests/
  └── e2e/
      └── project-file-management.spec.ts  # E2E 測試
```

---

## 🎯 Contract (契約)

**重要**: 此 Work Package 必須嚴格遵守 `contract-expected.yaml` 中定義的契約

契約檔案：`work-packages/WP001-project-file-management/contract-expected.yaml`

### 關鍵契約要求

**資料模型欄位**（EXACT - 不可修改）:
- `ProjectFile`: version, projectId, projectName, createdAt, updatedAt, currentStage, scriptContent, settings, generatedAssets
- `ProjectSettings`: voiceId, outputPath, imageStyle, didSettings, subtitleStyle, logoSettings

**IPC 通道**（EXACT - 不可修改）:
- `file:read` (invoke) - 讀取檔案內容
- `file:write` (invoke) - 寫入檔案內容
- `file:select` (invoke) - 開啟檔案選擇對話框
- `directory:select` (invoke) - 開啟目錄選擇對話框

**Request/Response 格式**（EXACT - 不可修改）:
- file:read request: `{ path: string }`
- file:read response: `{ content: string, error?: string }`
- file:write request: `{ path: string, content: string }`
- file:write response: `{ success: boolean, error?: string }`

**驗證規則**（ALL - 不可省略）:
- projectName: minLength: 1, maxLength: 100
- 檔案路徑必須是絕對路徑
- JSON 檔案必須可解析
- ProjectFile 必須有 version 和 projectId

---

## ✅ Verification (驗證)

完成所有 tasks 後，執行驗證：

```bash
/speckit.verify --wp WP001
```

驗證會檢查：
1. ✅ 所有測試通過
2. ✅ 測試覆蓋率 ≥ 80%
3. ✅ 實作的欄位名稱與契約完全一致
4. ✅ 實作的 IPC 通道名稱與契約完全一致
5. ✅ 所有驗證規則都已實作
6. ✅ 錯誤訊息與契約完全一致

---

## 🚫 Out of Scope

**不要實作**以下內容（它們在其他 Work Package）：
- TTS 功能（WP002）
- Gemini 腳本生成（WP003）
- 腳本編輯功能（WP004）
- API 金鑰管理（WP011）- 只需要檢查狀態，不實作設定對話框

**不要修改**以下檔案：
- 其他 WP 的任何檔案

---

## 📖 How to Execute

### Step 1: 閱讀此 README
了解整個 Work Package 的目標和範圍

### Step 2: 依序執行 Tasks
```bash
# Task 1: 寫測試
/speckit.implement WP001/task-001

# Task 2: 實作後端
/speckit.implement WP001/task-002

# Task 3: 實作前端
/speckit.implement WP001/task-003

# Task 4: 整合
/speckit.implement WP001/task-004
```

### Step 3: 驗證
```bash
/speckit.verify --wp WP001
```

### Step 4: 檢查 Journal
檢查 `journal.md` 確認所有工作都已記錄

---

## 📝 Work Journal

所有實作過程的決定和進度都記錄在：`work-packages/WP001-project-file-management/journal.md`

每完成一個 task，必須在 journal 中記錄：
- 做了什麼
- 建立/修改了哪些檔案
- 遇到什麼問題
- 做了什麼決定

---

## 🔄 Traceability

**來源**：
- Requirements: `spec.md#US004`
- Visual Spec: `visual-spec/pages/01-home-page.md`
- Design Spec: `design-spec.yaml#data_models.ProjectFile`, `design-spec.yaml#api_endpoints.file_*`

**契約**：
- Expected: `work-packages/WP001-project-file-management/contract-expected.yaml`
- Implemented: (執行 verify 後生成)

**驗證報告**：
- `work-packages/WP001-project-file-management/verification-report.md` (verify 後生成)
