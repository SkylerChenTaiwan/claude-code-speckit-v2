# Visual Specification: [Feature Name]

**Feature ID**: [feature-###]
**Created**: [TIMESTAMP]
**Last Updated**: [TIMESTAMP]
**Source**: spec.md
**Status**: [Draft | Review | Approved]

---

## 📋 Overview

這是 **[Feature Name]** 的視覺規格（Visual Specification），是四層規格系統的 **Layer 2**。

**目的**: 定義使用者介面、使用者流程和前後端 API 契約

**這層規格是你的主要審核點** - 請仔細檢查：
- UI 設計是否符合預期
- 使用者流程是否完整
- API 契約的欄位名稱是否正確
- 錯誤訊息是否適當

如果這層錯了，下游所有實作都會錯！

---

## 🎯 What's Included

這個 Visual Spec 包含三個部分：

### 1. **Pages** (UI 頁面規格)
定義每個頁面的版面、元件和互動

### 2. **Flows** (使用者流程)
定義使用者如何一步步完成任務

### 3. **Contracts** (API 契約)
定義前後端之間的溝通格式（request/response）

---

## 📄 Pages (UI 頁面規格)

以下是所有 UI 頁面的規格：

| Page ID | Page Name | File | Status | Description |
|---------|-----------|------|--------|-------------|
| [page-001] | [Page Name] | [`pages/[page-name].md`](pages/[page-name].md) | [Draft/Review/Approved] | [一句話描述] |
| [page-002] | [Page Name] | [`pages/[page-name].md`](pages/[page-name].md) | [Draft/Review/Approved] | [一句話描述] |
| [page-003] | [Page Name] | [`pages/[page-name].md`](pages/[page-name].md) | [Draft/Review/Approved] | [一句話描述] |

**Total Pages**: [X]

**Review Priority**:
1. 🔴 High Priority: [列出需要優先審核的頁面]
2. 🟡 Medium Priority: [列出中優先級的頁面]
3. 🟢 Low Priority: [列出低優先級的頁面]

---

## 🔄 Flows (使用者流程)

以下是所有使用者流程的規格：

| Flow ID | Flow Name | File | Status | Covered User Stories |
|---------|-----------|------|--------|---------------------|
| [flow-001] | [Flow Name] | [`flows/[flow-name].md`](flows/[flow-name].md) | [Draft/Review/Approved] | US[###], US[###] |
| [flow-002] | [Flow Name] | [`flows/[flow-name].md`](flows/[flow-name].md) | [Draft/Review/Approved] | US[###], US[###] |
| [flow-003] | [Flow Name] | [`flows/[flow-name].md`](flows/[flow-name].md) | [Draft/Review/Approved] | US[###], US[###] |

**Total Flows**: [X]

**Flow Dependencies**:
```
[可選：如果流程之間有相依性，用圖表示]
Flow-001 (登入) → Flow-002 (瀏覽) → Flow-003 (結帳)
```

---

## 📡 Contracts (API 契約)

以下是所有 API 契約的規格：

| Contract ID | API Name | File | Endpoints | Status |
|-------------|----------|------|-----------|--------|
| [contract-001] | [API Name] | [`contracts/[api-name].yaml`](contracts/[api-name].yaml) | [X] endpoints | [Draft/Review/Approved] |
| [contract-002] | [API Name] | [`contracts/[api-name].yaml`](contracts/[api-name].yaml) | [X] endpoints | [Draft/Review/Approved] |
| [contract-003] | [API Name] | [`contracts/[api-name].yaml`](contracts/[api-name].yaml) | [X] endpoints | [Draft/Review/Approved] |

**Total Contracts**: [X]
**Total Endpoints**: [Y]

**API Endpoints Summary**:
| Endpoint | Method | Contract File | Purpose |
|----------|--------|---------------|---------|
| `/api/[resource]` | POST | [`contracts/[api].yaml`](contracts/[api].yaml) | [用途] |
| `/api/[resource]` | GET | [`contracts/[api].yaml`](contracts/[api].yaml) | [用途] |
| `/api/[resource]/:id` | PUT | [`contracts/[api].yaml`](contracts/[api].yaml) | [用途] |
| `/api/[resource]/:id` | DELETE | [`contracts/[api].yaml`](contracts/[api].yaml) | [用途] |

---

## 🗺️ Feature Map (功能地圖)

這個圖表顯示 Pages、Flows 和 Contracts 之間的關係：

```
[Feature Name]
│
├─ Pages
│  ├─ [Page 1] ──→ uses API: [Contract 1]
│  ├─ [Page 2] ──→ uses API: [Contract 1], [Contract 2]
│  └─ [Page 3] ──→ uses API: [Contract 3]
│
├─ Flows
│  ├─ [Flow 1] ──→ includes: [Page 1], [Page 2]
│  ├─ [Flow 2] ──→ includes: [Page 2], [Page 3]
│  └─ [Flow 3] ──→ includes: [Page 1], [Page 3]
│
└─ Contracts (APIs)
   ├─ [Contract 1]: [X] endpoints
   ├─ [Contract 2]: [Y] endpoints
   └─ [Contract 3]: [Z] endpoints
```

---

## 📊 Coverage Matrix

確保所有 User Stories 都有對應的 Visual Spec：

| User Story | Pages | Flows | Contracts | Coverage |
|------------|-------|-------|-----------|----------|
| US[###]: [Story] | [page-001] | [flow-001] | [contract-001] | ✅ Complete |
| US[###]: [Story] | [page-002] | [flow-001], [flow-002] | [contract-002] | ✅ Complete |
| US[###]: [Story] | [page-003] | - | [contract-003] | ⚠️ Missing flow |

**Coverage Stats**:
- ✅ Fully Covered: [X] User Stories
- ⚠️ Partially Covered: [Y] User Stories
- ❌ Not Covered: [Z] User Stories

---

## ✅ Review Checklist

使用此檢查清單審核 Visual Spec：

### UI/UX Review
- [ ] **UI Design**: 所有頁面的 UI 設計符合預期
- [ ] **User Experience**: 使用者流程直觀易懂
- [ ] **Consistency**: UI 元件命名一致（按鈕、表單等）
- [ ] **Accessibility**: 考慮到無障礙設計
- [ ] **Responsive**: 考慮到不同螢幕尺寸

### Flow Review
- [ ] **Completeness**: 所有 User Stories 都有對應的流程
- [ ] **Error Handling**: 所有錯誤情況都有處理
- [ ] **Edge Cases**: 邊界情況都有考慮
- [ ] **Happy Path**: 主要流程清晰明確

### Contract Review (最關鍵！)
- [ ] **Field Names**: API 欄位名稱正確且一致（user_id vs userId）
- [ ] **Field Types**: 資料類型正確（string, integer, boolean 等）
- [ ] **Validation Rules**: 所有驗證規則都有定義
- [ ] **Error Messages**: 錯誤訊息清晰且用戶友善
- [ ] **Request/Response**: Request 和 Response 格式完整
- [ ] **Status Codes**: HTTP 狀態碼使用正確

### Traceability Review
- [ ] **User Stories**: 每個 Visual Spec 都有對應的 User Story
- [ ] **Coverage**: 所有 User Stories 都被涵蓋
- [ ] **Links**: 所有引用連結都正確

---

## 🔍 How to Read This Spec

### Step 1: 從 User Story 開始
先閱讀 `../spec.md` 了解業務需求

### Step 2: 查看對應的 Flow
找到 User Story 對應的 Flow，了解使用者如何完成任務

### Step 3: 查看涉及的 Pages
根據 Flow，查看每個步驟對應的 Page 規格

### Step 4: 查看 API Contracts
查看 Pages 使用的 API Contracts，了解資料格式

### Step 5: 驗證完整性
使用 Coverage Matrix 確認所有需求都被涵蓋

---

## ⚠️ Important Notes

### 關於欄位命名
**非常重要**: API Contract 中定義的欄位名稱會被後續所有開發使用。

如果 Contract 定義：
```yaml
user_id: string
```

則：
- 後端 Model 會使用 `user_id`
- 前端 API 呼叫會使用 `user_id`
- 測試會驗證 `user_id`

**請仔細檢查欄位名稱**，改動成本很高！

### 關於錯誤訊息
Contract 中定義的錯誤訊息會被**完全照搬**到實作中。

請確保錯誤訊息：
- 清晰易懂
- 用戶友善
- 可操作（告訴使用者如何修正）

### 關於驗證規則
所有在 Contract 中定義的驗證規則都**必須**被實作。

不要定義不打算實作的規則！

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| [TIMESTAMP] | 1.0.0 | Initial creation | AI |
| [TIMESTAMP] | 1.1.0 | [修改內容] | [修改者] |

---

## 🔗 Related Documents

**Layer 1 (Requirements)**:
- `../spec.md` - Requirements Specification

**Layer 3 (Design)** (will be generated):
- `../design-spec.yaml` - Technical Design Specification

**Layer 4 (Implementation)** (will be generated):
- `../work-packages/` - Work Packages for implementation

---

## 📞 Questions or Feedback?

如果在審核過程中有任何問題：

1. 先檢查 Coverage Matrix 是否有遺漏
2. 查看相關的 User Story（spec.md）
3. 如果需要修改，請記錄修改原因

**Remember**: 這是實作前最後的人類審核點！

---

**Generated by**: SpecKit V2 - `/speckit.visualize`
**Template Version**: 1.0.0
