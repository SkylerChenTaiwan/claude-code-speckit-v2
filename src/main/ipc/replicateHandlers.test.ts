/**
 * replicateHandlers 測試
 *
 * 測試範圍:
 * - replicate:generateImage 成功生成圖片
 * - replicate:batchGenerate 批次生成多張圖片
 * - 生成失敗時返回詳細錯誤訊息
 */

import { ipcMain } from 'electron';
import { setupReplicateHandlers } from './replicateHandlers';
import { ReplicateService } from '../services/ReplicateService';

// Mock Electron IPC
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

jest.mock('../services/ReplicateService');

describe('replicateHandlers', () => {
  let mockReplicateService: jest.Mocked<ReplicateService>;

  beforeEach(() => {
    mockReplicateService = new ReplicateService() as jest.Mocked<ReplicateService>;
    jest.clearAllMocks();
  });

  describe('replicate:generateImage', () => {
    test('成功生成圖片', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset over mountains',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      const expectedResponse = {
        imagePath: '/path/to/output.png',
        fromCache: false,
        error: null,
      };

      mockReplicateService.generateImage = jest.fn().mockResolvedValue(expectedResponse);

      // Setup handlers
      setupReplicateHandlers();

      // Get the handler function
      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'replicate:generateImage'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockReplicateService.generateImage).toHaveBeenCalledWith(request);
    });

    test('驗證失敗時返回錯誤', async () => {
      // Arrange
      const request = {
        prompt: '',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      const expectedResponse = {
        imagePath: null,
        fromCache: false,
        error: '圖片提示詞不能為空',
      };

      mockReplicateService.generateImage = jest.fn().mockResolvedValue(expectedResponse);

      setupReplicateHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'replicate:generateImage'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result.error).toBe('圖片提示詞不能為空');
    });

    test('API 連線失敗時返回錯誤', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      const expectedResponse = {
        imagePath: null,
        fromCache: false,
        error: 'API 連線失敗',
      };

      mockReplicateService.generateImage = jest.fn().mockResolvedValue(expectedResponse);

      setupReplicateHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'replicate:generateImage'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result.error).toBe('API 連線失敗');
    });
  });

  describe('replicate:batchGenerate', () => {
    test('批次生成多張圖片', async () => {
      // Arrange
      const requests = [
        { prompt: 'Image 1', style: 'realistic', outputPath: '/path/1.png' },
        { prompt: 'Image 2', style: 'realistic', outputPath: '/path/2.png' },
        { prompt: 'Image 3', style: 'realistic', outputPath: '/path/3.png' },
      ];

      const expectedResponse = {
        results: [
          { imagePath: '/path/1.png', fromCache: false },
          { imagePath: '/path/2.png', fromCache: false },
          { imagePath: '/path/3.png', fromCache: false },
        ],
        errors: [],
      };

      mockReplicateService.batchGenerate = jest.fn().mockResolvedValue(expectedResponse);

      setupReplicateHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'replicate:batchGenerate'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, { requests, concurrency: 3 });

      // Assert
      expect(result.results).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(mockReplicateService.batchGenerate).toHaveBeenCalledWith({
        requests,
        concurrency: 3,
      });
    });

    test('批次生成時部分失敗返回詳細錯誤', async () => {
      // Arrange
      const requests = [
        { prompt: 'Image 1', style: 'realistic', outputPath: '/path/1.png' },
        { prompt: 'Image 2', style: 'realistic', outputPath: '/path/2.png' },
        { prompt: '', style: 'realistic', outputPath: '/path/3.png' },
      ];

      const expectedResponse = {
        results: [
          { imagePath: '/path/1.png', fromCache: false },
          { imagePath: '/path/2.png', fromCache: false },
        ],
        errors: [
          { paragraphId: 'para-003', error: '圖片提示詞不能為空' },
        ],
      };

      mockReplicateService.batchGenerate = jest.fn().mockResolvedValue(expectedResponse);

      setupReplicateHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'replicate:batchGenerate'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, { requests, concurrency: 3 });

      // Assert
      expect(result.results).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('圖片提示詞不能為空');
    });

    test('設定並發數量', async () => {
      // Arrange
      const requests = [
        { prompt: 'Image 1', style: 'realistic', outputPath: '/path/1.png' },
        { prompt: 'Image 2', style: 'realistic', outputPath: '/path/2.png' },
      ];

      mockReplicateService.batchGenerate = jest.fn().mockResolvedValue({
        results: [],
        errors: [],
      });

      setupReplicateHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'replicate:batchGenerate'
      );
      const handler = handleCall[1];

      // Act
      await handler(null, { requests, concurrency: 5 });

      // Assert
      expect(mockReplicateService.batchGenerate).toHaveBeenCalledWith({
        requests,
        concurrency: 5,
      });
    });
  });

  describe('錯誤處理', () => {
    test('handler 拋出異常時返回錯誤', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      mockReplicateService.generateImage = jest.fn().mockRejectedValue(
        new Error('Unexpected error')
      );

      setupReplicateHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'replicate:generateImage'
      );
      const handler = handleCall[1];

      // Act & Assert
      await expect(handler(null, request)).rejects.toThrow('Unexpected error');
    });
  });
});
