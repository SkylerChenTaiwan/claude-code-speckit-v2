# Task: 整合與 E2E 測試 (TDD - Refactor)

**Work Package**: WP001 - 專案管理與檔案操作功能
**Task ID**: task-004
**Type**: Integration
**預估時間**: 45 分鐘
**相依**: task-001, task-002, task-003 必須先完成

---

## 🎯 你的任務

前後端整合，撰寫 E2E 測試，確認完整流程正常運作，並重構程式碼。

---

## 📝 要建立的檔案

- `tests/e2e/project-file-management.spec.ts` - Playwright E2E 測試
- `src/main/main.ts` - 註冊 IPC handlers (若還沒註冊)

---

## 🧪 E2E 測試範例（Playwright）

```typescript
import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

test.describe('專案檔案管理', () => {
  test('應該能建立新專案並儲存', async ({ page }) => {
    // Given - 啟動應用程式
    await page.goto('/');

    // When - 點擊建立新專案
    await page.click('[data-testid="new-project-btn"]');
    
    // Then - 應該跳轉到文稿輸入頁面
    await expect(page).toHaveURL('/script-input');
  });

  test('應該能載入現有專案', async ({ page }) => {
    // Given - 準備測試專案檔案
    const testProject = {
      version: '1.0',
      projectId: 'test-id',
      projectName: '測試專案',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStage: 'script-input',
      scriptContent: '測試文稿',
      settings: { voiceId: 'zh-TW-HsiaoChenNeural', outputPath: '/tmp' }
    };

    const testFilePath = path.join('/tmp', 'test-project.json');
    await fs.writeFile(testFilePath, JSON.stringify(testProject));

    await page.goto('/');

    // When - 載入專案（模擬檔案選擇）
    // 注意：實際 E2E 需要模擬 Electron 對話框
    
    // Then - 驗證專案已載入
    // ...
  });
});
```

---

## ✅ 完成檢查清單

- [ ] E2E 測試已建立
- [ ] IPC handlers 已在 main.ts 註冊
- [ ] 所有測試通過（Unit + Integration + E2E）
- [ ] 測試覆蓋率 ≥ 80%
- [ ] 程式碼已重構（消除重複、改善命名）

---

## 📝 記錄到 Journal

```markdown
## Session 4: Task-004 - 整合測試

**執行時間**: [時間]
**狀態**: ✅ 完成

### 做了什麼
- 建立 E2E 測試
- 前後端整合完成
- 所有測試通過

### 測試結果
- 總測試數量：16 個
- 測試通過：16 個
- 測試覆蓋率：85%

---
```

---

## 🔄 下一步

執行: `/speckit.verify --wp WP001` (驗證契約)
