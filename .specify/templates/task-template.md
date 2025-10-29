# Task: [Task Name]

**Work Package**: WP[###] - [WP Name]
**Task ID**: task-[###]
**Type**: [Write Tests|Implement Backend|Implement Frontend|Integration]
**預估時間**: [30-60] 分鐘
**相依**: [無 | task-[###] 必須先完成]

---

## 🎯 你的任務

[一句話明確說明這個 task 要完成什麼]

---

## 📋 TDD 流程（測試驅動開發）

### Step 1: 寫測試（Red）🔴

先寫**會失敗**的測試，定義預期行為：

```[language]
// 檔案：[test file path]
describe('[Feature/Component] Tests', () => {
  it('should [expected behavior]', () => {
    // Arrange: 準備測試資料
    // Act: 執行被測試的功能
    // Assert: 驗證結果
  });
});
```

**測試必須涵蓋**：
- ✅ 成功路徑（Happy Path）
- ✅ 錯誤路徑（Error Cases）
- ✅ 邊界條件（Edge Cases）
- ✅ 驗證規則（Validation Rules）

### Step 2: 執行測試

```bash
npm test  # 或其他測試指令
```

**預期結果**: ❌ 測試失敗（因為功能還沒實作）

### Step 3: 實作功能（Green）🟢

實作**最少的程式碼**讓測試通過。

**遵守契約**：
- 使用契約中**精確的欄位名稱**
- 實作**所有**驗證規則
- 使用**精確的**錯誤訊息

### Step 4: 重構（Refactor）🔵

如果需要，重構程式碼（保持測試通過）：
- 消除重複
- 改善命名
- 優化結構

---

## 📜 契約（必須嚴格遵守）

從 `work-packages/WP[###]/contract-expected.yaml` 提取相關部分：

```yaml
# [相關的契約內容]
fields:
  [field1]:
    type: [type]
    required: true
    validation: [rules]

  [field2]:
    type: [type]
    required: false
```

### 關鍵規則

- ✅ 使用**精確的欄位名稱**（不要改成 camelCase 或 snake_case，契約怎麼寫就怎麼用）
- ✅ 實作**所有**驗證規則（不可省略）
- ✅ 使用**精確的**錯誤訊息（word-for-word）
- ❌ 不要新增契約中沒有的欄位
- ❌ 不要修改欄位類型
- ❌ 不要跳過任何驗證規則

---

## 📝 要建立/修改的檔案

### 主要檔案
- `[file path 1]` - [檔案用途說明]
- `[file path 2]` - [檔案用途說明]

### 測試檔案
- `[test file path 1]` - [測試用途說明]

---

## 🧪 測試範例

**重要**: 根據 `design-spec.yaml#technical_context.testing` 的測試框架選擇對應的範例。

---

### 📚 根據測試框架選擇範例

#### 如果使用 **Jest (TypeScript/JavaScript)**

##### 測試類型 1：成功路徑

```typescript
// 檔案：src/features/[feature]/[feature].test.ts
import { [functionName] } from './[feature].service';

describe('[Feature] Tests', () => {
  it('should [expected behavior] when [condition]', async () => {
    // Given (Arrange)
    const testData = {
      field1: 'value1',
      field2: 'value2'
    };

    // When (Act)
    const result = await [functionName](testData);

    // Then (Assert)
    expect(result).toEqual({
      id: expect.any(String),
      field1: 'value1',
      field2: 'value2'
    });
    expect(result.id).toBeDefined();
  });
});
```

##### 測試類型 2：錯誤路徑

```typescript
it('should throw error when [error condition]', async () => {
  // Given
  const invalidData = {
    field1: '',  // 空值，應該失敗
    field2: 'value2'
  };

  // When & Then
  await expect([functionName](invalidData))
    .rejects
    .toThrow('[精確的錯誤訊息]');
});
```

##### 測試類型 3：驗證規則

```typescript
it('should validate [field] [rule]', async () => {
  // Given
  const data = {
    email: 'invalid-email',  // 錯誤的 email 格式
    password: 'short'        // 太短的密碼
  };

  // When & Then
  await expect([functionName](data))
    .rejects
    .toThrow('Invalid email format');  // 契約中的精確錯誤訊息
});
```

##### API 測試（使用 Supertest）

```typescript
// 檔案：src/features/[feature]/[feature].api.test.ts
import request from 'supertest';
import app from '../../app';

describe('[API Endpoint] Tests', () => {
  it('should return 200 and data when valid request', async () => {
    // Given
    const requestBody = {
      field1: 'value1',
      field2: 'value2'
    };

    // When
    const response = await request(app)
      .post('/api/[endpoint]')
      .send(requestBody)
      .set('Accept', 'application/json');

    // Then
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      field1: 'value1',
      field2: 'value2'
    });
  });

  it('should return 400 when validation fails', async () => {
    // Given
    const invalidBody = {
      field1: '',  // 空值
    };

    // When
    const response = await request(app)
      .post('/api/[endpoint]')
      .send(invalidBody);

    // Then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('[精確的錯誤訊息]');
  });
});
```

##### React 元件測試（使用 React Testing Library）

```typescript
// 檔案：src/features/[feature]/[Feature]Page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { [Component]Page } from './[Feature]Page';

describe('[Component]Page Tests', () => {
  it('should render form with all required fields', () => {
    // Given & When
    render(<[Component]Page />);

    // Then
    expect(screen.getByLabelText('[Label Text]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '[Button Text]' })).toBeInTheDocument();
  });

  it('should show error when form validation fails', async () => {
    // Given
    render(<[Component]Page />);
    const submitButton = screen.getByRole('button', { name: '[Button Text]' });

    // When
    fireEvent.click(submitButton);

    // Then
    await waitFor(() => {
      expect(screen.getByText('[精確的錯誤訊息]')).toBeInTheDocument();
    });
  });

  it('should call API when form is submitted with valid data', async () => {
    // Given
    const mockApi = jest.fn().mockResolvedValue({ success: true });
    render(<[Component]Page apiCall={mockApi} />);

    // When
    fireEvent.change(screen.getByLabelText('[Field Label]'), {
      target: { value: 'test value' }
    });
    fireEvent.click(screen.getByRole('button', { name: '[Button Text]' }));

    // Then
    await waitFor(() => {
      expect(mockApi).toHaveBeenCalledWith({
        [field]: 'test value'
      });
    });
  });
});
```

---

#### 如果使用 **Pytest (Python)**

##### 測試類型 1：成功路徑

```python
# 檔案：tests/features/[feature]/test_[feature].py
import pytest
from src.features.[feature].[feature]_service import [function_name]

def test_should_[expected_behavior]_when_[condition]():
    # Given (Arrange)
    test_data = {
        'field1': 'value1',
        'field2': 'value2'
    }

    # When (Act)
    result = [function_name](test_data)

    # Then (Assert)
    assert result['id'] is not None
    assert result['field1'] == 'value1'
    assert result['field2'] == 'value2'
```

##### 測試類型 2：錯誤路徑

```python
def test_should_raise_error_when_[error_condition]():
    # Given
    invalid_data = {
        'field1': '',  # 空值，應該失敗
        'field2': 'value2'
    }

    # When & Then
    with pytest.raises(ValueError) as exc_info:
        [function_name](invalid_data)

    assert str(exc_info.value) == '[精確的錯誤訊息]'
```

##### 測試類型 3：驗證規則

```python
def test_should_validate_[field]_[rule]():
    # Given
    data = {
        'email': 'invalid-email',  # 錯誤的 email 格式
        'password': 'short'        # 太短的密碼
    }

    # When & Then
    with pytest.raises(ValueError) as exc_info:
        [function_name](data)

    assert str(exc_info.value) == 'Invalid email format'  # 契約中的精確錯誤訊息
```

##### API 測試（使用 FastAPI TestClient）

```python
# 檔案：tests/features/[feature]/test_[feature]_api.py
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_should_return_200_when_valid_request():
    # Given
    request_body = {
        'field1': 'value1',
        'field2': 'value2'
    }

    # When
    response = client.post('/api/[endpoint]', json=request_body)

    # Then
    assert response.status_code == 200
    assert response.json()['field1'] == 'value1'
    assert response.json()['field2'] == 'value2'
    assert 'id' in response.json()

def test_should_return_400_when_validation_fails():
    # Given
    invalid_body = {
        'field1': ''  # 空值
    }

    # When
    response = client.post('/api/[endpoint]', json=invalid_body)

    # Then
    assert response.status_code == 400
    assert response.json()['error'] == '[精確的錯誤訊息]'
```

---

#### 如果使用 **Go Test (Go)**

##### 測試類型 1：成功路徑

```go
// 檔案：features/[feature]/[feature]_test.go
package [feature]

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestShould[ExpectedBehavior]When[Condition](t *testing.T) {
    // Given
    testData := &[Struct]{
        Field1: "value1",
        Field2: "value2",
    }

    // When
    result, err := [FunctionName](testData)

    // Then
    assert.NoError(t, err)
    assert.NotNil(t, result.ID)
    assert.Equal(t, "value1", result.Field1)
    assert.Equal(t, "value2", result.Field2)
}
```

##### 測試類型 2：錯誤路徑

```go
func TestShouldReturnErrorWhen[ErrorCondition](t *testing.T) {
    // Given
    invalidData := &[Struct]{
        Field1: "",  // 空值，應該失敗
        Field2: "value2",
    }

    // When
    result, err := [FunctionName](invalidData)

    // Then
    assert.Error(t, err)
    assert.Nil(t, result)
    assert.Equal(t, "[精確的錯誤訊息]", err.Error())
}
```

##### 測試類型 3：驗證規則

```go
func TestShouldValidate[Field][Rule](t *testing.T) {
    // Given
    data := &[Struct]{
        Email:    "invalid-email",  // 錯誤的 email 格式
        Password: "short",          // 太短的密碼
    }

    // When
    err := [ValidateFunction](data)

    // Then
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "Invalid email format")
}
```

---

#### 如果使用 **Vitest (Vue/React)**

##### 測試類型 1：成功路徑

```typescript
// 檔案：src/features/[feature]/[feature].test.ts
import { describe, it, expect } from 'vitest';
import { [functionName] } from './[feature].service';

describe('[Feature] Tests', () => {
  it('should [expected behavior] when [condition]', async () => {
    // Given
    const testData = {
      field1: 'value1',
      field2: 'value2'
    };

    // When
    const result = await [functionName](testData);

    // Then
    expect(result).toMatchObject({
      field1: 'value1',
      field2: 'value2'
    });
    expect(result.id).toBeDefined();
  });
});
```

##### Vue 元件測試（使用 Vue Test Utils）

```typescript
// 檔案：src/features/[feature]/[Component].test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import [Component] from './[Component].vue';

describe('[Component] Tests', () => {
  it('should render form with all required fields', () => {
    // Given & When
    const wrapper = mount([Component]);

    // Then
    expect(wrapper.find('input[name="[field]"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('[Button Text]');
  });

  it('should show error when validation fails', async () => {
    // Given
    const wrapper = mount([Component]);

    // When
    await wrapper.find('button[type="submit"]').trigger('click');

    // Then
    expect(wrapper.text()).toContain('[精確的錯誤訊息]');
  });
});
```

---

### 📝 測試檔案命名規範

根據測試框架和檔案類型：

**Jest/Vitest (TypeScript/JavaScript)**:
- 單元測試：`[feature].test.ts` 或 `[feature].spec.ts`
- API 測試：`[feature].api.test.ts`
- 元件測試：`[Component].test.tsx`

**Pytest (Python)**:
- 測試檔案：`test_[feature].py`
- 測試函數：`test_should_[behavior]_when_[condition]()`

**Go Test**:
- 測試檔案：`[feature]_test.go`
- 測試函數：`TestShould[Behavior]When[Condition]()`

---

### 🎯 測試覆蓋要求

根據 `design-spec.yaml#technical_context.testing.coverage_requirement`：

**最低要求**: 80%

**測試必須涵蓋**：
- ✅ 成功路徑（Happy Path）
- ✅ 錯誤路徑（Error Cases）
- ✅ 邊界條件（Edge Cases）
- ✅ 所有驗證規則（Validation Rules）

**執行測試覆蓋率**：

```bash
# Jest
npm test -- --coverage

# Pytest
pytest --cov=src tests/

# Go
go test -cover ./...

# Vitest
npm run test:coverage
```

---

## ✅ 完成檢查清單

完成此 task 前，確認：

### TDD 流程
- [ ] 測試已寫好（Red）
- [ ] 測試執行並失敗（確認測試有效）
- [ ] 功能已實作（Green）
- [ ] 測試通過（確認實作正確）
- [ ] 已重構（如需要）

### 契約遵守
- [ ] 所有欄位名稱與契約一致
- [ ] 所有欄位類型與契約一致
- [ ] 所有驗證規則已實作
- [ ] 錯誤訊息與契約完全相同
- [ ] 沒有新增契約外的欄位

### 測試覆蓋
- [ ] 成功路徑已測試
- [ ] 錯誤路徑已測試
- [ ] 邊界條件已測試
- [ ] 驗證規則已測試
- [ ] 測試覆蓋率 ≥ 80%

### 程式碼品質
- [ ] 程式碼可讀
- [ ] 無重複程式碼
- [ ] 變數命名清楚
- [ ] 無 console.log 或 debug 程式碼

---

## 📝 記錄到 Journal

完成後，將以下資訊記錄到 `work-packages/WP[###]/journal.md`：

```markdown
## Task-[###]: [Task Name]
**執行時間**: [TIMESTAMP]
**狀態**: ✅ 完成

### 做了什麼
- [列出主要完成的工作]

### 建立的檔案
- [file1] ([行數] 行)
- [file2] ([行數] 行)

### 修改的檔案
- [file1] (新增 [X] 行)

### 測試結果
- 測試數量：[X] 個
- 測試通過：[X] 個
- 測試覆蓋率：[X]%

### 重要決定
- [記錄任何重要的技術決定或選擇]

### 遇到的問題
- [問題描述]
- [解決方法]

---
```

---

## 🔄 下一步

完成此 task 後：

1. **記錄到 Journal**: 將工作記錄到 `journal.md`
2. **執行下一個 Task**: `/speckit.implement WP[###]/task-[next]`
3. **或驗證整個 WP**: 如果這是最後一個 task，執行 `/speckit.verify --wp WP[###]`

---

## 📚 相關資源

**Contract**: `work-packages/WP[###]/contract-expected.yaml`
**WP README**: `work-packages/WP[###]/README.md`
**Design Spec**: `design-spec.yaml#[section]`
**Visual Spec**: `visual-spec/[relevant files]`

---

## ⚠️ 常見錯誤

避免以下常見錯誤：

1. ❌ **欄位名稱不一致**: 契約寫 `user_id`，你寫 `userId`
2. ❌ **跳過驗證規則**: 契約要求 `minLength: 8`，你沒實作
3. ❌ **錯誤訊息不精確**: 契約寫 "Invalid email format"，你寫 "Email is invalid"
4. ❌ **新增額外欄位**: 契約沒有的欄位，你自己加了
5. ❌ **測試不完整**: 只測試成功路徑，沒測試錯誤路徑
6. ❌ **沒有先寫測試**: 先寫實作再寫測試（不是 TDD）

---

## 💡 提示

- 如果契約不清楚，先檢查 `visual-spec/contracts/`
- 如果 UI 規格不清楚，先檢查 `visual-spec/pages/`
- 遇到問題記錄在 journal.md，不要默默跳過
- 測試是你的保護網，寫詳細的測試
