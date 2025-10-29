/**
 * didHandlers 測試
 *
 * 測試範圍:
 * - did:generateVideo 成功生成影片
 * - 生成失敗時返回詳細錯誤訊息
 * - 驗證失敗時返回錯誤
 * - API 連線失敗時返回錯誤
 */

import { ipcMain } from 'electron';
import { setupDIDHandlers } from './didHandlers';
import { DIDService } from '../services/DIDService';

// Mock Electron IPC
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

jest.mock('../services/DIDService');

describe('didHandlers', () => {
  let mockDIDService: jest.Mocked<DIDService>;

  beforeEach(() => {
    mockDIDService = new DIDService() as jest.Mocked<DIDService>;
    jest.clearAllMocks();
  });

  describe('did:generateVideo', () => {
    test('成功生成影片', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      const expectedResponse = {
        videoPath: '/path/to/output.mp4',
        duration: 5.2,
        error: null,
      };

      mockDIDService.generateVideo = jest.fn().mockResolvedValue(expectedResponse);

      // Setup handlers
      setupDIDHandlers();

      // Get the handler function
      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockDIDService.generateVideo).toHaveBeenCalledWith(request);
    });

    test('成功生成影片（含時間區間）', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        startTime: 0,
        endTime: 5.2,
        outputPath: '/path/to/output.mp4',
      };

      const expectedResponse = {
        videoPath: '/path/to/output.mp4',
        duration: 5.2,
        error: null,
      };

      mockDIDService.generateVideo = jest.fn().mockResolvedValue(expectedResponse);

      setupDIDHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockDIDService.generateVideo).toHaveBeenCalledWith(request);
    });

    test('驗證失敗時返回錯誤 - portraitImagePath 為空', async () => {
      // Arrange
      const request = {
        portraitImagePath: '',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      const expectedResponse = {
        videoPath: null,
        duration: 0,
        error: '人像圖片路徑不能為空',
      };

      mockDIDService.generateVideo = jest.fn().mockResolvedValue(expectedResponse);

      setupDIDHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result.error).toBe('人像圖片路徑不能為空');
    });

    test('驗證失敗時返回錯誤 - audioPath 為空', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '',
        outputPath: '/path/to/output.mp4',
      };

      const expectedResponse = {
        videoPath: null,
        duration: 0,
        error: '音檔路徑不能為空',
      };

      mockDIDService.generateVideo = jest.fn().mockResolvedValue(expectedResponse);

      setupDIDHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result.error).toBe('音檔路徑不能為空');
    });

    test('驗證失敗時返回錯誤 - outputPath 為空', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '',
      };

      const expectedResponse = {
        videoPath: null,
        duration: 0,
        error: '輸出路徑不能為空',
      };

      mockDIDService.generateVideo = jest.fn().mockResolvedValue(expectedResponse);

      setupDIDHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result.error).toBe('輸出路徑不能為空');
    });

    test('API 連線失敗時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      const expectedResponse = {
        videoPath: null,
        duration: 0,
        error: 'API 連線失敗',
      };

      mockDIDService.generateVideo = jest.fn().mockResolvedValue(expectedResponse);

      setupDIDHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result.error).toBe('API 連線失敗');
    });

    test('API 金鑰無效時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      const expectedResponse = {
        videoPath: null,
        duration: 0,
        error: 'API 金鑰無效或已過期',
      };

      mockDIDService.generateVideo = jest.fn().mockResolvedValue(expectedResponse);

      setupDIDHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result.error).toBe('API 金鑰無效或已過期');
    });

    test('生成失敗時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      const expectedResponse = {
        videoPath: null,
        duration: 0,
        error: '生成失敗',
      };

      mockDIDService.generateVideo = jest.fn().mockResolvedValue(expectedResponse);

      setupDIDHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act
      const result = await handler(null, request);

      // Assert
      expect(result.error).toBe('生成失敗');
    });
  });

  describe('錯誤處理', () => {
    test('handler 拋出異常時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      mockDIDService.generateVideo = jest.fn().mockRejectedValue(
        new Error('Unexpected error')
      );

      setupDIDHandlers();

      const handleCall = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'did:generateVideo'
      );
      const handler = handleCall[1];

      // Act & Assert
      await expect(handler(null, request)).rejects.toThrow('Unexpected error');
    });
  });
});
