# 整合分析報告

**分析時間**: [TIMESTAMP]
**功能**: [FEATURE_NAME]
**Work Packages 總數**: [X]

---

## 🤖 AI 讀取指引

**如果你是 AI（特別是執行 `/speckit.integrate` 時）**：
1. 優先讀取「📋 整合策略摘要」區塊
2. 查看「⚠️ 需要人工決策的項目」
3. 不要讀取「詳細分析」區塊（僅供人類參考）

---

## 📋 整合策略摘要（AI 優先讀取）

### 自動合併項目（相似度 ≥ 90%）

| 類型 | 名稱 | 出現次數 | 位置 | 相似度 | 建議動作 |
|------|------|----------|------|--------|----------|
| 元件 | Button | 4 | WP001, WP002, WP003, WP005 | 95% | 自動合併 → src/shared/components/Button |
| 元件 | Input | 3 | WP001, WP002, WP003 | 92% | 自動合併 → src/shared/components/Input |
| 工具 | formatDate | 3 | WP001, WP003, WP004 | 100% | 自動合併 → src/shared/utils/formatDate |

**統計**:
- 可自動合併的元件: [X] 個
- 可自動合併的工具函數: [Y] 個
- 預計節省程式碼: [Z] 行

### ⚠️ 需要人工決策的項目（60% ≤ 相似度 < 90%）

| 類型 | 名稱 | 出現次數 | 位置 | 相似度 | 建議 |
|------|------|----------|------|--------|------|
| 元件 | Card | 2 | WP003, WP004 | 75% | 選項 A: 合併並擴展<br>選項 B: 保留各自實作 |
| 工具 | validateInput | 2 | WP001, WP002 | 68% | 選項 A: 建立基礎版本<br>選項 B: 各自保留 |

**需要決定**: [X] 個項目

### ❌ 命名衝突（需要重新命名）

| 名稱 | 位置 | 相似度 | 建議處理 |
|------|------|--------|----------|
| FormValidator | WP001, WP002 | 40% | 重新命名為:<br>- LoginFormValidator (WP001)<br>- RegisterFormValidator (WP002) |
| ApiClient | WP004, WP005 | 35% | 重新命名為:<br>- AuthApiClient (WP004)<br>- UserApiClient (WP005) |

**衝突數量**: [X] 個

### ✅ API 路徑檢查

- 總 API 端點數: [X]
- 重複路徑: [Y]
- 衝突: [Z]

**狀態**: [✅ 無衝突 / ⚠️ 有衝突需處理]

---

## 📊 詳細分析（僅供人類閱讀，AI 跳過）

### 重複元件詳細分析

#### Button 元件

**出現位置**:
1. `work-packages/WP001/components/Button.tsx` (48 行)
2. `work-packages/WP002/components/Button.tsx` (52 行)
3. `work-packages/WP003/components/Button.tsx` (45 行)
4. `work-packages/WP005/components/Button.tsx` (50 行)

**相似度分析**:
- Props 結構: 95% 相同
- 樣式實作: 90% 相同
- 事件處理: 100% 相同
- TypeScript types: 95% 相同

**差異點**:
- WP002 多了 `loading` prop
- WP003 多了 `variant="outlined"` 選項

**合併策略**:
1. 建立共用 Button 元件於 `src/shared/components/Button.tsx`
2. 包含所有 props（loading, variant 等）
3. 刪除各 WP 內的 Button 實作
4. 更新所有 import 路徑

**預估節省**: 180 行程式碼

---

#### Input 元件

**出現位置**:
1. `work-packages/WP001/components/Input.tsx` (65 行)
2. `work-packages/WP002/components/Input.tsx` (68 行)
3. `work-packages/WP003/components/Input.tsx` (62 行)

**相似度分析**:
- Props 結構: 92% 相同
- 驗證邏輯: 88% 相同
- 樣式: 95% 相同

**差異點**:
- WP001 有 password type 特殊處理
- WP002 有 confirm password matching
- WP003 有 email 格式特殊處理

**合併策略**:
1. 建立共用 Input 元件
2. 保留所有 type 的特殊處理
3. 統一驗證邏輯

**預估節省**: 165 行程式碼

---

### 工具函數分析

#### formatDate

**出現位置**:
1. `work-packages/WP001/utils/formatDate.ts` (12 行)
2. `work-packages/WP003/utils/formatDate.ts` (12 行)
3. `work-packages/WP004/utils/formatDate.ts` (12 行)

**相似度**: 100%（完全相同）

**合併策略**:
1. 移動到 `src/shared/utils/formatDate.ts`
2. 刪除所有重複實作
3. 更新 import

**預估節省**: 24 行程式碼

---

#### validateEmail

**出現位置**:
1. `work-packages/WP001/utils/validateEmail.ts` (8 行)
2. `work-packages/WP002/utils/validateEmail.ts` (8 行)

**相似度**: 100%

**合併策略**:
1. 移動到 `src/shared/utils/validateEmail.ts`
2. 刪除重複
3. 更新 import

**預估節省**: 8 行程式碼

---

### 命名衝突詳細分析

#### FormValidator 衝突

**WP001 版本**:
```typescript
// work-packages/WP001/validators/FormValidator.ts
export class FormValidator {
  validateLogin(email: string, password: string) {
    // Login-specific validation
  }
}
```

**WP002 版本**:
```typescript
// work-packages/WP002/validators/FormValidator.ts
export class FormValidator {
  validateRegister(email: string, password: string, confirmPassword: string) {
    // Register-specific validation
  }
}
```

**相似度**: 40%（只有名稱相同，功能完全不同）

**解決方案**:
- 重新命名 WP001 → `LoginFormValidator`
- 重新命名 WP002 → `RegisterFormValidator`
- 移動到各自的 feature 目錄：
  - `src/features/auth/login/LoginFormValidator.ts`
  - `src/features/auth/register/RegisterFormValidator.ts`

---

### API 路徑分析

#### 檢查的端點

| 路徑 | 方法 | Work Package | 衝突 |
|------|------|--------------|------|
| /api/auth/login | POST | WP001 | ✅ 唯一 |
| /api/auth/register | POST | WP002 | ✅ 唯一 |
| /api/auth/logout | POST | WP005 | ✅ 唯一 |
| /api/auth/reset-password | POST | WP003 | ✅ 唯一 |
| /api/users/profile | GET | WP004 | ✅ 唯一 |
| /api/users/profile | PUT | WP004 | ✅ 唯一 |

**結論**: ✅ 所有 API 路徑唯一，無衝突

---

## 🎯 整合計劃

### Phase 1: 自動合併（無需人工介入）

```bash
# 執行指令
/speckit.integrate --auto

# 將會自動：
1. 合併 Button 元件（4 個 → 1 個）
2. 合併 Input 元件（3 個 → 1 個）
3. 合併 formatDate（3 個 → 1 個）
4. 合併 validateEmail（2 個 → 1 個）
5. 解決 FormValidator 命名衝突（重新命名）
6. 解決 ApiClient 命名衝突（重新命名）
```

**預估時間**: 2-5 分鐘

### Phase 2: 人工決策項目

需要人類決定以下項目：

1. **Card 元件（相似度 75%）**
   - 選項 A: 合併並擴展功能
   - 選項 B: 保留各自實作
   - **建議**: 選項 A（統一設計更好）

2. **validateInput 工具（相似度 68%）**
   - 選項 A: 建立通用版本
   - 選項 B: 各自保留
   - **建議**: 選項 B（差異太大）

**執行**:
```bash
# 決定後執行
/speckit.integrate --custom --include "Card" --exclude "validateInput"
```

### Phase 3: 驗證整合結果

```bash
# 執行整合測試
/speckit.test --integration

# 檢查：
1. 所有 WP 功能仍正常
2. 共用元件在各處都能用
3. 無 import 錯誤
4. 所有測試通過
```

---

## 📁 預期的整合後結構

```
src/
├── shared/                          # 共用程式碼（自動合併結果）
│   ├── components/
│   │   ├── Button.tsx              # 合併自 4 個 WP
│   │   ├── Input.tsx               # 合併自 3 個 WP
│   │   └── Card.tsx                # 合併自 2 個 WP（如果選擇合併）
│   └── utils/
│       ├── formatDate.ts           # 合併自 3 個 WP
│       └── validateEmail.ts        # 合併自 2 個 WP
│
├── features/                        # 功能模組
│   ├── auth/
│   │   ├── login/                  # 來自 WP001
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LoginFormValidator.ts  # 重新命名
│   │   │   └── login.service.ts
│   │   ├── register/               # 來自 WP002
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── RegisterFormValidator.ts  # 重新命名
│   │   │   └── register.service.ts
│   │   ├── reset-password/         # 來自 WP003
│   │   └── logout/                 # 來自 WP005
│   │
│   └── profile/                     # 來自 WP004
│       ├── ProfilePage.tsx
│       └── profile.service.ts
│
└── api/
    └── routes/
        ├── auth.ts                  # 整合所有 auth API
        └── users.ts                 # 整合所有 user API
```

---

## 📈 統計資料

### 整合前

- 總檔案數: [X]
- 總程式碼行數: [Y]
- 重複程式碼行數: [Z]
- 重複率: [P]%

### 整合後（預估）

- 總檔案數: [X - removed]
- 總程式碼行數: [Y - saved]
- 重複程式碼行數: 0
- 程式碼節省: [Z] 行 ([P]%)

### 效益

- ✅ 減少維護成本（只需維護一份共用元件）
- ✅ 提升一致性（所有地方使用相同元件）
- ✅ 降低 bug 風險（單一來源）
- ✅ 加快未來開發（可重用元件庫）

---

## 🚀 下一步行動

### 立即執行（自動整合）

```bash
/speckit.integrate --auto
```

### 等待人類決策

在執行完整整合前，請決定：
1. Card 元件：合併 或 保留各自
2. validateInput：合併 或 保留各自

決定後執行：
```bash
/speckit.integrate --full --decisions "Card:merge,validateInput:keep"
```

### 整合後驗證

```bash
/speckit.test --integration
```

---

**生成工具**: SpecKit V2 - `/speckit.analyze`
**報告版本**: 1.0.0
