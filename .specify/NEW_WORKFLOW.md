# SpecKit V2 - 新工作流程（七層規格系統）

**最後更新**: 2025-01-15
**版本**: 2.0.0

---

## 概述

SpecKit V2 使用**七層規格系統**將使用者需求轉換為經過驗證的實作，支援**平行 AI 開發**和**基於契約的驗證**。

**核心原則**：
- 垂直切分功能（非水平切分）
- 零相依性（所有 Work Package 可同時執行）
- 測試驅動開發（TDD 強制）
- 契約驗證（防止 AI 幻覺）

---

## 七個層級

```
Layer 1: 需求規格 (spec.md)
  ↓ /speckit.clarify（可選）
  ↓ /speckit.visualize
  ↓
Layer 2: 視覺規格 (visual-spec/)  ← 你的主要審核點
  ↓ /speckit.plan
  ↓
Layer 3: 設計規格 (design-spec.yaml)
  ↓ /speckit.breakdown
  ↓
Layer 4: Work Packages (work-packages/)
  ↓ /speckit.implement（只寫程式碼，平行執行）
  ↓ /speckit.verify（自動執行：契約驗證 + 測試 + 診斷）
     ├─ 生成 verification-report.md
     └─ 如果測試失敗 → 生成 diagnosis-report.md
  ↓
  ↓ 查看診斷報告，選擇修正路徑：
     ├─ 設計問題 → 修正 Layer 1/2 → /speckit.plan → /speckit.breakdown
     ├─ 實作問題 → /speckit.fix（自動重新執行 verify）
     └─ AI 幻覺   → /speckit.fix（自動重新執行 verify）
  ↓
  ↓ 循環直到所有 WP 測試通過
  ↓
Layer 5: 整合與整合測試
  ↓ /speckit.analyze --all（分析重複與衝突）
     └─ 生成 integration-analysis.md
  ↓ /speckit.integrate --dry-run（預覽）
  ↓ /speckit.integrate --full（執行整合）
     ├─ 合併重複元件
     ├─ 解決命名衝突
     ├─ 建立統一目錄結構
     └─ 生成 integration-report.md
  ↓ /speckit.test --integration（AI 自動整合測試）
     ├─ 測試個別 WP 功能
     ├─ 測試跨 WP 流程（E2E）
     ├─ 測試共用元件
     └─ 生成 integration-test-report.md
  ↓ 測試失敗？
     ├─ 是 → /speckit.fix-integration --auto（自動修正並重新測試）
     └─ 否 → 進入下一階段
  ↓
Layer 6: 人工測試（UAT）
  ↓ /speckit.uat --prepare-env（快速啟動測試環境，5 秒）
     ├─ 根據 deployment.target 選擇啟動方式
     ├─ Static HTML: HTTP server + 開啟瀏覽器
     ├─ Electron: 啟動 app 視窗
     └─ GCP: Docker 本地模擬環境
  ↓ 人工測試（15-30 分鐘）
     └─ 測試功能、UI/UX、效能、邊界情況
  ↓ /speckit.uat --report（互動式記錄測試結果）
     └─ AI 逐項詢問測試結果
  ↓ UAT 通過？
     ├─ 是 → /speckit.uat --stop → 進入部署階段
     └─ 否 → 修正問題 → 重新執行 /speckit.uat --prepare-env
  ↓
Layer 7: 部署準備
  ↓ /speckit.deploy（生成部署配置）
     ├─ 讀取 design-spec.yaml 的 deployment 區塊
     ├─ 根據 deployment.target 生成對應配置
     └─ 產生 deployment/ 目錄
  ↓ ./deployment/build.sh（真正的生產建置）
     ├─ Static HTML: 產生 dist/index.html
     ├─ Electron: 產生 .exe / .dmg / .deb 安裝檔
     └─ GCP: 建置 Docker image
  ↓ ./deployment/deploy.sh（部署，如果需要）
     ├─ Static HTML: 上傳到 hosting
     ├─ Electron: 發布到 GitHub Releases
     └─ GCP: 部署到 Cloud Run
  ↓
  └─ ✅ 完成，已上線！
```
---

### Layer 1: 需求規格 (spec.md)

**建立者**: 人類（你）
**指令**: `/speckit.specify <功能描述>`
**格式**: Markdown（簡單、人類可讀）
**目的**: 定義使用者需要**什麼**以及**為什麼**

**包含內容**:
- User Stories（優先級排序：P1、P2、P3）
- 驗收場景（Given-When-Then）
- 功能需求
- 成功標準（可衡量、技術無關）

**審核點**: 你要審核業務邏輯是否正確

**可選步驟**: `/speckit.clarify` - AI 會問你問題來補充模糊之處

---

### Layer 2: 視覺規格 (visual-spec/)

**建立者**: AI + 人類審核
**指令**: `/speckit.visualize`
**格式**: Markdown（UI 設計） + YAML（API 契約）
**目的**: 定義**長什麼樣子**以及**各部分如何溝通**

**包含內容**:
- `pages/`: UI 頁面規格（版面、元件、互動）
- `flows/`: 使用者流程圖（逐步場景）
- `contracts/`: API 契約（精確的 request/response 格式）

**審核點**: **你必須審核這一層**（最重要！）
- 檢查 UI 版面是否符合預期
- 驗證使用者流程是否正確
- **確認 API 契約的欄位名稱**（這會影響後續所有開發）
- 檢查錯誤訊息是否適當

**為什麼這層重要？**
- 如果視覺規格錯了，下游所有東西都會錯
- 這是實作前最後的人類審核點
- 契約在這裡定義，後續只是翻譯

---

### Layer 3: 設計規格 (design-spec.yaml)

**建立者**: AI（從視覺規格生成）
**指令**: `/speckit.plan`
**格式**: YAML（機器可讀）
**目的**: 定義技術實作細節

**包含內容**:
- 資料模型（精確的欄位名稱、類型、驗證規則）
- API 端點（從契約生成）
- UI 元件（從頁面生成）
- 業務邏輯（從流程生成）
- **測試框架資訊**（Jest、Pytest 等）
- 技術環境（語言、框架）

**審核點**: 可選（如果視覺規格正確，通常會自動正確生成）

**重要**：這一層會指定使用的測試框架，後續會根據此生成對應的測試模板。

---

### Layer 4: Work Packages (work-packages/)

**建立者**: AI（從設計規格分解）
**指令**: `/speckit.breakdown`
**格式**: 多個獨立的 Work Package 資料夾
**目的**: 分解成可平行執行的小任務

**每個 Work Package 包含**:
```
WP001-login-feature/
  ├── README.md                     # WP 概述
  ├── task-001-write-tests.md      # Task 1: 寫測試
  ├── task-002-implement-api.md    # Task 2: 實作 API
  ├── task-003-implement-ui.md     # Task 3: 實作 UI
  ├── task-004-integration.md      # Task 4: 整合測試
  ├── contract-expected.yaml       # 契約（驗證用）
  ├── journal.md                   # 工作日誌（記錄所有決定和修正）
  ├── verification-report.md       # verify 生成（契約驗證結果）
  └── diagnosis-report.md          # verify 生成（測試診斷結果，如果失敗）
```

**重要原則**:
- **垂直切分**：每個 WP 是完整功能（Model + API + UI + Tests）
- **零相依**：所有 WP 可同時開始執行
- **最少 6 個**：小功能 6-8 個，中功能 8-12 個，大功能 15+ 個
- **TDD 強制**：每個 WP 的第一個 task 必須是寫測試

---

## 快速參考：完整指令流程

```bash
# ===== Phase 1-3: 規格制定 =====
/speckit.specify "功能描述"        # 建立需求規格
/speckit.clarify                   # (可選) 釐清模糊之處
/speckit.visualize                 # 生成視覺規格 ← 你要審核！
/speckit.plan                      # 生成設計規格
/speckit.breakdown                 # 分解成 Work Packages

# ===== Phase 4: 實作 (可平行) =====
/speckit.implement WP001/task-001  # AI 只寫程式碼
/speckit.implement WP001/task-002  # AI 只寫程式碼
...

# ===== Phase 5: 驗證與修正 =====
/speckit.verify --wp WP001         # 自動：契約驗證 + 測試 + 診斷
                                   # → 生成 verification-report.md
                                   # → 生成 diagnosis-report.md (如果失敗)

# 查看診斷報告，然後選擇：
# 選項 A: 設計問題
#   → 手動修正 spec.md 或 visual-spec/
#   → /speckit.plan
#   → /speckit.breakdown
#   → /speckit.implement WP###/task-###

# 選項 B: 實作問題或 AI 幻覺
/speckit.fix --wp WP001 --issue "..."  # 手動指定問題（建議）
# 或
/speckit.fix --wp WP001 --auto         # 自動修正所有診斷出的問題

# fix 會自動執行 verify，如果還有問題會再生成新的診斷報告
# 循環直到通過

# ===== Phase 6: 整合與整合測試 =====
/speckit.analyze --all             # 分析重複元件和衝突
                                   # → 生成 integration-analysis.md

/speckit.integrate --dry-run       # 預覽整合結果（建議先執行）
/speckit.integrate --full          # 執行完整整合
                                   # → 合併重複元件
                                   # → 解決命名衝突
                                   # → 建立統一目錄結構
                                   # → 生成 integration-report.md

/speckit.test --integration        # 執行整合測試
                                   # → 測試個別 WP 功能
                                   # → 測試跨 WP 流程（E2E）
                                   # → 測試共用元件
                                   # → 生成 integration-test-report.md
                                   # → 生成 integration-diagnosis-report.md（如果失敗）

# 如果整合測試失敗，查看診斷報告並修正
/speckit.fix-integration --issue "..."  # 修正整合問題
# 或
/speckit.fix-integration --auto         # 自動修正所有診斷出的問題

# fix-integration 會自動重新執行 /speckit.test --integration
# 循環直到所有測試通過

/speckit.verify --final            # 最終驗證
/speckit.cleanup                   # 清理暫存檔案
```

**關鍵理解**：
- `/speckit.implement` = 只寫程式碼，不測試
- `/speckit.verify` = 契約驗證 + 測試 + 自動診斷（如果失敗）
- `/speckit.fix` = 修正程式碼 + 自動重新 verify

---

## 完整工作流程

### Phase 1: 規格制定（人類主導）

```bash
# Step 1: 建立需求規格
/speckit.specify "新增使用 email/password 的使用者認證"
# 輸出: specs/001-user-auth/spec.md

# Step 2: （可選）釐清模糊之處
/speckit.clarify
# AI 會問你最多 5 個問題，補充 spec.md

# Step 3: 生成視覺規格
/speckit.visualize
# 輸出: specs/001-user-auth/visual-spec/
#   ├── pages/login-page.md
#   ├── flows/login-flow.md
#   └── contracts/auth-api.yaml

# Step 4: 審核視覺規格（關鍵！）
# 仔細檢查：
# - UI 設計是否正確
# - 使用者流程是否完整
# - API 契約欄位名稱是否正確（userId vs user_id）
# - 錯誤訊息是否適當

# Step 5: 生成設計規格
/speckit.plan
# 輸出: specs/001-user-auth/design-spec.yaml
# 包含測試框架資訊
```

**到這裡**: 所有規格都已完成並審核。

---

### Phase 2: 分解（AI 主導）

```bash
# Step 6: 分解成 Work Packages
/speckit.breakdown

# 輸出（垂直切分，零相依）:
#   specs/001-user-auth/work-packages/
#   ├── WP001-login-feature/          （完整的登入功能）
#   │   ├── README.md
#   │   ├── task-001-write-tests.md
#   │   ├── task-002-implement-api.md
#   │   ├── task-003-implement-ui.md
#   │   ├── task-004-integration.md
#   │   ├── contract-expected.yaml
#   │   └── journal.md
#   ├── WP002-register-feature/       （完整的註冊功能）
#   ├── WP003-reset-password-feature/ （完整的密碼重設）
#   ├── WP004-profile-feature/        （完整的個人資料）
#   ├── WP005-logout-feature/         （完整的登出功能）
#   └── WP006-session-management/     （Session 管理）
```

**重要**：
- 至少 6 個 WP
- 每個 WP 是完整功能（前後端都有）
- 所有 WP 可同時開始（零相依）

**到這裡**: 工作已被分割成小的、可平行執行的單元。

---

### Phase 3: 實作（平行 AI 開發）

**可以同時開 6 個 AI（或更多）**：

```bash
# Terminal 1（新 AI 對話）
/speckit.implement WP001/task-001  # 寫登入測試
/speckit.implement WP001/task-002  # 實作登入 API
/speckit.implement WP001/task-003  # 實作登入 UI
/speckit.implement WP001/task-004  # 整合測試

# Terminal 2（另一個新 AI 對話，同時執行）
/speckit.implement WP002/task-001  # 寫註冊測試
/speckit.implement WP002/task-002  # 實作註冊 API
...

# Terminal 3（又一個新 AI 對話，同時執行）
/speckit.implement WP003/task-001
...
```

**每個 AI 會**：
1. 讀取 task 檔案（知道要做什麼）
2. 讀取 WP README（了解整體目標）
3. 讀取 contract-expected.yaml（契約是聖經）
4. 讀取 journal.md（看前面的決定）
5. 按照 TDD 流程執行（Red → Green → Refactor）
6. 記錄到 journal.md

**到這裡**: 所有 WP 的程式碼都寫好了。

---

### Phase 4: 驗證與測試（自動診斷）

```bash
# 驗證每個 WP（會自動執行契約驗證 + 測試 + 診斷）
/speckit.verify --wp WP001
/speckit.verify --wp WP002
/speckit.verify --wp WP003
...

# 或一次驗證全部
/speckit.verify --all
```

**verify 指令會自動執行**：

**Step 1: 契約驗證**
- ✅ 所有欄位名稱與契約一致（userId vs user_id）
- ✅ 所有驗證規則已實作
- ✅ 錯誤訊息與契約完全相同
- ✅ 沒有新增契約外的欄位（防止 AI 幻覺）

**Step 2: 執行測試**
- ✅ 執行所有單元測試
- ✅ 執行所有整合測試
- ✅ 檢查測試覆蓋率 ≥ 80%
- ✅ 檢查沒有 console 錯誤或警告

**Step 3: 自動診斷（如果測試失敗）**
- 🔍 比對測試期望 vs 契約期望
- 🔍 比對實作輸出 vs 契約期望
- 🔍 檢查實作是否超出契約範圍
- 📝 生成 `diagnosis-report.md`

**verify 完成後會生成兩個報告**：
1. `verification-report.md` - 契約驗證結果
2. `diagnosis-report.md` - 測試診斷結果（如果測試失敗）

---

**診斷報告範例** (`diagnosis-report.md`):

```markdown
# 診斷報告 - WP001

## 驗證狀態
- 契約驗證: ✅ 通過
- 測試執行: ❌ 失敗 (3/15 失敗)

## 測試失敗摘要
- 失敗測試數: 3/15
- 主要問題: API 回應格式不符

## 根因分析

### 問題 1: userId vs user_id
- **根因類型**: 設計問題
- **發現位置**: contract-expected.yaml 使用 userId，但 spec.md 提到 user_id
- **影響範圍**: WP001, WP002, WP004
- **建議修正層級**: Layer 2 (visual-spec/contracts/auth-api.yaml)
- **建議指令**: 修正 visual-spec 後執行 /speckit.plan 和 /speckit.breakdown

### 問題 2: 缺少 email 驗證
- **根因類型**: 實作問題
- **發現位置**: 實作未檢查 email 格式，但契約要求必須驗證
- **影響範圍**: WP001
- **建議修正層級**: 程式碼修正 (不需更新 spec)
- **建議指令**: /speckit.fix --wp WP001 --issue "缺少 email 驗證"

### 問題 3: 多了 createdAt 欄位
- **根因類型**: AI 幻覺
- **發現位置**: 實作回傳了契約中沒定義的 createdAt
- **影響範圍**: WP001
- **建議修正層級**: 程式碼修正 (移除多餘欄位)
- **建議指令**: /speckit.fix --wp WP001 --issue "移除契約外的 createdAt 欄位"
```

---

### Phase 5: 修正問題

根據 `diagnosis-report.md` 的建議，選擇對應的修正路徑：

#### Step 5.1: 根據診斷結果選擇修正路徑

**路徑 A: 設計問題 → 向上修正**

如果診斷顯示是設計問題(契約或 spec 錯了):

```bash
# 1. 修正對應層級
# - 如果是業務邏輯錯誤 → 修正 spec.md (Layer 1)
# - 如果是 UI/API 設計錯誤 → 修正 visual-spec/ (Layer 2)

# 2. 重新生成下游
# 假設我們修正了 Layer 2 的契約
/speckit.plan           # 重新生成 design-spec.yaml
/speckit.breakdown      # 重新生成 work-packages

# 3. 受影響的 WP 需要重新實作
/speckit.implement WP001/task-002  # 重新實作受影響的 task

# 4. 重新驗證和測試
/speckit.verify --wp WP001
npm test -- work-packages/WP001
```

**重要**: 設計問題必須從源頭修正，不能只改程式碼！

---

**路徑 B: 實作問題 → 當層修正**

如果診斷顯示是實作問題(AI 沒照契約實作):

```bash
# 使用 fix 指令修正程式碼（會自動記錄到 journal.md）
/speckit.fix --wp WP001 --issue "未實作 email 格式驗證，參考 contract-expected.yaml"

# fix 指令會：
# 1. 讀取契約
# 2. 修正程式碼
# 3. 記錄到 journal.md
# 4. 自動執行 /speckit.verify 重新驗證
```

**重要**: 實作問題必須嚴格遵守契約，不能改契約來遷就實作！

---

**路徑 C: AI 幻覺 → 移除多餘部分**

如果 AI 實作了契約外的東西:

```bash
# 明確要求移除契約外的內容
/speckit.fix --wp WP001 --issue "移除契約外的欄位 createdAt，契約中沒有此欄位"

# fix 指令會：
# 1. 讀取契約
# 2. 移除多餘欄位
# 3. 記錄到 journal.md
# 4. 自動執行 /speckit.verify 重新驗證
```

**重要**: 契約就是聖經，任何契約外的東西都必須移除！

---

#### Step 5.2: 迭代直到所有測試通過

```bash
# 完整的修正循環:

1. /speckit.verify --wp WP001
   └─ 生成 diagnosis-report.md

2. 根據診斷報告決定:
   ├─ 設計問題 → 修正 spec/visual-spec → /speckit.plan → /speckit.breakdown
   ├─ 實作問題 → /speckit.fix --wp WP001 --issue "..."
   └─ AI 幻覺   → /speckit.fix --wp WP001 --issue "移除..."

3. fix 完成後會自動執行 /speckit.verify
   └─ 如果還有問題，重複步驟 2
   └─ 如果通過，進入下一個 WP

4. 所有 WP 都通過 → Phase 6
```

**到這裡**: 所有 WP 的測試都通過了，準備整合。

---

### Phase 6: 整合與整合測試

當所有 WP 都通過驗證後，需要進行整合：

#### Step 6.1: 分析重複與衝突

```bash
# 分析所有 WP，找出重複的元件和潛在衝突
/speckit.analyze --all

# 輸出: integration-analysis.md
```

**analyze 會檢查**：
- 🔍 重複的 UI 元件（例如：Button, Input, Card）
- 🔍 重複的 utility 函數（例如：formatDate, validateEmail）
- 🔍 命名衝突（不同 WP 有同名但不同實作的元件）
- 🔍 相依性分析（雖然設計為零相依，但檢查實際情況）
- 🔍 API 路徑衝突（確保沒有重複的路徑）

**analysis-report.md 範例**：
```markdown
# 整合分析報告

## 重複元件

### UI 元件
| 元件名稱 | 出現次數 | 位置 | 相似度 | 建議 |
|---------|---------|------|--------|------|
| Button | 4 | WP001, WP002, WP003, WP005 | 95% | 合併為共用元件 |
| Input | 3 | WP001, WP002, WP003 | 90% | 合併為共用元件 |
| Card | 2 | WP003, WP004 | 60% | 保留各自實作 |

### Utility 函數
| 函數名稱 | 出現次數 | 位置 | 相似度 | 建議 |
|---------|---------|------|--------|------|
| formatDate | 3 | WP001, WP003, WP004 | 100% | 合併 |
| validateEmail | 2 | WP001, WP002 | 100% | 合併 |

## 命名衝突

❌ **衝突 #1: FormValidator**
- WP001: `src/WP001/validators/FormValidator.ts` (處理登入表單)
- WP002: `src/WP002/validators/FormValidator.ts` (處理註冊表單)
- 相似度: 40%
- 建議: 重新命名為 LoginFormValidator 和 RegisterFormValidator

## API 路徑檢查

✅ 無衝突 - 所有 API 路徑唯一

## 建議整合策略

1. **共用元件** (相似度 ≥ 90%)
   - 移動到 `src/shared/components/`
   - 移除 WP 內的重複實作

2. **保留各自實作** (相似度 < 60%)
   - 各 WP 保留自己的實作
   - 但重新命名避免衝突

3. **部分整合** (60% ≤ 相似度 < 90%)
   - 建立共用基礎元件
   - 各 WP 擴展基礎元件
```

---

#### Step 6.2: 執行整合

```bash
# 根據分析報告執行整合
/speckit.integrate

# 或分階段整合（更安全）
/speckit.integrate --dry-run      # 預覽整合結果，不實際修改
/speckit.integrate --components   # 只整合元件
/speckit.integrate --utils        # 只整合 utility
/speckit.integrate --full         # 完整整合
```

**integrate 會做什麼**：

**1. 合併重複元件（Deduplication）**
```bash
# 整合前:
work-packages/WP001/components/Button.tsx
work-packages/WP002/components/Button.tsx
work-packages/WP003/components/Button.tsx

# 整合後:
src/shared/components/Button.tsx  ← 合併後的版本
work-packages/WP001/  ← Button.tsx 被移除
work-packages/WP002/  ← Button.tsx 被移除
work-packages/WP003/  ← Button.tsx 被移除
```

**2. 解決命名衝突**
```bash
# 整合前:
work-packages/WP001/validators/FormValidator.ts
work-packages/WP002/validators/FormValidator.ts

# 整合後:
src/features/auth/validators/LoginFormValidator.ts    ← 重新命名
src/features/auth/validators/RegisterFormValidator.ts ← 重新命名
```

**3. 建立統一的目錄結構**
```bash
src/
├── shared/                    # 共用程式碼
│   ├── components/           # 共用 UI 元件
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── utils/                # 共用工具函數
│   │   ├── formatDate.ts
│   │   └── validateEmail.ts
│   └── types/                # 共用型別定義
│
├── features/                  # 功能模組（來自 WP）
│   ├── auth/                 # 來自 WP001, WP002
│   │   ├── login/           # 來自 WP001
│   │   ├── register/        # 來自 WP002
│   │   └── reset-password/  # 來自 WP003
│   ├── profile/              # 來自 WP004
│   └── session/              # 來自 WP006
│
└── api/
    └── routes/
        ├── auth.ts           # 整合所有 auth 相關的 API
        └── profile.ts
```

**4. 更新 import 路徑**
```typescript
// 整合前 (WP001):
import { Button } from './components/Button';

// 整合後:
import { Button } from '@/shared/components/Button';
```

**5. 記錄整合結果**

生成 `integration-report.md`：
```markdown
# 整合報告

**整合時間**: 2025-01-15 18:00
**整合狀態**: ✅ 成功

## 整合摘要

- 合併的元件: 7 個
- 合併的工具函數: 5 個
- 解決的衝突: 2 個
- 更新的檔案: 45 個

## 詳細變更

### 合併的元件
1. Button (WP001, WP002, WP003, WP005) → `src/shared/components/Button.tsx`
2. Input (WP001, WP002, WP003) → `src/shared/components/Input.tsx`
...

### 解決的衝突
1. FormValidator: 重新命名為 LoginFormValidator 和 RegisterFormValidator
2. ...

### 檔案移動
[完整的檔案移動清單]

### Import 更新
[更新的 import 路徑清單]
```

---

#### Step 6.3: 整合測試

```bash
# 執行整合測試
/speckit.test --integration

# 或手動執行
npm run test:integration
```

**整合測試會生成專屬的記錄資料夾**：
```
integration/
├── integration-analysis.md          # Step 6.1 生成（分析報告）
├── integration-report.md            # Step 6.2 生成（整合報告）
├── integration-test-report.md       # Step 6.3 生成（測試報告）
├── integration-diagnosis-report.md  # Step 6.3 生成（如果測試失敗）
└── integration-journal.md           # 整合階段的工作日誌
```

**整合測試會檢查**：

**1. 個別 WP 功能仍正常**
```bash
# 確保整合沒有破壞個別 WP
✅ WP001 (Login) - 所有測試通過
✅ WP002 (Register) - 所有測試通過
✅ WP003 (Reset Password) - 所有測試通過
...
```

**2. 跨 WP 的使用者流程**

建立端對端測試：
```typescript
// tests/integration/auth-flow.test.ts

describe('完整認證流程', () => {
  test('使用者可以註冊、登入、查看個人資料、登出', async () => {
    // 1. 註冊 (WP002)
    await register({
      email: 'test@example.com',
      password: 'password123'
    });

    // 2. 登入 (WP001)
    const { token } = await login({
      email: 'test@example.com',
      password: 'password123'
    });

    // 3. 查看個人資料 (WP004)
    const profile = await getProfile(token);
    expect(profile.email).toBe('test@example.com');

    // 4. 登出 (WP005)
    await logout(token);

    // 5. 確認 token 已失效
    await expect(getProfile(token)).rejects.toThrow();
  });
});
```

**3. 共用元件在各處都能正常運作**
```typescript
// tests/integration/shared-components.test.ts

describe('共用元件測試', () => {
  test('Button 元件在所有功能中都能正常使用', async () => {
    // 在登入頁面
    renderLoginPage();
    expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();

    // 在註冊頁面
    renderRegisterPage();
    expect(screen.getByRole('button', { name: '註冊' })).toBeInTheDocument();

    // 在個人資料頁面
    renderProfilePage();
    expect(screen.getByRole('button', { name: '儲存' })).toBeInTheDocument();
  });
});
```

**4. API 整合測試**
```typescript
// tests/integration/api.test.ts

describe('API 整合測試', () => {
  test('所有 auth API 端點正常運作', async () => {
    const res1 = await fetch('/api/auth/register', { ... });
    expect(res1.status).toBe(201);

    const res2 = await fetch('/api/auth/login', { ... });
    expect(res2.status).toBe(200);

    const res3 = await fetch('/api/auth/logout', { ... });
    expect(res3.status).toBe(200);
  });
});
```

**整合測試報告** (`integration/integration-test-report.md`)：
```markdown
# 整合測試報告

**測試時間**: 2025-01-15 18:30
**測試狀態**: [✅ 通過 / ❌ 失敗]

## 🤖 AI 讀取指引

**如果你是 AI，請遵循以下規則**：
1. 優先讀取「測試摘要」區塊
2. 如果 Status = ✅ 通過 → 停止讀取
3. 如果 Status = ❌ 失敗 → 前往 `integration-diagnosis-report.md`

## 測試摘要

- 個別 WP 測試: 6/6 通過
- E2E 流程測試: 8/8 通過
- 共用元件測試: 12/12 通過
- API 整合測試: 15/15 通過
- 總測試覆蓋率: 87%

**下一步行動**:
- [如果通過] ✅ 執行 /speckit.verify --final
- [如果失敗] ❌ 查看 integration-diagnosis-report.md

## 詳細結果（僅供人類閱讀）

### 個別 WP 功能測試
✅ WP001 (Login): 15 tests passed
✅ WP002 (Register): 12 tests passed
✅ WP003 (Reset Password): 10 tests passed
✅ WP004 (Profile): 18 tests passed
✅ WP005 (Logout): 8 tests passed
✅ WP006 (Session): 14 tests passed

### E2E 流程測試
✅ 完整認證流程 (註冊→登入→個人資料→登出)
✅ 密碼重設流程
✅ Session 過期處理
...

### 效能測試
- 登入 API 平均回應時間: 45ms ✅
- 註冊 API 平均回應時間: 78ms ✅
- 整體頁面載入時間: 1.2s ✅
```

---

**如果測試失敗，會生成** (`integration/integration-diagnosis-report.md`)：

```markdown
# 整合診斷報告

**診斷時間**: 2025-01-15 18:45
**測試狀態**: ❌ 失敗
**修正次數**: 1

---

## 🤖 AI 讀取指引

**如果你是 AI（特別是執行 `/speckit.fix-integration` 時）**：
1. 優先讀取「🎯 快速診斷摘要」
2. 根據問題類型決定行動
3. 不要讀取「詳細分析」區塊

---

## 🎯 快速診斷摘要（AI 優先讀取）

### 問題總覽
| # | 問題類型 | 嚴重度 | 影響範圍 | 建議指令 |
|---|---------|--------|----------|----------|
| 1 | 共用元件問題 | 🔴 Critical | Button 在 WP003 顯示錯誤 | /speckit.fix-integration --issue "Button props 不一致" |
| 2 | 跨 WP 流程問題 | 🔴 Critical | 登入後 token 未傳遞到 Profile | /speckit.fix-integration --issue "Session token 傳遞問題" |
| 3 | Import 路徑問題 | 🟡 Warning | WP004 仍使用舊路徑 | /speckit.fix-integration --issue "更新 import 路徑" |

### 統計
- 總問題數: 3
- 共用元件問題: 1 個
- 跨 WP 流程問題: 1 個
- Import 路徑問題: 1 個

---

## 🔧 修正指引（AI 執行 `/speckit.fix-integration` 時讀取）

### 問題 #1: Button props 不一致

**問題類型**: 共用元件問題
**嚴重度**: 🔴 Critical
**影響範圍**: WP003 (Reset Password)

**問題描述**:
- 整合後的 Button 元件合併了 WP001, WP002, WP003, WP005 的版本
- WP003 原本的 Button 接受 `variant` prop，但整合後的版本使用 `type`
- 導致 WP003 的按鈕樣式錯誤

**失敗測試**:
```
tests/integration/wp-features.test.ts
  ❌ WP003 (Reset Password) - "Reset password button should have primary style"
     Expected button to have class "btn-primary"
     But found class "btn-undefined"
```

**修正方案**:
```typescript
// 檔案: src/features/auth/reset-password/ResetPasswordPage.tsx
// 修正前:
<Button variant="primary">重設密碼</Button>

// 修正後:
<Button type="primary">重設密碼</Button>
```

**或者**（如果多處使用）:
```typescript
// 檔案: src/shared/components/Button.tsx
// 更新 Button 元件同時支援 variant 和 type

interface ButtonProps {
  type?: 'primary' | 'secondary';
  variant?: 'primary' | 'secondary';  // 向後兼容
  // ...
}

export function Button({ type, variant, ...props }: ButtonProps) {
  const buttonType = type || variant;  // variant 作為 fallback
  // ...
}
```

**驗證方式**:
- [ ] 修正程式碼
- [ ] 執行 `/speckit.test --integration`
- [ ] 確認 WP003 測試通過

---

### 問題 #2: Session token 傳遞問題

**問題類型**: 跨 WP 流程問題
**嚴重度**: 🔴 Critical
**影響範圍**: WP001 (Login) → WP004 (Profile)

**問題描述**:
- E2E 測試：使用者登入後無法查看個人資料
- 原因：WP001 的 login 函數將 token 存在 localStorage
- 但 WP004 的 getProfile 函數從 sessionStorage 讀取
- 整合前各自獨立運作，整合後發現不一致

**失敗測試**:
```
tests/integration/auth-flow.test.ts
  ❌ "使用者可以註冊、登入、查看個人資料、登出"
     Step 3 failed: getProfile returned 401 Unauthorized
     Reason: No token found in request headers
```

**修正方案**:
```typescript
// 統一 token 儲存機制

// 選項 A: 都用 localStorage
// 檔案: src/features/auth/login/login.service.ts
// 保持不變（已使用 localStorage）

// 檔案: src/features/profile/profile.service.ts
// 修正前:
const token = sessionStorage.getItem('authToken');

// 修正後:
const token = localStorage.getItem('authToken');

// 選項 B: 建立共用的 auth 工具
// 檔案: src/shared/utils/auth.ts (新建)
export const AuthStorage = {
  setToken: (token: string) => localStorage.setItem('authToken', token),
  getToken: () => localStorage.getItem('authToken'),
  removeToken: () => localStorage.removeItem('authToken')
};

// 然後在所有地方使用 AuthStorage
```

**驗證方式**:
- [ ] 修正 token 儲存/讀取邏輯
- [ ] 執行 `/speckit.test --integration`
- [ ] 確認 E2E 流程測試通過

---

## 📝 修正歷史（自動記錄到 integration-journal.md）

[每次執行 `/speckit.fix-integration` 後會自動附加]

---

## 📊 詳細分析（僅供人類閱讀，AI 跳過）

### 失敗測試詳情
[完整的測試失敗詳情...]

### 根因分析
[詳細的根因分析...]
```

---

**整合階段的工作日誌** (`integration/integration-journal.md`)：

```markdown
# 整合工作日誌

## 2025-01-15 18:00 - 開始整合

執行指令: `/speckit.analyze --all`
- 發現 4 個重複元件
- 發現 2 個命名衝突
- 生成 integration-analysis.md

## 2025-01-15 18:05 - 預覽整合

執行指令: `/speckit.integrate --dry-run`
- 預覽整合策略
- 確認無問題

## 2025-01-15 18:10 - 執行整合

執行指令: `/speckit.integrate --full`
- 合併 Button, Input, Card 等 4 個元件
- 解決 FormValidator 命名衝突
- 建立 src/ 目錄結構
- 更新 45 個檔案的 import 路徑
- 生成 integration-report.md

## 2025-01-15 18:30 - 執行整合測試

執行指令: `/speckit.test --integration`
- 測試狀態: ❌ 失敗
- 失敗測試: 3/77
- 生成 integration-test-report.md
- 生成 integration-diagnosis-report.md

## 2025-01-15 18:45 - 修正 #1

執行指令: `/speckit.fix-integration --issue "Button props 不一致"`
- 問題: Button 元件 props 名稱不一致
- 修正方式: 更新 Button 元件同時支援 variant 和 type
- 修正檔案:
  - src/shared/components/Button.tsx
- 重新測試: `/speckit.test --integration`
- 結果: WP003 測試通過，但 E2E 測試仍失敗

## 2025-01-15 19:00 - 修正 #2

執行指令: `/speckit.fix-integration --issue "Session token 傳遞問題"`
- 問題: localStorage vs sessionStorage 不一致
- 修正方式: 建立共用的 AuthStorage 工具
- 修正檔案:
  - src/shared/utils/auth.ts (新建)
  - src/features/auth/login/login.service.ts
  - src/features/profile/profile.service.ts
  - src/features/auth/logout/logout.service.ts
- 重新測試: `/speckit.test --integration`
- 結果: ✅ 所有測試通過！

## 2025-01-15 19:15 - 最終驗證

執行指令: `/speckit.verify --final`
- 測試覆蓋率: 87% ✅
- 無死代碼 ✅
- 無重複代碼 ✅
- 建置成功 ✅

## 2025-01-15 19:20 - 清理

執行指令: `/speckit.cleanup`
- 移除暫存檔案
- 整合完成！
```

---

#### Step 6.4: 清理與最終驗證

```bash
# 清理整合過程中的暫存檔案
/speckit.cleanup

# 最終驗證
/speckit.verify --final
```

**final verify 會檢查**：
- ✅ 所有測試通過（單元 + 整合 + E2E）
- ✅ 測試覆蓋率 ≥ 80%
- ✅ 沒有死代碼（unused imports, unreachable code）
- ✅ 沒有重複代碼（DRY 原則）
- ✅ 所有 API 端點都有對應的測試
- ✅ 所有契約都已實作並驗證
- ✅ 建置成功，無警告

**到這裡**: 整合完成，功能可以上線！

---

## Work Package 文件說明

每個 Work Package 資料夾內的文件都有明確的用途和使用時機：

### 📋 規格文件（人類/AI 共同建立）

**README.md**
- **用途**: WP 的總體概述
- **誰使用**: 所有 AI 在開始工作前必須先讀
- **包含內容**: 目標、範圍、相依性（應該是零）

**task-*.md**
- **用途**: 每個 task 的具體指示
- **誰使用**: `/speckit.implement` 執行時讀取
- **包含內容**: 要做什麼、測試要求、驗收標準

**contract-expected.yaml**
- **用途**: 契約定義（聖經）
- **誰使用**: `/speckit.verify` 和 `/speckit.fix` 必讀
- **包含內容**: 欄位名稱、類型、驗證規則、錯誤訊息

---

### 📝 工作記錄（AI 自動維護）

**journal.md**
- **用途**: 記錄所有決定、修正、問題
- **誰寫入**:
  - `/speckit.implement` - 記錄實作決定
  - `/speckit.fix` - 記錄修正內容
- **誰讀取**: 所有後續的 AI（避免重複錯誤）
- **格式**:
  ```markdown
  # Work Package 001 - Login Feature

  ## 2025-01-15 14:30 - Task 001 實作完成
  - 實作了登入表單 UI
  - 使用 React Hook Form 處理表單驗證
  - 欄位名稱遵循 contract-expected.yaml: email, password

  ## 2025-01-15 15:00 - Task 002 實作完成
  - 實作了 POST /api/auth/login API
  - 回傳格式: { userId, token, expiresAt }
  - 使用 bcrypt 處理密碼驗證

  ## 2025-01-15 15:30 - Verify 失敗 #1
  - 診斷報告: diagnosis-report.md
  - 問題: 缺少 email 格式驗證
  - 根因類型: 實作問題

  ## 2025-01-15 15:45 - Fix #1 完成
  - 修正問題: 加入 email regex 驗證
  - 位置: src/api/validators/auth.js line 12
  - 驗證規則: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  - 重新 verify: ✅ 通過

  ## 2025-01-15 16:00 - Verify 失敗 #2
  - 診斷報告: diagnosis-report.md (更新)
  - 問題: 回傳了契約外的 createdAt 欄位
  - 根因類型: AI 幻覺

  ## 2025-01-15 16:10 - Fix #2 完成
  - 修正問題: 移除 createdAt 欄位
  - 位置: src/api/routes/auth.js line 45
  - 重新 verify: ✅ 通過
  ```

---

### 📊 驗證報告（`/speckit.verify` 自動生成）

**verification-report.md**
- **用途**: 契約驗證結果
- **何時生成**: 每次執行 `/speckit.verify` 都會生成/覆蓋
- **誰讀取**:
  - 人類（查看完整的驗證詳情）
  - AI（只讀 Summary 區塊，節省上下文）
- **Template**: `.specify/templates/verification-report-template.md`
- **AI 讀取規則**:
  - ✅ 如果 Status = PASS → 只讀 Summary，停止
  - ❌ 如果 Status = FAIL → 讀 Summary，然後跳到 `diagnosis-report.md`
  - 詳細區塊僅供人類閱讀，AI 不應讀取
- **格式**:
  ```markdown
  # 驗證報告 - WP001

  **生成時間**: 2025-01-15 15:30
  **驗證狀態**: ❌ 失敗

  ## 契約驗證結果

  ✅ 欄位名稱一致性: 通過
  ✅ 欄位類型一致性: 通過
  ❌ 驗證規則完整性: 失敗
  ✅ 錯誤訊息一致性: 通過
  ❌ 無額外欄位: 失敗（發現 createdAt）

  ## 測試執行結果

  - 總測試數: 15
  - 通過: 12
  - 失敗: 3
  - 覆蓋率: 85%

  ## 失敗測試清單

  1. should validate email format - FAILED
  2. should reject invalid email - FAILED
  3. should return correct response format - FAILED

  **詳細診斷請查看**: diagnosis-report.md
  ```

**diagnosis-report.md**
- **用途**: 測試失敗的根因分析
- **何時生成**: 只有當測試失敗時才生成（verify 失敗時）
- **誰讀取**:
  - 人類（決定修正策略，查看完整分析）
  - `/speckit.fix`（只讀「快速診斷摘要」和「修正指引」）
- **Template**: `.specify/templates/diagnosis-report-template.md`
- **AI 讀取規則**:
  - 只讀「🎯 快速診斷摘要」和「🔧 修正指引」
  - 根據問題類型決定行動（設計問題/實作問題/AI 幻覺）
  - 詳細分析區塊僅供人類閱讀，AI 不應讀取
- **格式**:
  ```markdown
  # 診斷報告 - WP001

  ## 🎯 快速診斷摘要（AI 優先讀取）

  | # | 問題類型 | 嚴重度 | 影響範圍 | 建議指令 |
  |---|---------|--------|----------|----------|
  | 1 | 實作問題 | 🔴 Critical | WP001 | /speckit.fix --wp WP001 --issue "缺少 email 驗證" |
  | 2 | AI 幻覺 | 🔴 Critical | WP001 | /speckit.fix --wp WP001 --issue "移除 createdAt" |

  ## 🔧 修正指引（AI 執行 /speckit.fix 時讀取）

  ### 問題 #1: 缺少 email 格式驗證
  - 問題類型: 實作問題
  - 檔案: src/api/validators/auth.js
  - 修正: 加入 email regex 檢查
  - 契約依據: contract-expected.yaml line 45

  [其他問題...]

  ## 📊 詳細分析（僅供人類閱讀，AI 跳過）
  [詳細的測試失敗分析、契約比對...]
  ```

---

### 🔄 指令如何使用這些文件

**`/speckit.implement WP001/task-002`**
```
讀取:
  ✓ WP001/README.md           (了解整體目標)
  ✓ WP001/task-002-*.md       (知道要做什麼)
  ✓ WP001/contract-expected.yaml (遵守契約)
  ✓ WP001/journal.md          (看之前的決定)

寫入:
  ✓ WP001/journal.md          (記錄實作決定)
  ✓ 實際的程式碼檔案
```

**`/speckit.verify --wp WP001`**
```
讀取:
  ✓ WP001/contract-expected.yaml (契約標準)
  ✓ WP001/task-*.md              (測試要求)
  ✓ 實際的程式碼                 (驗證對象)
  ✓ 實際的測試檔案               (執行測試)

寫入:
  ✓ WP001/verification-report.md (驗證結果)
  ✓ WP001/diagnosis-report.md    (如果測試失敗)
```

**`/speckit.fix --wp WP001 --issue "缺少 email 驗證"`**
```
讀取:
  ✓ WP001/diagnosis-report.md    (了解問題)
  ✓ WP001/contract-expected.yaml (契約標準)
  ✓ WP001/journal.md             (之前的決定)
  ✓ --issue 參數                 (你的指示)

執行:
  1. 修正程式碼
  2. 記錄到 journal.md
  3. 自動執行 /speckit.verify

寫入:
  ✓ WP001/journal.md             (記錄修正)
  ✓ 實際的程式碼                 (修正內容)
  ✓ 自動生成新的 verification-report.md
```

---

### 📈 追蹤整體進度

在 `work-packages/` 資料夾下，還應該有一個總覽文件：

**work-packages/STATUS.md**
```markdown
# Work Packages 狀態總覽

**最後更新**: 2025-01-15 16:30

| WP | 名稱 | 實作 | Verify | 修正次數 | 狀態 |
|----|------|------|--------|----------|------|
| WP001 | Login Feature | ✅ | ✅ | 2 | ✅ 完成 |
| WP002 | Register Feature | ✅ | ❌ | 1 | 🔄 修正中 |
| WP003 | Reset Password | ✅ | ⏳ | 0 | ⏳ 待驗證 |
| WP004 | Profile Feature | 🔄 | - | 0 | 🔄 實作中 |
| WP005 | Logout Feature | ⏳ | - | 0 | ⏳ 待開始 |
| WP006 | Session Mgmt | ⏳ | - | 0 | ⏳ 待開始 |

## 目前問題

### WP002 - Register Feature
- 診斷報告: work-packages/WP002/diagnosis-report.md
- 問題類型: 實作問題
- 最後修正: 2025-01-15 16:15
- 待執行: /speckit.verify --wp WP002

## 完成統計

- 總 WP 數: 6
- 已完成: 1 (17%)
- 修正中: 1 (17%)
- 實作中: 1 (17%)
- 待開始: 3 (50%)
```

**誰維護 STATUS.md？**
- 可以手動維護
- 或未來建立 `/speckit.status` 指令自動生成

---

## 關鍵設計決策

### 1. 為什麼垂直切分？

**❌ 舊思維（水平切分）**:
```
WP001: User Model（後端）
WP002: Auth Service（後端，相依 WP001）
WP003: Login API（後端，相依 WP002）
WP004: Login Page（前端，相依 WP003）
```
**問題**：必須循序執行，無法平行！

**✅ 新思維（垂直切分）**:
```
WP001: 登入功能（Model + API + UI + Tests，完整）
WP002: 註冊功能（Model + API + UI + Tests，完整）
WP003: 密碼重設（API + UI + Email + Tests，完整）
```
**優點**：
- 所有 WP 可同時開始
- 一個 AI 做完整功能，欄位名稱自然一致
- 每個 WP 做完就能獨立測試

---

### 2. 為什麼允許重複？

**問題**：如果 WP001 和 WP002 都需要 Button 元件怎麼辦？

**答案**：讓它們各自建立！
- WP001 建立簡單的 Button
- WP002 也建立簡單的 Button
- 整合時再去重複（deduplication）

**為什麼？**
- 保持零相依
- 避免等待共用元件開發
- 真正的平行開發

---

### 3. 為什麼強制 TDD？

**每個 WP 必須**：
1. Task 1: 寫測試（先寫會失敗的測試）
2. Task 2: 實作功能（讓測試通過）
3. Task 3: 重構（如需要）

**原因**：
- 每個 WP 獨立開發，必須獨立驗證
- 整合前就能確保功能正確
- 測試覆蓋率 ≥ 80% 強制

---

### 4. 為什麼需要契約驗證？

**問題**：多個 AI 平行開發，如何確保它們能整合？

**答案**：契約驗證
- 每個 WP 有 contract-expected.yaml（定義必須實作什麼）
- 實作後提取 contract-implementation.yaml（實際實作了什麼）
- 自動比對，捕捉：
  - 欄位名稱不一致（userId vs user_id）
  - 遺漏的驗證規則
  - 錯誤訊息不精確
  - AI 幻覺（新增契約外的欄位）

---

## 相比 V1 的主要改進

### 1. 視覺規格層（新增）
**V1 的問題**: 你無法視覺化 AI 會建立什麼
**解決方案**: Layer 2 提供可審核的 UI mockup 和流程圖

### 2. 契約驗證（新增）
**V1 的問題**: 前後端經常不匹配（userId vs user_id）
**解決方案**: 契約驗證在整合前就能捕捉欄位名稱不匹配

### 3. 垂直切分（新增）
**V1 的問題**: 前後端分開，有相依性，無法平行
**解決方案**: 每個 WP 是完整功能，零相依，真正平行

### 4. Work Package 系統（新增）
**V1 的問題**: Tasks 太大，AI 會失去 context
**解決方案**: WP 很小（200-500 行），每個 task 30-60 分鐘

### 5. TDD 強制（新增）
**V1 的問題**: 測試常常不匹配 spec 或實作
**解決方案**: 強制 TDD，測試先行，確保品質

### 6. 測試框架明確（新增）
**V1 的問題**: 不知道用什麼測試框架
**解決方案**: design-spec.yaml 明確指定，根據框架生成對應模板

---

## 檔案結構（範例）

```
specs/001-user-auth/
├── spec.md                           # Layer 1: 需求
│
├── visual-spec/                      # Layer 2: 視覺設計
│   ├── README.md
│   ├── pages/
│   │   ├── login-page.md
│   │   └── register-page.md
│   ├── flows/
│   │   └── login-flow.md
│   └── contracts/
│       └── auth-api.yaml
│
├── design-spec.yaml                  # Layer 3: 技術設計
│
├── work-packages/                    # Layer 4: 實作
│   ├── STATUS.md                     # 所有 WP 的狀態總覽
│   │
│   ├── WP001-login-feature/
│   │   ├── README.md                     # WP 概述
│   │   ├── task-001-write-tests.md      # Task 定義
│   │   ├── task-002-implement-api.md
│   │   ├── task-003-implement-ui.md
│   │   ├── task-004-integration.md
│   │   ├── contract-expected.yaml       # 契約（breakdown 生成）
│   │   ├── journal.md                   # 工作日誌（AI 持續更新）
│   │   ├── verification-report.md       # verify 生成（每次覆蓋）
│   │   └── diagnosis-report.md          # verify 生成（測試失敗時）
│   │
│   ├── WP002-register-feature/
│   ├── WP003-reset-password-feature/
│   ├── WP004-profile-feature/
│   ├── WP005-logout-feature/
│   └── WP006-session-management/
│
└── integration/                      # Phase 6: 整合
    ├── integration-analysis.md           # analyze 生成（分析報告）
    ├── integration-report.md             # integrate 生成（整合報告）
    ├── integration-test-report.md        # test 生成（測試報告）
    ├── integration-diagnosis-report.md   # test 生成（如果測試失敗）
    └── integration-journal.md            # 整合階段的工作日誌
```

**文件說明**：

**Work Packages 層級**：
- **breakdown 生成**: README.md, task-*.md, contract-expected.yaml
- **AI 持續更新**: journal.md
- **verify 每次生成**: verification-report.md, diagnosis-report.md（如果失敗）
- **手動維護**: STATUS.md

**Integration 層級**：
- **analyze 生成**: integration-analysis.md
- **integrate 生成**: integration-report.md
- **test 生成**: integration-test-report.md, integration-diagnosis-report.md（如果失敗）
- **AI 持續更新**: integration-journal.md
```

---

## 指令參考

| 指令 | 目的 | 輸入 | 輸出 |
|------|------|------|------|
| `/speckit.specify` | 建立需求規格 | 功能描述 | spec.md |
| `/speckit.clarify` | 釐清模糊需求（可選） | spec.md | 更新的 spec.md |
| `/speckit.visualize` | 生成視覺規格 | spec.md | visual-spec/ |
| `/speckit.plan` | 生成設計規格 | visual-spec/ | design-spec.yaml |
| `/speckit.breakdown` | 分解成 Work Packages | design-spec.yaml | work-packages/ |
| `/speckit.implement` | 實作 Work Package task | WP###/task-### | 程式碼 |
| `/speckit.verify` | 驗證契約 + 執行測試 + 自動診斷 | WP### | verification-report.md<br>diagnosis-report.md (如果失敗) |
| `/speckit.fix` | 修正實作問題並重新驗證 | 問題描述 + WP | 修正後的程式碼 + 自動 verify |
| `/speckit.analyze` | 分析重複元件和衝突 | --all | integration/integration-analysis.md |
| `/speckit.integrate` | 整合所有 WP（合併重複、解決衝突） | --full / --dry-run | integration/integration-report.md + 整合後的程式碼 |
| `/speckit.test` | 執行整合測試 | --integration | integration/integration-test-report.md<br>integration/integration-diagnosis-report.md (如果失敗) |
| `/speckit.fix-integration` | 修正整合問題並重新測試 | --issue "問題描述" / --auto | 修正後的程式碼 + 自動重新測試 |
| `/speckit.cleanup` | 清理整合暫存檔案 | - | - |
| `/speckit.constitution` | 設定專案原則 | 原則說明 | constitution.md |

---

## 關鍵成功因素

### 1. 仔細審核視覺規格

**這是你的主要審核點**。如果視覺規格錯了，下游所有東西都會錯。

檢查項目：
- UI 版面是否符合你的需求
- 使用者流程是否涵蓋所有場景
- **API 契約的欄位名稱是否正確**（這很關鍵！）
- 錯誤訊息是否適當

### 2. 確保垂直切分

**不要**按技術層切分（Model、API、UI 分開）
**要**按功能切分（每個 WP 是完整功能）

### 3. 使用契約驗證

**每個 WP 完成後務必驗證**：
```bash
/speckit.verify --wp WP001
```

不要等到全部做完才驗證！

### 4. 善用平行開發

**對於大型功能**（10+ Work Packages）：
- 同時開 6+ 個 AI
- 每個 AI 負責一個 WP
- 大幅縮短開發時間

---

## 從 V1 遷移

如果你有現有的 V1 專案：

1. 你現有的 `spec.md` 就是 **Layer 1**（不需要改變）
2. 執行 `/speckit.visualize` 生成 **Layer 2**
3. 執行 `/speckit.plan` 生成 **Layer 3**（取代舊的 plan.md）
4. 執行 `/speckit.breakdown` 生成 **Work Packages**（取代 tasks.md）

你的舊 `tasks.md` 會被 Work Packages 系統取代。

---

## 常見問題

### Q: 為什麼要 6 個 WP？小功能也需要嗎？

A: 是的。即使是小功能，也拆成 6 個 WP，因為：
- 提供平行開發機會
- 每個 WP 更小，更容易驗證
- 即使你只有一個 AI，也能確保每個 WP 獨立可測試

### Q: 如果兩個 WP 都建立了 Button，怎麼辦？

A: 沒關係！讓它們各自建立。整合時會有工具去重複。重點是保持零相依，真正的平行開發。

### Q: 契約驗證會檢查程式碼實作細節嗎？

A: 不會。只檢查**結構**：
- 欄位名稱
- 欄位類型
- API 路徑
- 驗證規則
- 錯誤訊息

不檢查：
- 變數名稱
- 函數名稱
- 程式碼結構
- 註解

### Q: 如果驗證失敗怎麼辦？

A:
1. 查看 `verification-report.md`
2. 找出具體問題（例如：欄位名稱不一致）
3. 修正程式碼
4. 重新驗證
5. 重複直到通過

### Q: 測試失敗時，我怎麼知道是設計問題還是實作問題？

A: `/speckit.verify` 會自動診斷！如果測試失敗，它會：
1. 自動比對測試期望 vs 契約期望（判斷是否設計錯誤）
2. 自動比對實作輸出 vs 契約期望（判斷是否實作錯誤）
3. 自動檢查是否有契約外的額外功能（判斷是否 AI 幻覺）
4. 自動生成 `diagnosis-report.md`，明確告訴你問題類型和建議指令

你只需要查看診斷報告，然後執行建議的修正指令即可。

### Q: 如果是設計問題，我需要重新實作所有 WP 嗎？

A: 不一定。診斷報告會告訴你**影響範圍**。例如：
- 如果只是一個 API 的欄位名稱錯誤，只需要重新實作使用該 API 的 WP
- 如果是核心業務邏輯錯誤，可能需要重新實作多個 WP
- 修正設計後，執行 `/speckit.breakdown` 會根據新設計重新生成 work packages

### Q: AI 實作時加了契約外的欄位，這算嚴重問題嗎？

A: **非常嚴重！** 這是 AI 幻覺的典型表現。必須立即修正，因為：
1. 違反了「契約是聖經」的原則
2. 可能導致不同 WP 之間的不一致
3. 整合時會出現預期外的欄位，造成混亂
4. 使用 `/speckit.fix` 明確要求移除所有契約外的內容

### Q: 測試通過但契約驗證失敗，這可能嗎？

A: 可能，而且這很危險！這表示：
1. 測試本身可能寫錯了（測試期望與契約不一致）
2. 實作可能用了不同的欄位名稱，但測試也跟著錯了
3. 必須先修正契約驗證問題，然後重新審查測試

永遠記住：**契約 > 測試 > 實作**，這個優先級不能顛倒。

### Q: 多個 Claude Code 平行工作時，如何追蹤各個 WP 的狀態？

A: 透過以下機制：
1. **每個 WP 的 journal.md** - 記錄該 WP 的所有修正歷史
2. **verification-report.md** - 顯示最新的驗證狀態
3. **diagnosis-report.md** - 顯示當前的問題（如果有）
4. **work-packages/STATUS.md** - 總覽所有 WP 的進度

你可以用 `/speckit.status` 指令（未來功能）自動生成 STATUS.md。

### Q: `/speckit.verify` 需要我提供什麼資訊嗎？

A: 不需要！只需要指定 WP 編號：
```bash
/speckit.verify --wp WP001
```

AI 會自動讀取該 WP 資料夾內的所有必要文件：
- contract-expected.yaml（契約標準）
- task-*.md（測試要求）
- 實際的程式碼和測試檔案

### Q: `/speckit.fix` 我需要告訴它修什麼嗎？

A: 有兩種方式：

**方式 1：根據診斷報告自動修正**
```bash
# 如果 diagnosis-report.md 已經明確指出問題
/speckit.fix --wp WP001 --auto
# AI 會自動讀取診斷報告並修正所有問題
```

**方式 2：手動指定問題（建議）**
```bash
# 你看了診斷報告後，明確指示要修什麼
/speckit.fix --wp WP001 --issue "缺少 email 格式驗證"
# 更安全，你有完全控制權
```

### Q: 修正歷史記錄在哪裡？格式是什麼？

A: 記錄在每個 WP 的 **journal.md**，格式如下：
```markdown
## 2025-01-15 15:45 - Fix #1 完成
- 修正問題: 加入 email regex 驗證
- 位置: src/api/validators/auth.js line 12
- 驗證規則: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- 根據診斷: diagnosis-report.md (問題 2)
- 重新 verify: ✅ 通過
```

所有 AI 在執行任何操作前都會先讀 journal.md，避免重複犯錯。

### Q: 如果我同時跑 6 個 AI，它們會互相衝突嗎？

A: 不會！因為：
1. **每個 WP 完全獨立** - 有自己的資料夾和文件
2. **零相依性設計** - WP001 的修正不影響 WP002
3. **各自的 journal.md** - 記錄互不干擾
4. **STATUS.md 手動更新** - 你看哪個 WP 完成了，就更新狀態

唯一需要注意的是：不要同時讓兩個 AI 修改**同一個 WP**！

### Q: 報告文件會很長，AI 每次都要全部讀完嗎？會不會浪費上下文？

A: **不會！** 我們設計了專門的 Template 和 AI 讀取規則：

**verification-report.md**:
- AI 只讀「📋 Summary」區塊（約 10 行）
- 如果 Status = ✅ PASS → 停止讀取
- 如果 Status = ❌ FAIL → 跳到 `diagnosis-report.md`
- 詳細檢查區塊（數百行）僅供人類閱讀

**diagnosis-report.md**:
- AI 只讀「🎯 快速診斷摘要」（表格格式，一眼看完所有問題）
- 只讀「🔧 修正指引」（只包含修正所需的資訊）
- 詳細分析區塊（數百行）僅供人類閱讀

**節省上下文的設計**:
```
傳統方式: AI 讀 500 行報告 = 浪費 ❌
我們的方式: AI 讀 20-30 行摘要 = 高效 ✅
```

### Q: Template 在哪裡？AI 會自動使用嗎？

A: Template 位置：
- `verification-report-template.md`: `.specify/templates/verification-report-template.md`
- `diagnosis-report-template.md`: `.specify/templates/diagnosis-report-template.md`

當 `/speckit.verify` 執行時，會自動使用這些 template 生成報告，並在報告開頭加入「🤖 AI 讀取指引」告訴 AI 如何高效讀取。

### Q: 整合時會發生什麼？我的 WP 資料夾會消失嗎？

A: **不會！** 整合流程是這樣的：

1. **work-packages/ 資料夾保留**（作為歷史記錄和參考）
2. **整合後的程式碼放在 src/**（統一的專案結構）
3. **重複的元件被合併到 src/shared/**
4. **各 WP 的獨特程式碼移動到 src/features/**

整合後的結構：
```
專案根目錄/
├── work-packages/          ← 保留（歷史記錄）
│   ├── WP001/
│   ├── WP002/
│   └── ...
│
└── src/                    ← 整合後的程式碼（這是你要用的）
    ├── shared/            ← 合併後的共用元件
    │   ├── components/
    │   └── utils/
    └── features/          ← 各 WP 的獨特功能
        ├── auth/
        ├── profile/
        └── ...
```

### Q: 如果整合後測試失敗怎麼辦？

A: 有兩種情況：

**情況 1：個別 WP 測試失敗**
```bash
# 表示整合破壞了某個 WP 的功能
# 檢查 integration-test-report.md 看是哪個 WP
# 修正該功能
# 重新測試
/speckit.test --integration
```

**情況 2：E2E 測試失敗**
```bash
# 表示 WP 之間的協作有問題
# 檢查跨 WP 的資料流和 API 呼叫
# 修正整合邏輯
# 重新測試
/speckit.test --integration
```

**如果真的整合失敗，可以重新整合**：
```bash
# work-packages/ 資料夾還在，所以可以重來
git reset --hard HEAD~1        # 回到整合前
/speckit.integrate --full      # 重新整合（修正策略）
```

### Q: `/speckit.analyze` 會自動決定如何整合嗎？

A: **部分自動，部分需要人類決定**：

**自動決定**（相似度 ≥ 90%）：
- Button 元件相似度 95% → 自動建議合併
- formatDate 函數相似度 100% → 自動建議合併

**需要人類決定**（60% ≤ 相似度 < 90%）：
- Card 元件相似度 75% → 建議人類審查，決定是否合併或建立基礎元件

**不合併**（相似度 < 60%）：
- FormValidator 相似度 40% → 建議保留各自實作，但重新命名避免衝突

你可以在執行 `/speckit.integrate --full` 前，先查看 `integration-analysis.md`，如果不同意某些建議，可以手動調整。

### Q: 整合需要多久時間？

A: 取決於專案大小：

- **小專案** (6-8 WP): 5-10 分鐘
  - analyze: 1-2 分鐘
  - integrate: 2-3 分鐘
  - test: 2-5 分鐘

- **中專案** (8-12 WP): 15-30 分鐘
  - analyze: 3-5 分鐘
  - integrate: 5-10 分鐘
  - test: 7-15 分鐘

- **大專案** (15+ WP): 30-60 分鐘
  - analyze: 5-10 分鐘
  - integrate: 10-20 分鐘
  - test: 15-30 分鐘

**建議**：先用 `--dry-run` 預覽，確認無誤後再執行 `--full`。

### Q: Git 分支策略是什麼？為什麼每個 WP 要有自己的分支？

A: **分支策略**:

```
main (生產)
  ↑
develop (整合)
  ↑
  ├─ integration/auth (整合測試)
  │   ↑
  │   ├─ wp/WP001-login-feature
  │   ├─ wp/WP002-register-feature
  │   └─ wp/WP003-reset-password
  │
  └─ integration/profile (整合測試)
      ↑
      ├─ wp/WP004-profile-feature
      └─ wp/WP005-settings-feature
```

**為什麼每個 WP 要有自己的分支？**

1. **支援平行開發** - 6 個 AI 可以同時在不同分支上工作，不會衝突
2. **獨立測試** - 每個 WP 可以獨立驗證和測試
3. **隔離風險** - 一個 WP 出問題不影響其他 WP
4. **清楚的歷史** - 每個分支的 commit 歷史清楚記錄該 WP 的開發過程
5. **容易回溯** - 如果某個 WP 有問題，可以輕易放棄該分支重新開始

**實際操作**:
```bash
# Terminal 1: AI 正在開發 WP001
git checkout wp/WP001-login-feature
/speckit.implement WP001/task-001

# Terminal 2: 同時，另一個 AI 在開發 WP002
git checkout wp/WP002-register-feature
/speckit.implement WP002/task-001

# Terminal 3: 同時，又一個 AI 在開發 WP003
git checkout wp/WP003-reset-password
/speckit.implement WP003/task-001

# 完全不會衝突！
```

### Q: AI 什麼時候應該 commit 和 push？

A: **自動 commit 和 push 的時機**:

1. **完成一個 task** → commit + push
   ```bash
   /speckit.implement WP001/task-001 完成
   → git commit -m "WP001: 完成 task-001"
   → git push
   ```

2. **驗證通過** → commit + push
   ```bash
   /speckit.verify --wp WP001 通過
   → git commit -m "WP001: 驗證通過"
   → git push
   ```

3. **修正完成** → commit + push
   ```bash
   /speckit.fix --wp WP001 --issue "..." 完成
   → git commit -m "WP001: 修正問題 - ..."
   → git push
   ```

4. **整合完成** → commit + push
   ```bash
   /speckit.integrate --full 完成
   → git commit -m "整合: 完成認證模組整合"
   → git push
   ```

**原則**:
- ✅ **頻繁 commit** - 每完成一個小單位就 commit
- ✅ **立即 push** - 每次 commit 後立即 push 到 GitHub
- ✅ **確保備份** - 所有工作都即時備份到 GitHub

### Q: 多個 AI 同時開發，如何避免衝突？

A: **零衝突的設計**:

1. **每個 WP 有自己的分支** - 完全隔離
2. **垂直切分** - 每個 WP 是完整功能，沒有共用檔案
3. **允許重複** - 各 WP 可以建立各自的 Button，整合時再去重

**唯一規則**: **不要讓兩個 AI 同時修改同一個 WP**！

**正確做法** ✅:
```bash
# Terminal 1
git checkout wp/WP001-login-feature
/speckit.implement WP001/task-001

# Terminal 2
git checkout wp/WP002-register-feature
/speckit.implement WP002/task-001

# 不同 WP，不同分支，零衝突
```

**錯誤做法** ❌:
```bash
# Terminal 1
git checkout wp/WP001-login-feature
/speckit.implement WP001/task-001

# Terminal 2
git checkout wp/WP001-login-feature  # ❌ 同一個 WP！
/speckit.implement WP001/task-002

# 會衝突！
```

---

## 下一步

1. 試用新工作流程在一個小功能上
2. 體驗垂直切分和平行開發
3. 提供回饋
