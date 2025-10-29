import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { handleFileRead, handleFileWrite, handleFileSelect, handleDirectorySelect } from './fileHandlers';
import * as fs from 'fs/promises';
import { dialog } from 'electron';

jest.mock('fs/promises');
jest.mock('electron', () => ({
  dialog: {
    showOpenDialog: jest.fn(),
    showSaveDialog: jest.fn()
  }
}));

describe('File IPC Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('file:read', () => {
    it('should successfully read file content', async () => {
      // Given
      const mockContent = '{"version":"1.0","projectId":"550e8400-e29b-41d4-a716-446655440000","projectName":"測試專案"}';
      (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValue(mockContent);

      // When
      const result = await handleFileRead({ path: '/absolute/path/project.json' });

      // Then
      expect(result.content).toBe(mockContent);
      expect(result.error).toBeUndefined();
    });

    it('should return error when file does not exist', async () => {
      // Given
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';
      (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockRejectedValue(error);

      // When
      const result = await handleFileRead({ path: '/nonexistent/file.json' });

      // Then
      expect(result.content).toBeUndefined();
      expect(result.error).toBe('檔案不存在');
    });

    it('should return error when file cannot be read', async () => {
      // Given
      const error = new Error('EACCES: permission denied');
      (error as any).code = 'EACCES';
      (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockRejectedValue(error);

      // When
      const result = await handleFileRead({ path: '/restricted/file.json' });

      // Then
      expect(result.content).toBeUndefined();
      expect(result.error).toBe('無法讀取檔案');
    });

    it('should return error when path is not absolute', async () => {
      // When
      const result = await handleFileRead({ path: 'relative/path.json' });

      // Then
      expect(result.content).toBeUndefined();
      expect(result.error).toBe('必須使用絕對路徑');
    });

    it('should return error when path is empty', async () => {
      // When
      const result = await handleFileRead({ path: '' });

      // Then
      expect(result.content).toBeUndefined();
      expect(result.error).toBe('檔案路徑不能為空');
    });
  });

  describe('file:write', () => {
    it('should successfully write file content', async () => {
      // Given
      (fs.writeFile as jest.MockedFunction<typeof fs.writeFile>).mockResolvedValue();

      // When
      const result = await handleFileWrite({
        path: '/absolute/path/project.json',
        content: '{"version":"1.0","projectId":"test-id","projectName":"測試專案"}'
      });

      // Then
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error when write fails', async () => {
      // Given
      const error = new Error('EACCES: permission denied');
      (error as any).code = 'EACCES';
      (fs.writeFile as jest.MockedFunction<typeof fs.writeFile>).mockRejectedValue(error);

      // When
      const result = await handleFileWrite({
        path: '/readonly/file.json',
        content: '{"test":"data"}'
      });

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('無法寫入檔案');
    });

    it('should return error when path is not absolute', async () => {
      // When
      const result = await handleFileWrite({
        path: 'relative/path.json',
        content: '{"test":"data"}'
      });

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('必須使用絕對路徑');
    });

    it('should return error when path is empty', async () => {
      // When
      const result = await handleFileWrite({
        path: '',
        content: '{"test":"data"}'
      });

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('檔案路徑不能為空');
    });

    it('should return error when content is empty', async () => {
      // When
      const result = await handleFileWrite({
        path: '/absolute/path/project.json',
        content: ''
      });

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('內容不能為空');
    });
  });

  describe('file:select', () => {
    it('should return selected file path', async () => {
      // Given
      (dialog.showOpenDialog as jest.MockedFunction<typeof dialog.showOpenDialog>).mockResolvedValue({
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
      (dialog.showOpenDialog as jest.MockedFunction<typeof dialog.showOpenDialog>).mockResolvedValue({
        filePaths: [],
        canceled: true
      });

      // When
      const result = await handleFileSelect({});

      // Then
      expect(result.filePath).toBeUndefined();
      expect(result.canceled).toBe(true);
    });

    it('should handle optional parameters', async () => {
      // Given
      (dialog.showOpenDialog as jest.MockedFunction<typeof dialog.showOpenDialog>).mockResolvedValue({
        filePaths: ['/selected/file.json'],
        canceled: false
      });

      // When
      const result = await handleFileSelect({
        title: '選擇專案檔案',
        filters: [{ name: '專案檔案', extensions: ['json'] }],
        defaultPath: '/home/user/Documents'
      });

      // Then
      expect(result.filePath).toBe('/selected/file.json');
      expect(result.canceled).toBe(false);
      expect(dialog.showOpenDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '選擇專案檔案',
          filters: [{ name: '專案檔案', extensions: ['json'] }],
          defaultPath: '/home/user/Documents',
          properties: ['openFile']
        })
      );
    });
  });

  describe('directory:select', () => {
    it('should return selected directory path', async () => {
      // Given
      (dialog.showOpenDialog as jest.MockedFunction<typeof dialog.showOpenDialog>).mockResolvedValue({
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

    it('should return canceled when user cancels', async () => {
      // Given
      (dialog.showOpenDialog as jest.MockedFunction<typeof dialog.showOpenDialog>).mockResolvedValue({
        filePaths: [],
        canceled: true
      });

      // When
      const result = await handleDirectorySelect({});

      // Then
      expect(result.directoryPath).toBeUndefined();
      expect(result.canceled).toBe(true);
    });

    it('should handle optional parameters', async () => {
      // Given
      (dialog.showOpenDialog as jest.MockedFunction<typeof dialog.showOpenDialog>).mockResolvedValue({
        filePaths: ['/selected/directory'],
        canceled: false
      });

      // When
      const result = await handleDirectorySelect({
        title: '選擇輸出目錄',
        defaultPath: '/home/user/Documents'
      });

      // Then
      expect(result.directoryPath).toBe('/selected/directory');
      expect(result.canceled).toBe(false);
      expect(dialog.showOpenDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '選擇輸出目錄',
          defaultPath: '/home/user/Documents',
          properties: ['openDirectory']
        })
      );
    });
  });
});
