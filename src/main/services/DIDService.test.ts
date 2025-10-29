/**
 * DIDService 測試
 *
 * 測試範圍:
 * - 生成對嘴影片成功
 * - API 金鑰無效時返回錯誤
 * - 生成失敗時提供重試選項
 * - 驗證必填欄位(portraitImagePath, audioPath, outputPath)
 * - API 連線失敗錯誤處理
 * - 生成失敗錯誤處理
 */

import { DIDService } from './DIDService';

describe('DIDService', () => {
  let service: DIDService;

  beforeEach(() => {
    service = new DIDService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateVideo', () => {
    test('生成對嘴影片成功', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.videoPath).toBe('/path/to/output.mp4');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.error).toBeNull();
    });

    test('生成對嘴影片成功（含時間區間）', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        startTime: 0,
        endTime: 5.2,
        outputPath: '/path/to/output.mp4',
      };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.videoPath).toBe('/path/to/output.mp4');
      expect(result.duration).toBe(5.2);
      expect(result.error).toBeNull();
    });

    test('API 金鑰無效時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      // Mock 401 錯誤
      const mockAPI = jest.fn().mockRejectedValue({
        status: 401,
        message: 'Unauthorized',
      });

      (service as any).didAPI = { createVideo: mockAPI };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(result.error).toBe('API 金鑰無效或已過期');
    });

    test('API 連線失敗時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      // Mock 網路錯誤
      const mockAPI = jest.fn().mockRejectedValue(new Error('Network Error'));

      (service as any).didAPI = { createVideo: mockAPI };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(result.error).toBe('API 連線失敗');
    });

    test('生成失敗時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      // Mock API 返回失敗狀態
      const mockAPI = jest.fn().mockResolvedValue({
        status: 'failed',
        error: 'Processing error',
      });

      (service as any).didAPI = { createVideo: mockAPI };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(result.error).toBe('生成失敗');
    });

    test('生成失敗時自動重試 2 次', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      // Mock API 前 2 次失敗，第 3 次成功
      const mockAPI = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary Error'))
        .mockRejectedValueOnce(new Error('Temporary Error'))
        .mockResolvedValueOnce({
          status: 'completed',
          videoUrl: 'https://example.com/video.mp4',
          duration: 5.2,
        });

      (service as any).didAPI = { createVideo: mockAPI };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(mockAPI).toHaveBeenCalledTimes(3);
      expect(result.error).toBeNull();
      expect(result.videoPath).toBe('/path/to/output.mp4');
    });
  });

  describe('驗證規則', () => {
    test('portraitImagePath 為空時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '',
        audioPath: '/path/to/audio.mp3',
        outputPath: '/path/to/output.mp4',
      };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(result.error).toBe('人像圖片路徑不能為空');
    });

    test('audioPath 為空時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '',
        outputPath: '/path/to/output.mp4',
      };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(result.error).toBe('音檔路徑不能為空');
    });

    test('outputPath 為空時返回錯誤', async () => {
      // Arrange
      const request = {
        portraitImagePath: '/path/to/portrait.jpg',
        audioPath: '/path/to/audio.mp3',
        outputPath: '',
      };

      // Act
      const result = await service.generateVideo(request);

      // Assert
      expect(result.error).toBe('輸出路徑不能為空');
    });
  });
});
