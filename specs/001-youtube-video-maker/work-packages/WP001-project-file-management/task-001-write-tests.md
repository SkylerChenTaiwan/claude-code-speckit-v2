# Task: 撰寫測試 (TDD - Red)

**Work Package**: WP001 - 專案管理與檔案操作功能
**Task ID**: task-001
**Type**: Write Tests
**預估時間**: 45 分鐘
**相依**: 無

---

## 🎯 你的任務

撰寫 WP001 的所有測試（後端 IPC handlers + 前端 HomePage），讓測試先失敗（Red），定義預期行為。

---

## 📋 TDD 流程（測試驅動開發）

### Step 1: 寫測試（Red）🔴

先寫**會失敗**的測試，定義預期行為。

### Step 2: 執行測試

```bash
# 後端測試 (Jest)
npm test src/main/ipc/fileHandlers.test.ts

# 前端測試 (Vitest)
npm test src/renderer/pages/HomePage/HomePage.test.tsx
```

**預期結果**: ❌ 測試失敗（因為功能還沒實作）

---

## 📜 契約（必須嚴格遵守）

從 `contract-expected.yaml` 提取：

### IPC 通道
```yaml
file:read:
  request: { path: string }
  response: { content: string, error?: string }

file:write:
  request: { path: string, content: string }
  response: { success: boolean, error?: string }

file:select:
  request: { title?, filters?, defaultPath? }
  response: { filePath: string, canceled: boolean }

directory:select:
  request: { title?, defaultPath? }
  response: { directoryPath: string, canceled: boolean }
```

### 錯誤訊息（EXACT）
- "檔案不存在"
- "無法讀取檔案"
- "無法寫入檔案"
- "檔案格式錯誤"
- "必須使用絕對路徑"
- "專案名稱不能為空"
- "專案名稱最多 100 字"

---

## 📝 要建立的測試檔案

### 1. 後端測試
- `src/main/ipc/fileHandlers.test.ts` - IPC handlers 測試

### 2. 前端測試
- `src/renderer/pages/HomePage/HomePage.test.tsx` - HomePage 元件測試

---

## 🧪 測試範例

### 後端測試 (Jest)

```typescript
// 檔案：src/main/ipc/fileHandlers.test.ts
import { describe, it, expect, jest } from '@jest/globals';
import { handleFileRead, handleFileWrite, handleFileSelect, handleDirectorySelect } from './fileHandlers';
import * as fs from 'fs/promises';
import { dialog } from 'electron';

jest.mock('fs/promises');
jest.mock('electron');

describe('File IPC Handlers', () => {
  describe('file:read', () => {
    it('should successfully read file content', async () => {
      // Given
      const mockContent = '{"version":"1.0","projectId":"test-id"}';
      (fs.readFile as jest.Mock).mockResolvedValue(mockContent);

      // When
      const result = await handleFileRead({ path: '/absolute/path/project.json' });

      // Then
      expect(result.content).toBe(mockContent);
      expect(result.error).toBeUndefined();
    });

    it('should return error when file does not exist', async () => {
      // Given
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      // When
      const result = await handleFileRead({ path: '/nonexistent/file.json' });

      // Then
      expect(result.content).toBeUndefined();
      expect(result.error).toBe('檔案不存在');
    });

    it('should return error when path is not absolute', async () => {
      // When
      const result = await handleFileRead({ path: 'relative/path.json' });

      // Then
      expect(result.error).toBe('必須使用絕對路徑');
    });
  });

  describe('file:write', () => {
    it('should successfully write file content', async () => {
      // Given
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      // When
      const result = await handleFileWrite({
        path: '/absolute/path/project.json',
        content: '{"test":"data"}'
      });

      // Then
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error when write fails', async () => {
      // Given
      (fs.writeFile as jest.Mock).mockRejectedValue(new Error('EACCES'));

      // When
      const result = await handleFileWrite({
        path: '/readonly/file.json',
        content: '{"test":"data"}'
      });

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('無法寫入檔案');
    });
  });

  describe('file:select', () => {
    it('should return selected file path', async () => {
      // Given
      (dialog.showOpenDialog as jest.Mock).mockResolvedValue({
        filePaths: ['/selected/file.json'],
        canceled: false
      });

      // When
      const result = await handleFileSelect({
        title: '選擇專案檔案',
        filters: [{ name: '專案檔案', extensions: ['json'] }]
      });

      // Then
      expect(result.filePath).toBe('/selected/file.json');
      expect(result.canceled).toBe(false);
    });

    it('should return canceled when user cancels', async () => {
      // Given
      (dialog.showOpenDialog as jest.Mock).mockResolvedValue({
        filePaths: [],
        canceled: true
      });

      // When
      const result = await handleFileSelect({});

      // Then
      expect(result.filePath).toBeUndefined();
      expect(result.canceled).toBe(true);
    });
  });

  describe('directory:select', () => {
    it('should return selected directory path', async () => {
      // Given
      (dialog.showOpenDialog as jest.Mock).mockResolvedValue({
        filePaths: ['/selected/directory'],
        canceled: false
      });

      // When
      const result = await handleDirectorySelect({
        title: '選擇輸出目錄'
      });

      // Then
      expect(result.directoryPath).toBe('/selected/directory');
      expect(result.canceled).toBe(false);
    });
  });
});
```

### 前端測試 (Vitest + React Testing Library)

```typescript
// 檔案：src/renderer/pages/HomePage/HomePage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HomePage } from './HomePage';
import { useProjectStore } from '@/renderer/stores/projectStore';

// Mock IPC
const mockIpcInvoke = vi.fn();
(window as any).electron = {
  ipcRenderer: {
    invoke: mockIpcInvoke
  }
};

vi.mock('@/renderer/stores/projectStore');

describe('HomePage', () => {
  beforeEach(() => {
    mockIpcInvoke.mockClear();
    (useProjectStore as any).mockReturnValue({
      recentProjects: [],
      loadProject: vi.fn(),
      createNewProject: vi.fn()
    });
  });

  describe('Rendering', () => {
    it('should render all required elements', () => {
      // When
      render(<HomePage />);

      // Then
      expect(screen.getByTestId('new-project-btn')).toBeInTheDocument();
      expect(screen.getByTestId('load-project-btn')).toBeInTheDocument();
      expect(screen.getByTestId('api-settings-btn')).toBeInTheDocument();
      expect(screen.getByText('建立新專案')).toBeInTheDocument();
      expect(screen.getByText('載入專案')).toBeInTheDocument();
    });

    it('should render recent projects list', () => {
      // Given
      (useProjectStore as any).mockReturnValue({
        recentProjects: [
          { projectId: '1', projectName: '專案 1', updatedAt: '2025-10-29T10:00:00Z' },
          { projectId: '2', projectName: '專案 2', updatedAt: '2025-10-29T11:00:00Z' }
        ],
        loadProject: vi.fn(),
        createNewProject: vi.fn()
      });

      // When
      render(<HomePage />);

      // Then
      expect(screen.getByText('專案 1')).toBeInTheDocument();
      expect(screen.getByText('專案 2')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call file:select when load project button is clicked', async () => {
      // Given
      mockIpcInvoke.mockResolvedValue({
        filePath: '/path/to/project.json',
        canceled: false
      });
      const mockLoadProject = vi.fn();
      (useProjectStore as any).mockReturnValue({
        recentProjects: [],
        loadProject: mockLoadProject,
        createNewProject: vi.fn()
      });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(mockIpcInvoke).toHaveBeenCalledWith('file:select', {
          title: '選擇專案檔案',
          filters: [{ name: '專案檔案', extensions: ['json'] }]
        });
      });
    });

    it('should load project when file is selected', async () => {
      // Given
      const mockProjectData = {
        version: '1.0',
        projectId: 'test-id',
        projectName: '測試專案',
        createdAt: '2025-10-29T10:00:00Z',
        updatedAt: '2025-10-29T10:00:00Z',
        currentStage: 'script-input',
        scriptContent: '測試文稿',
        settings: {}
      };

      mockIpcInvoke
        .mockResolvedValueOnce({ filePath: '/path/to/project.json', canceled: false })
        .mockResolvedValueOnce({ content: JSON.stringify(mockProjectData), error: undefined });

      const mockLoadProject = vi.fn();
      (useProjectStore as any).mockReturnValue({
        recentProjects: [],
        loadProject: mockLoadProject,
        createNewProject: vi.fn()
      });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(mockLoadProject).toHaveBeenCalledWith(mockProjectData);
      });
    });

    it('should show error message when file read fails', async () => {
      // Given
      mockIpcInvoke
        .mockResolvedValueOnce({ filePath: '/path/to/project.json', canceled: false })
        .mockResolvedValueOnce({ content: undefined, error: '檔案不存在' });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(screen.getByText('檔案不存在')).toBeInTheDocument();
      });
    });

    it('should not load project when dialog is canceled', async () => {
      // Given
      mockIpcInvoke.mockResolvedValue({ filePath: undefined, canceled: true });
      const mockLoadProject = vi.fn();
      (useProjectStore as any).mockReturnValue({
        recentProjects: [],
        loadProject: mockLoadProject,
        createNewProject: vi.fn()
      });

      render(<HomePage />);

      // When
      fireEvent.click(screen.getByTestId('load-project-btn'));

      // Then
      await waitFor(() => {
        expect(mockLoadProject).not.toHaveBeenCalled();
      });
    });
  });
});
```

---

## ✅ 完成檢查清單

- [ ] fileHandlers.test.ts 已建立（至少 8 個測試）
- [ ] HomePage.test.tsx 已建立（至少 6 個測試）
- [ ] 測試涵蓋成功路徑、錯誤路徑、邊界條件
- [ ] 錯誤訊息與契約完全相同
- [ ] 測試執行並失敗（Red 階段）

---

## 📝 記錄到 Journal

完成後，將資訊記錄到 `journal.md`：

```markdown
## Session 1: Task-001 - 撰寫測試

**執行時間**: [時間]
**狀態**: ✅ 完成

### 做了什麼
- 建立 fileHandlers.test.ts（8 個測試）
- 建立 HomePage.test.tsx（6 個測試）
- 涵蓋所有成功路徑和錯誤情境

### 建立的檔案
- `src/main/ipc/fileHandlers.test.ts` (150 行)
- `src/renderer/pages/HomePage/HomePage.test.tsx` (120 行)

### 測試結果
- 測試數量：14 個
- 測試失敗：14 個（預期，因為還沒實作）

---
```

---

## 🔄 下一步

執行: `/speckit.implement WP001/task-002` (實作後端)
