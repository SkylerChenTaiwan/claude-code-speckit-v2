# 整合診斷報告

**診斷時間**: [TIMESTAMP]
**功能**: [FEATURE_NAME]
**測試狀態**: ❌ 失敗
**失敗測試數**: [X]/[Y]
**修正次數**: [N]

---

## 🤖 AI 讀取指引

**如果你是 AI（特別是執行 `/speckit.fix-integration` 時）**：
1. 優先讀取「🎯 快速診斷摘要」區塊
2. 根據問題類型決定修正行動
3. 讀取「🔧 修正指引」獲取具體步驟
4. 不要讀取「詳細分析」區塊（僅供人類參考）

---

## 🎯 快速診斷摘要（AI 優先讀取）

### 問題總覽

| # | 問題類型 | 嚴重度 | 影響範圍 | 建議指令 |
|---|---------|--------|----------|----------|
| 1 | 共用元件問題 | 🔴 Critical | Button 在 WP003 顯示錯誤 | `/speckit.fix-integration --issue "Button props 不一致"` |
| 2 | 跨 WP 流程問題 | 🔴 Critical | 登入後 token 未傳遞到 Profile | `/speckit.fix-integration --issue "Session token 傳遞問題"` |
| 3 | Import 路徑問題 | 🟡 Warning | WP004 仍使用舊路徑 | `/speckit.fix-integration --issue "更新 import 路徑"` |
| 4 | API 整合問題 | 🔴 Critical | Frontend 期望的欄位與 Backend 不匹配 | `/speckit.fix-integration --issue "API contract 不一致"` |
| 5 | 測試覆蓋率不足 | 🟡 Warning | 共用元件測試覆蓋率 75% | `/speckit.fix-integration --issue "補充測試案例"` |

### 統計

- 總問題數: [X]
- 🔴 Critical: [Y] 個
- 🟡 Warning: [Z] 個
- 🟢 Info: [A] 個

### 根因分類

| 根因類型 | 數量 | 百分比 |
|---------|------|--------|
| 整合衝突（元件 props 不一致等） | [X] | [%] |
| 數據流問題（token、state 傳遞） | [Y] | [%] |
| Contract 不匹配（Frontend-Backend） | [Z] | [%] |
| Import 路徑錯誤 | [A] | [%] |
| 測試不足 | [B] | [%] |
| 其他 | [C] | [%] |

---

## 🔧 修正指引（AI 執行 `/speckit.fix-integration` 時讀取）

### 問題 #1: Button Props 不一致

**問題類型**: 共用元件問題
**嚴重度**: 🔴 Critical
**影響範圍**: WP003 (Reset Password Page)

#### 問題描述

整合後的 Button 元件合併了 WP001, WP002, WP003, WP005 的版本。
- WP003 原本的 Button 接受 `variant` prop
- 整合後的 Button 使用 `type` prop
- 導致 WP003 的按鈕樣式錯誤

#### 失敗測試

```
tests/integration/wp-features.test.ts
  ❌ WP003 (Reset Password) - "Reset password button should have primary style"
     Expected button to have class "btn-primary"
     But found class "btn-undefined"

     at ResetPasswordPage.tsx:45
```

#### 程式碼位置

```typescript
// 檔案: src/features/auth/reset-password/ResetPasswordPage.tsx:45
<Button variant="primary">重設密碼</Button>
```

#### 根因分析

1. WP003 仍使用舊的 `variant` prop
2. 整合後的 Button 元件改用 `type` prop
3. 未更新 WP003 的程式碼

#### 修正方案

**方案 A: 更新 WP003 使用新 API（建議）**

```typescript
// 檔案: src/features/auth/reset-password/ResetPasswordPage.tsx

// 修正前:
<Button variant="primary">重設密碼</Button>

// 修正後:
<Button type="primary">重設密碼</Button>
```

**方案 B: Button 元件支援向後兼容**

```typescript
// 檔案: src/shared/components/Button.tsx

interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger';
  variant?: 'primary' | 'secondary' | 'danger';  // 向後兼容
  // ...
}

export function Button({ type, variant, ...props }: ButtonProps) {
  const buttonType = type || variant;  // variant 作為 fallback
  // ...
}
```

**建議**: 使用方案 A（統一 API 更好，避免未來混亂）

#### 驗證方式

- [ ] 修正程式碼
- [ ] 執行 `npm test tests/integration/wp-features.test.ts`
- [ ] 確認 WP003 測試通過
- [ ] 執行完整整合測試確認無其他影響

---

### 問題 #2: Session Token 傳遞問題

**問題類型**: 跨 WP 流程問題
**嚴重度**: 🔴 Critical
**影響範圍**: WP001 (Login) → WP004 (Profile)

#### 問題描述

E2E 測試：使用者登入後無法查看個人資料
- WP001 的 login 函數將 token 存在 localStorage
- WP004 的 getProfile 函數從 sessionStorage 讀取
- 整合前各自獨立運作，整合後發現不一致

#### 失敗測試

```
tests/integration/auth-flow.test.ts
  ❌ "使用者可以註冊、登入、查看個人資料、登出"
     Step 3 failed: getProfile returned 401 Unauthorized
     Reason: No token found in request headers

     Expected: 200 OK with profile data
     Received: 401 Unauthorized
```

#### 程式碼位置

**WP001 - Login (寫入 token)**:
```typescript
// 檔案: src/features/auth/login/login.service.ts:67
export async function login(credentials: LoginCredentials) {
  const response = await api.post('/api/auth/login', credentials);
  const { token } = response.data;
  localStorage.setItem('authToken', token);  // ← 寫入 localStorage
  return response.data;
}
```

**WP004 - Profile (讀取 token)**:
```typescript
// 檔案: src/features/profile/profile.service.ts:23
export async function getProfile() {
  const token = sessionStorage.getItem('authToken');  // ← 從 sessionStorage 讀取
  if (!token) {
    throw new Error('No auth token found');
  }
  const response = await api.get('/api/users/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
```

#### 根因分析

1. WP001 使用 localStorage 儲存 token
2. WP004 使用 sessionStorage 讀取 token
3. 兩者不一致，導致 token 無法傳遞

#### 修正方案

**方案 A: 統一使用 localStorage（建議）**

```typescript
// 檔案: src/features/profile/profile.service.ts:23

// 修正前:
const token = sessionStorage.getItem('authToken');

// 修正後:
const token = localStorage.getItem('authToken');
```

**方案 B: 建立共用的 Auth Storage 工具（更好）**

```typescript
// 檔案: src/shared/utils/auth-storage.ts (新建)

const STORAGE_KEY = 'authToken';

export const AuthStorage = {
  setToken: (token: string) => {
    localStorage.setItem(STORAGE_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  hasToken: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
  }
};
```

然後更新所有使用 token 的地方：

```typescript
// src/features/auth/login/login.service.ts
import { AuthStorage } from '@/shared/utils/auth-storage';

export async function login(credentials: LoginCredentials) {
  const response = await api.post('/api/auth/login', credentials);
  const { token } = response.data;
  AuthStorage.setToken(token);  // ✅ 使用統一介面
  return response.data;
}

// src/features/profile/profile.service.ts
import { AuthStorage } from '@/shared/utils/auth-storage';

export async function getProfile() {
  const token = AuthStorage.getToken();  // ✅ 使用統一介面
  if (!token) {
    throw new Error('No auth token found');
  }
  // ...
}

// src/features/auth/logout/logout.service.ts
import { AuthStorage } from '@/shared/utils/auth-storage';

export async function logout() {
  AuthStorage.removeToken();  // ✅ 使用統一介面
  // ...
}
```

**建議**: 使用方案 B（建立統一的 auth storage 工具）

**受影響檔案**:
- `src/features/auth/login/login.service.ts`
- `src/features/profile/profile.service.ts`
- `src/features/auth/logout/logout.service.ts`
- 所有讀取/寫入 token 的地方

#### 驗證方式

- [ ] 建立 `src/shared/utils/auth-storage.ts`
- [ ] 更新所有使用 token 的檔案
- [ ] 執行 `npm test tests/integration/auth-flow.test.ts`
- [ ] 確認 E2E 流程測試通過

---

### 問題 #3: Import 路徑未更新

**問題類型**: Import 路徑問題
**嚴重度**: 🟡 Warning
**影響範圍**: WP004 部分檔案

#### 問題描述

WP004 的某些檔案仍使用舊的相對路徑 import，未更新為新的 shared 路徑。

#### 失敗測試

```
tests/integration/wp-features.test.ts
  ⚠️ WP004 (Profile) - Module not found error
     Cannot find module './components/Button'
     Did you mean '@/shared/components/Button'?
```

#### 程式碼位置

```typescript
// 檔案: src/features/profile/components/ProfileHeader.tsx:3
import { Button } from './components/Button';  // ❌ 舊路徑
```

#### 修正方案

```typescript
// 檔案: src/features/profile/components/ProfileHeader.tsx:3

// 修正前:
import { Button } from './components/Button';

// 修正後:
import { Button } from '@/shared/components/Button';
```

**需要檢查的所有檔案**:
- `src/features/profile/components/ProfileHeader.tsx`
- `src/features/profile/components/ProfileForm.tsx`
- 其他可能的檔案（使用 grep 搜尋）

#### 驗證方式

```bash
# 搜尋所有舊的 import 路徑
grep -r "from '\./.*\/Button'" src/

# 修正後重新測試
npm test
```

---

### 問題 #4: API Contract 不一致

**問題類型**: Contract 不匹配
**嚴重度**: 🔴 Critical
**影響範圍**: Frontend (WP006) ↔ Backend (WP004)

#### 問題描述

Frontend 期望的 API 回應格式與 Backend 實際回傳的格式不一致。

#### 失敗測試

```
tests/integration/api.test.ts
  ❌ "GET /api/users/profile should return correct format"
     Frontend expects: response.data.user.userId
     Backend returns: response.data.user.id

     TypeError: Cannot read property 'userId' of undefined
```

#### 根因分析

**Frontend 期望** (來自 WP006/contract-expected.yaml):
```yaml
response:
  user:
    userId: string      # ← Frontend 期望 userId
    email: string
```

**Backend 實作** (來自 WP004):
```typescript
// src/features/profile/profile.controller.ts
return res.json({
  user: {
    id: user.id,       // ← Backend 回傳 id
    email: user.email
  }
});
```

#### 修正方案

**方案 A: Backend 改用 userId（建議 - 遵守 contract）**

```typescript
// 檔案: src/features/profile/profile.controller.ts

// 修正前:
return res.json({
  user: {
    id: user.id,
    email: user.email
  }
});

// 修正後:
return res.json({
  user: {
    userId: user.id,    // ✅ 使用 userId 符合 contract
    email: user.email
  }
});
```

**方案 B: Frontend 改讀 id（不建議 - 違反 contract）**

不建議這個方案，因為 contract 是在 visual-spec 階段就定義好的，Backend 應該遵守 contract。

#### 驗證方式

- [ ] 修正 Backend 回應格式
- [ ] 檢查 contract-expected.yaml 確認正確
- [ ] 執行 `npm test tests/integration/api.test.ts`
- [ ] 執行完整整合測試

---

### 問題 #5: 測試覆蓋率不足

**問題類型**: 測試不足
**嚴重度**: 🟡 Warning
**影響範圍**: 共用元件

#### 問題描述

整合後的共用元件測試覆蓋率僅 75%，未達 80% 要求。

#### 缺少的測試

**Button 元件**:
- ✅ 基本 render 測試
- ✅ Props 測試
- ✅ 事件處理測試
- ❌ 無障礙測試（缺少）
- ❌ Keyboard navigation 測試（缺少）

**Input 元件**:
- ✅ 基本 render 測試
- ✅ 驗證測試
- ❌ 跨瀏覽器測試（缺少）
- ❌ Edge case 測試（缺少）

#### 修正方案

補充測試案例：

```typescript
// 檔案: src/shared/components/Button.test.tsx

describe('Button Accessibility', () => {
  test('should have proper ARIA attributes', () => {
    // 測試 ARIA 標籤
  });

  test('should support keyboard navigation', () => {
    // 測試 Tab, Enter, Space 鍵
  });

  test('should announce state changes to screen readers', () => {
    // 測試 loading, disabled 狀態的宣告
  });
});

// 檔案: src/shared/components/Input.test.tsx

describe('Input Edge Cases', () => {
  test('should handle very long input', () => {
    // 測試超長輸入
  });

  test('should handle special characters', () => {
    // 測試特殊字元
  });

  test('should handle paste events', () => {
    // 測試貼上事件
  });
});
```

---

## 📊 詳細分析（僅供人類閱讀，AI 跳過）

### 失敗測試詳情

#### Test Case #1

**測試名稱**: "使用者可以註冊、登入、查看個人資料、登出"
**測試檔案**: `tests/integration/auth-flow.test.ts`
**失敗行數**: Line 45

**完整錯誤訊息**:
```
Error: Request failed with status code 401
    at login.service.ts:67
    at async auth-flow.test.ts:45

Expected status: 200
Received status: 401
Response: {"error": "Authentication required"}
```

**測試程式碼**:
```typescript
// Step 3: 查看個人資料 (WP004)
const profileResponse = await getProfile(token);  // ← 這裡失敗
expect(profileResponse.status).toBe(200);
```

**根因**: Token 未正確傳遞（localStorage vs sessionStorage）

---

### 整合衝突分析

#### 衝突類型分布

```
共用元件 props 不一致:  ████████████ 40%
數據流問題:            ███████ 30%
Contract 不匹配:        ████ 20%
Import 路徑錯誤:        ██ 10%
```

#### 受影響的 WP

- WP001 (Login): 1 個問題
- WP003 (Reset Password): 1 個問題
- WP004 (Profile): 3 個問題
- WP006 (Session): 1 個問題

---

## 🔍 根因深度分析

### 為什麼會有 localStorage vs sessionStorage 問題？

1. **原因**: WP001 和 WP004 獨立開發，各自選擇了不同的儲存方式
2. **發現時機**: 整合測試階段（E2E 測試）
3. **影響**: Critical - 完全阻斷跨 WP 流程
4. **預防方法**: 在 visual-spec 或 design-spec 階段就應該定義統一的 auth storage 機制

### 為什麼會有 API Contract 不一致？

1. **原因**: Backend (WP004) 未嚴格遵守 contract-expected.yaml
2. **發現時機**: 整合測試階段（API 整合測試）
3. **影響**: Critical - Frontend 無法正確解析 Backend 回應
4. **預防方法**:
   - `/speckit.verify --wp WP004` 應該在 WP004 完成時就檢查 contract
   - 可能 verify 沒有正確執行或被跳過

---

## 📝 修正歷史（自動記錄到 integration-journal.md）

[每次執行 `/speckit.fix-integration` 後會自動附加]

---

## 🚀 建議的修正順序

基於嚴重度和相依性，建議按以下順序修正：

1. **問題 #2: Session Token 傳遞問題** (🔴 Critical)
   - 影響所有跨 WP 流程
   - 建議建立 AuthStorage 工具
   - 預估時間: 30 分鐘

2. **問題 #4: API Contract 不一致** (🔴 Critical)
   - 影響 Frontend-Backend 通訊
   - 修正 Backend 回應格式
   - 預估時間: 15 分鐘

3. **問題 #1: Button Props 不一致** (🔴 Critical)
   - 影響 WP003 功能
   - 更新 prop 名稱或加入向後兼容
   - 預估時間: 10 分鐘

4. **問題 #3: Import 路徑未更新** (🟡 Warning)
   - 影響建置
   - 批次更新 import 路徑
   - 預估時間: 15 分鐘

5. **問題 #5: 測試覆蓋率不足** (🟡 Warning)
   - 不阻斷功能，但影響品質
   - 補充測試案例
   - 預估時間: 1 小時

**總預估時間**: 約 2 小時

---

## 🔄 自動修正建議

如果選擇使用 `--auto` 模式：

```bash
/speckit.fix-integration --auto
```

AI 將自動嘗試修正以下問題：
- ✅ 問題 #1 (Button props) - 可自動修正
- ✅ 問題 #2 (Token storage) - 可自動修正
- ✅ 問題 #3 (Import paths) - 可自動修正
- ⚠️ 問題 #4 (API contract) - 需要人工確認
- ⚠️ 問題 #5 (Test coverage) - 需要人工撰寫測試

**建議**: 先手動修正 Critical 問題，確保理解根因後再使用 auto 模式。

---

**生成工具**: SpecKit V2 - `/speckit.verify --integration` (自動診斷)
**報告版本**: 1.0.0
