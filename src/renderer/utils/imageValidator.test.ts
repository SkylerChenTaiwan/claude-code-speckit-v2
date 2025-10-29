import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateImageAspectRatio, validateImageFileSize } from './imageValidator';

describe('imageValidator', () => {
  describe('validateImageAspectRatio', () => {
    it('應該驗證 16:9 比例的圖片', async () => {
      // Mock image with 1920x1080 (16:9)
      const mockImage = {
        width: 1920,
        height: 1080
      };

      const result = await validateImageAspectRatio('/path/to/image.png', mockImage);
      expect(result).toBe(true);
    });

    it('應該拒絕非 16:9 比例的圖片', async () => {
      // Mock image with 1000x1000 (1:1)
      const mockImage = {
        width: 1000,
        height: 1000
      };

      const result = await validateImageAspectRatio('/path/to/image.png', mockImage);
      expect(result).toBe(false);
    });

    it('應該允許 3840x2160 (4K 16:9)', async () => {
      const mockImage = {
        width: 3840,
        height: 2160
      };

      const result = await validateImageAspectRatio('/path/to/image.png', mockImage);
      expect(result).toBe(true);
    });

    it('應該允許 1280x720 (HD 16:9)', async () => {
      const mockImage = {
        width: 1280,
        height: 720
      };

      const result = await validateImageAspectRatio('/path/to/image.png', mockImage);
      expect(result).toBe(true);
    });
  });

  describe('validateImageFileSize', () => {
    it('應該允許小於 5MB 的檔案', () => {
      const fileSize = 4 * 1024 * 1024; // 4MB
      const result = validateImageFileSize(fileSize);
      expect(result).toBe(true);
    });

    it('應該允許剛好 5MB 的檔案', () => {
      const fileSize = 5 * 1024 * 1024; // 5MB
      const result = validateImageFileSize(fileSize);
      expect(result).toBe(true);
    });

    it('應該拒絕超過 5MB 的檔案', () => {
      const fileSize = 6 * 1024 * 1024; // 6MB
      const result = validateImageFileSize(fileSize);
      expect(result).toBe(false);
    });

    it('應該拒絕 10MB 的檔案', () => {
      const fileSize = 10 * 1024 * 1024; // 10MB
      const result = validateImageFileSize(fileSize);
      expect(result).toBe(false);
    });

    it('應該允許 1KB 的檔案', () => {
      const fileSize = 1024; // 1KB
      const result = validateImageFileSize(fileSize);
      expect(result).toBe(true);
    });
  });
});
