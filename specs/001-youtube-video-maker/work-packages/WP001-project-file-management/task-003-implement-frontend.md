# Task: 實作前端 HomePage (TDD - Green)

**Work Package**: WP001 - 專案管理與檔案操作功能
**Task ID**: task-003
**Type**: Implement Frontend
**預估時間**: 60 分鐘
**相依**: task-001, task-002 必須先完成

---

## 🎯 你的任務

實作 HomePage UI 元件，讓 task-001 的前端測試通過（Green）。

---

## 📝 要建立的檔案

- `src/renderer/pages/HomePage/HomePage.tsx`
- `src/renderer/pages/HomePage/components/RecentProjectCard.tsx`
- `src/renderer/pages/HomePage/components/QuickActionButton.tsx`
- `src/renderer/stores/projectStore.ts`

---

## 📜 契約（必須嚴格遵守）

### HomePage 元件

必須包含的元素（使用 testId）：
- `new-project-btn` - 建立新專案按鈕
- `load-project-btn` - 載入專案按鈕
- `api-settings-btn` - API 設定按鈕
- `recent-projects` - 最近專案列表

### IPC 呼叫

```typescript
// 載入專案
const result = await window.electron.ipcRenderer.invoke('file:select', {
  title: '選擇專案檔案',
  filters: [{ name: '專案檔案', extensions: ['json'] }]
});

if (!result.canceled) {
  const fileContent = await window.electron.ipcRenderer.invoke('file:read', {
    path: result.filePath
  });
  
  if (!fileContent.error) {
    const projectData = JSON.parse(fileContent.content);
    useProjectStore.getState().loadProject(projectData);
  }
}
```

---

## ✅ 完成檢查清單

- [ ] HomePage.tsx 已建立
- [ ] 所有必要元件已渲染
- [ ] IPC 呼叫邏輯正確
- [ ] projectStore 已建立
- [ ] 測試通過（Green）

---

## 🔄 下一步

執行: `/speckit.implement WP001/task-004` (整合測試)
