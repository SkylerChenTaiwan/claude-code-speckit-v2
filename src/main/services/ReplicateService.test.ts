/**
 * ReplicateService 測試
 *
 * 測試範圍:
 * - 生成單張圖片成功
 * - 檢查快取避免重複生成
 * - 單張圖片失敗時自動重試 2 次
 * - 批次生成控制並發數量(concurrency: 3)
 * - API 金鑰無效時返回錯誤
 * - Rate Limit 時等待後重試
 */

import { ReplicateService } from './ReplicateService';

describe('ReplicateService', () => {
  let service: ReplicateService;

  beforeEach(() => {
    service = new ReplicateService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateImage', () => {
    test('生成單張圖片成功', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset over mountains',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      // Act
      const result = await service.generateImage(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.imagePath).toBe('/path/to/output.png');
      expect(result.fromCache).toBe(false);
      expect(result.error).toBeNull();
    });

    test('檢查快取避免重複生成', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset over mountains',
        style: 'realistic',
        outputPath: '/path/to/output.png',
        cacheHash: 'abc123def456',
      };

      // 第一次生成
      await service.generateImage(request);

      // Act - 第二次使用相同的 cacheHash
      const result = await service.generateImage(request);

      // Assert
      expect(result.fromCache).toBe(true);
      expect(result.imagePath).toBe('/path/to/output.png');
    });

    test('單張圖片失敗時自動重試 2 次', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      // Mock API 前 2 次失敗，第 3 次成功
      const mockGenerate = jest.fn()
        .mockRejectedValueOnce(new Error('網路錯誤'))
        .mockRejectedValueOnce(new Error('網路錯誤'))
        .mockResolvedValueOnce({ url: 'https://example.com/image.png' });

      (service as any).replicateAPI = { run: mockGenerate };

      // Act
      const result = await service.generateImage(request);

      // Assert
      expect(mockGenerate).toHaveBeenCalledTimes(3);
      expect(result.error).toBeNull();
    });

    test('API 金鑰無效時返回錯誤', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      // Mock 401 錯誤
      const mockGenerate = jest.fn().mockRejectedValue({
        status: 401,
        message: 'Unauthorized',
      });

      (service as any).replicateAPI = { run: mockGenerate };

      // Act
      const result = await service.generateImage(request);

      // Assert
      expect(result.error).toBe('API 金鑰無效或已過期');
    });

    test('Rate Limit 時等待後重試', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      // Mock 429 錯誤後成功
      const mockGenerate = jest.fn()
        .mockRejectedValueOnce({
          status: 429,
          message: 'Too Many Requests',
        })
        .mockResolvedValueOnce({ url: 'https://example.com/image.png' });

      (service as any).replicateAPI = { run: mockGenerate };

      // Act
      const result = await service.generateImage(request);

      // Assert
      expect(mockGenerate).toHaveBeenCalledTimes(2);
      expect(result.error).toBe('API 請求過於頻繁');
    });

    test('生成失敗後返回錯誤訊息', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      // Mock API 持續失敗
      const mockGenerate = jest.fn().mockRejectedValue(new Error('API Error'));
      (service as any).replicateAPI = { run: mockGenerate };

      // Act
      const result = await service.generateImage(request);

      // Assert
      expect(result.error).toBe('圖片生成失敗');
    });
  });

  describe('batchGenerate', () => {
    test('批次生成控制並發數量(concurrency: 3)', async () => {
      // Arrange
      const requests = [
        { prompt: 'Image 1', style: 'realistic', outputPath: '/path/1.png' },
        { prompt: 'Image 2', style: 'realistic', outputPath: '/path/2.png' },
        { prompt: 'Image 3', style: 'realistic', outputPath: '/path/3.png' },
        { prompt: 'Image 4', style: 'realistic', outputPath: '/path/4.png' },
        { prompt: 'Image 5', style: 'realistic', outputPath: '/path/5.png' },
      ];

      let concurrentCount = 0;
      let maxConcurrent = 0;

      const mockGenerate = jest.fn().mockImplementation(async () => {
        concurrentCount++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCount);

        // 模擬 API 延遲
        await new Promise(resolve => setTimeout(resolve, 100));

        concurrentCount--;
        return { url: 'https://example.com/image.png' };
      });

      (service as any).replicateAPI = { run: mockGenerate };

      // Act
      await service.batchGenerate({ requests, concurrency: 3 });

      // Assert
      expect(maxConcurrent).toBeLessThanOrEqual(3);
      expect(mockGenerate).toHaveBeenCalledTimes(5);
    });

    test('批次生成返回所有結果', async () => {
      // Arrange
      const requests = [
        { prompt: 'Image 1', style: 'realistic', outputPath: '/path/1.png' },
        { prompt: 'Image 2', style: 'realistic', outputPath: '/path/2.png' },
      ];

      // Act
      const result = await service.batchGenerate({ requests, concurrency: 3 });

      // Assert
      expect(result.results).toHaveLength(2);
      expect(result.results[0].imagePath).toBe('/path/1.png');
      expect(result.results[1].imagePath).toBe('/path/2.png');
    });

    test('批次生成時部分失敗仍返回成功的結果', async () => {
      // Arrange
      const requests = [
        { prompt: 'Image 1', style: 'realistic', outputPath: '/path/1.png' },
        { prompt: 'Image 2', style: 'realistic', outputPath: '/path/2.png' },
        { prompt: 'Image 3', style: 'realistic', outputPath: '/path/3.png' },
      ];

      const mockGenerate = jest.fn()
        .mockResolvedValueOnce({ url: 'https://example.com/1.png' })
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({ url: 'https://example.com/3.png' });

      (service as any).replicateAPI = { run: mockGenerate };

      // Act
      const result = await service.batchGenerate({ requests, concurrency: 3 });

      // Assert
      expect(result.results).toHaveLength(2); // 2 個成功
      expect(result.errors).toHaveLength(1); // 1 個失敗
      expect(result.errors[0].error).toBe('圖片生成失敗');
    });
  });

  describe('驗證規則', () => {
    test('prompt 為空時返回錯誤', async () => {
      // Arrange
      const request = {
        prompt: '',
        style: 'realistic',
        outputPath: '/path/to/output.png',
      };

      // Act
      const result = await service.generateImage(request);

      // Assert
      expect(result.error).toBe('圖片提示詞不能為空');
    });

    test('無效的圖片風格時返回錯誤', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset',
        style: 'invalid-style',
        outputPath: '/path/to/output.png',
      };

      // Act
      const result = await service.generateImage(request);

      // Assert
      expect(result.error).toBe('無效的圖片風格');
    });

    test('outputPath 為空時返回錯誤', async () => {
      // Arrange
      const request = {
        prompt: 'A beautiful sunset',
        style: 'realistic',
        outputPath: '',
      };

      // Act
      const result = await service.generateImage(request);

      // Assert
      expect(result.error).toBe('輸出路徑不能為空');
    });
  });
});
