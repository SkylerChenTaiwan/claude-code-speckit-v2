# Task: 實作後端 IPC Handlers (TDD - Green)

**Work Package**: WP001 - 專案管理與檔案操作功能
**Task ID**: task-002
**Type**: Implement Backend
**預估時間**: 60 分鐘
**相依**: task-001 必須先完成

---

## 🎯 你的任務

實作 file IPC handlers (file:read, file:write, file:select, directory:select)，讓 task-001 的測試通過（Green）。

---

## 📝 要建立的檔案

### 主要檔案
- `src/main/ipc/fileHandlers.ts` - 實作所有 IPC handlers
- `src/main/utils/fileValidator.ts` - 檔案驗證邏輯
- `src/main/utils/recentProjects.ts` - 最近專案管理

---

## 📜 契約（必須嚴格遵守）

### IPC Handlers 實作要求

```typescript
// file:read
export async function handleFileRead(args: { path: string }): Promise<{
  content?: string;
  error?: string;
}> {
  // 1. 驗證 path 是絕對路徑
  // 2. 檢查檔案是否存在
  // 3. 讀取檔案內容
  // 4. 返回結果或錯誤訊息（EXACT）
}

// file:write
export async function handleFileWrite(args: { path: string; content: string }): Promise<{
  success: boolean;
  error?: string;
}> {
  // 1. 驗證 path 是絕對路徑
  // 2. 寫入檔案
  // 3. 返回結果或錯誤訊息（EXACT）
}

// file:select
export async function handleFileSelect(args: {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
}): Promise<{
  filePath?: string;
  canceled: boolean;
}> {
  // 使用 dialog.showOpenDialog
}

// directory:select
export async function handleDirectorySelect(args: {
  title?: string;
  defaultPath?: string;
}): Promise<{
  directoryPath?: string;
  canceled: boolean;
}> {
  // 使用 dialog.showOpenDialog with properties: ['openDirectory']
}
```

### 錯誤訊息（EXACT）
- "檔案不存在"
- "無法讀取檔案"
- "無法寫入檔案"
- "必須使用絕對路徑"

---

## ✅ 完成檢查清單

- [ ] fileHandlers.ts 已建立並實作所有 handlers
- [ ] fileValidator.ts 已建立
- [ ] 所有欄位名稱與契約一致
- [ ] 所有錯誤訊息與契約一致
- [ ] 測試通過（Green）

---

## 📝 記錄到 Journal

```markdown
## Session 2: Task-002 - 實作後端

**執行時間**: [時間]
**狀態**: ✅ 完成

### 做了什麼
- 實作 fileHandlers.ts
- 實作檔案驗證邏輯
- 所有後端測試通過

### 測試結果
- 後端測試：8/8 通過

---
```

---

## 🔄 下一步

執行: `/speckit.implement WP001/task-003` (實作前端)
