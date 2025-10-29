/**
 * ImageGenerationProgress 元件測試
 *
 * 測試範圍:
 * - 渲染進度條和進度文字
 * - 進度更新時即時顯示
 * - 顯示目前正在生成的圖片提示詞
 */

import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ImageGenerationProgress } from './ImageGenerationProgress';

describe('ImageGenerationProgress', () => {
  describe('基本渲染', () => {
    test('渲染進度條和進度文字', () => {
      // Arrange & Act
      render(
        <ImageGenerationProgress
          total={5}
          completed={0}
          progress={0}
          currentImage={null}
        />
      );

      // Assert
      const progressBar = screen.getByTestId('image-generation-progress');
      const progressText = screen.getByTestId('progress-text');

      expect(progressBar).toBeDefined();
      expect(progressText).toBeDefined();
      expect(progressText.textContent).toBe('0 / 5 張圖片已生成');
    });

    test('顯示初始進度 0%', () => {
      // Arrange & Act
      render(
        <ImageGenerationProgress
          total={5}
          completed={0}
          progress={0}
          currentImage={null}
        />
      );

      // Assert
      const progressBar = screen.getByTestId('image-generation-progress');
      expect(progressBar.getAttribute('value')).toBe('0');
    });

    test('顯示目前正在生成的圖片提示詞', () => {
      // Arrange & Act
      render(
        <ImageGenerationProgress
          total={5}
          completed={2}
          progress={40}
          currentImage="A beautiful sunset over mountains"
        />
      );

      // Assert
      const currentImageText = screen.getByTestId('current-image-text');
      expect(currentImageText.textContent).toBe('正在生成: A beautiful sunset over mountains');
    });
  });

  describe('進度更新', () => {
    test('進度更新時即時顯示', async () => {
      // Arrange
      const { rerender } = render(
        <ImageGenerationProgress
          total={5}
          completed={0}
          progress={0}
          currentImage="Image 1"
        />
      );

      // Act - 更新進度到 20%
      rerender(
        <ImageGenerationProgress
          total={5}
          completed={1}
          progress={20}
          currentImage="Image 2"
        />
      );

      // Assert
      await waitFor(() => {
        const progressText = screen.getByTestId('progress-text');
        const progressBar = screen.getByTestId('image-generation-progress');
        const currentImageText = screen.getByTestId('current-image-text');

        expect(progressText.textContent).toBe('1 / 5 張圖片已生成');
        expect(progressBar.getAttribute('value')).toBe('20');
        expect(currentImageText.textContent).toBe('正在生成: Image 2');
      });
    });

    test('進度達到 100% 時顯示完成', async () => {
      // Arrange
      const { rerender } = render(
        <ImageGenerationProgress
          total={5}
          completed={4}
          progress={80}
          currentImage="Image 5"
        />
      );

      // Act - 更新到 100%
      rerender(
        <ImageGenerationProgress
          total={5}
          completed={5}
          progress={100}
          currentImage={null}
        />
      );

      // Assert
      await waitFor(() => {
        const progressText = screen.getByTestId('progress-text');
        const progressBar = screen.getByTestId('image-generation-progress');

        expect(progressText.textContent).toBe('5 / 5 張圖片已生成');
        expect(progressBar.getAttribute('value')).toBe('100');
      });
    });
  });

  describe('邊界情況', () => {
    test('total 為 0 時正確顯示', () => {
      // Arrange & Act
      render(
        <ImageGenerationProgress
          total={0}
          completed={0}
          progress={0}
          currentImage={null}
        />
      );

      // Assert
      const progressText = screen.getByTestId('progress-text');
      expect(progressText.textContent).toBe('0 / 0 張圖片已生成');
    });

    test('currentImage 為 null 時不顯示當前圖片', () => {
      // Arrange & Act
      render(
        <ImageGenerationProgress
          total={5}
          completed={0}
          progress={0}
          currentImage={null}
        />
      );

      // Assert
      const currentImageText = screen.getByTestId('current-image-text');
      expect(currentImageText.textContent).toBe('正在生成: ');
    });

    test('進度計算正確（completed / total * 100）', () => {
      // Arrange & Act
      render(
        <ImageGenerationProgress
          total={8}
          completed={3}
          progress={37.5}
          currentImage="Image 4"
        />
      );

      // Assert
      const progressBar = screen.getByTestId('image-generation-progress');
      expect(progressBar.getAttribute('value')).toBe('37.5');
    });
  });

  describe('UI 互動', () => {
    test('快速連續更新進度不會造成渲染問題', async () => {
      // Arrange
      const { rerender } = render(
        <ImageGenerationProgress
          total={10}
          completed={0}
          progress={0}
          currentImage="Image 1"
        />
      );

      // Act - 快速連續更新 10 次
      for (let i = 1; i <= 10; i++) {
        rerender(
          <ImageGenerationProgress
            total={10}
            completed={i}
            progress={i * 10}
            currentImage={`Image ${i + 1}`}
          />
        );
      }

      // Assert
      await waitFor(() => {
        const progressText = screen.getByTestId('progress-text');
        const progressBar = screen.getByTestId('image-generation-progress');

        expect(progressText.textContent).toBe('10 / 10 張圖片已生成');
        expect(progressBar.getAttribute('value')).toBe('100');
      });
    });

    test('長提示詞不會造成 UI 溢出', () => {
      // Arrange
      const longPrompt = 'A very long prompt that contains many details about the image, including the style, mood, lighting, composition, and other artistic elements that should be rendered in the final output';

      // Act
      render(
        <ImageGenerationProgress
          total={5}
          completed={2}
          progress={40}
          currentImage={longPrompt}
        />
      );

      // Assert
      const currentImageText = screen.getByTestId('current-image-text');
      expect(currentImageText.textContent).toContain(longPrompt);
    });
  });
});
