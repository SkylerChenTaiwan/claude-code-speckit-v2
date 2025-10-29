import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScriptEditorPage from './ScriptEditorPage';

// Mock electron API
const mockInvoke = vi.fn();
vi.mock('@electron-toolkit/preload', () => ({
  electronAPI: {
    invoke: mockInvoke
  }
}));

describe('ScriptEditorPage', () => {
  const mockParagraphs = [
    {
      paragraphId: 'para-001',
      text: '歡迎來到我的頻道,今天要分享...',
      startTime: 0.0,
      endTime: 5.2,
      imagePrompt: 'A modern YouTube channel banner with colorful background',
      imagePromptZh: '一個色彩繽紛的現代 YouTube 頻道橫幅'
    },
    {
      paragraphId: 'para-002',
      text: '首先讓我們來看看...',
      startTime: 5.2,
      endTime: 10.5,
      imagePrompt: 'A person pointing at a presentation screen',
      imagePromptZh: '一個人指著演示螢幕'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染測試', () => {
    it('應該渲染所有段落列表', () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const paragraphList = screen.getByTestId('paragraph-list');
      expect(paragraphList).toBeInTheDocument();

      // 檢查是否顯示所有段落
      expect(screen.getByText('歡迎來到我的頻道,今天要分享...')).toBeInTheDocument();
      expect(screen.getByText('首先讓我們來看看...')).toBeInTheDocument();
    });

    it('應該顯示段落文字編輯器', () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const textEditor = screen.getByTestId('paragraph-text');
      expect(textEditor).toBeInTheDocument();
      expect(textEditor).toHaveAttribute('placeholder', '編輯段落文字...');
    });

    it('應該顯示圖片提示詞編輯器', () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const promptEditor = screen.getByTestId('image-prompt');
      expect(promptEditor).toBeInTheDocument();
      expect(promptEditor).toHaveAttribute('placeholder', '編輯圖片提示詞...');
    });

    it('應該顯示圖片風格選擇器', () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const styleSelector = screen.getByTestId('image-style-selector');
      expect(styleSelector).toBeInTheDocument();

      // 檢查所有風格選項
      expect(screen.getByRole('option', { name: 'realistic' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'cute-illustration' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'chinese-classic' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'children' })).toBeInTheDocument();
    });

    it('應該顯示 D-ID 設定面板', () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const didCheckbox = screen.getByTestId('did-enable');
      expect(didCheckbox).toBeInTheDocument();
      expect(screen.getByText('啟用 D-ID 對嘴功能')).toBeInTheDocument();

      const didPosition = screen.getByTestId('did-position');
      expect(didPosition).toBeInTheDocument();
    });
  });

  describe('互動測試', () => {
    it('點擊段落應該切換到該段落編輯', async () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const secondParagraph = screen.getByText('首先讓我們來看看...');
      await userEvent.click(secondParagraph);

      const textEditor = screen.getByTestId('paragraph-text');
      expect(textEditor).toHaveValue('首先讓我們來看看...');
    });

    it('編輯段落文字應該即時儲存(debounce)', async () => {
      vi.useFakeTimers();

      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const textEditor = screen.getByTestId('paragraph-text');
      await userEvent.clear(textEditor);
      await userEvent.type(textEditor, '新的段落內容');

      // Debounce 500ms
      vi.advanceTimersByTime(500);

      await waitFor(() => {
        expect(textEditor).toHaveValue('新的段落內容');
      });

      vi.useRealTimers();
    });

    it('選擇圖片風格應該更新 projectStore', async () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const styleSelector = screen.getByTestId('image-style-selector');
      await userEvent.selectOptions(styleSelector, 'cute-illustration');

      expect(styleSelector).toHaveValue('cute-illustration');
    });

    it('啟用 D-ID 時應該顯示人像上傳介面', async () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const didCheckbox = screen.getByTestId('did-enable');
      await userEvent.click(didCheckbox);

      const uploadButton = screen.getByTestId('upload-portrait-btn');
      expect(uploadButton).toBeVisible();
      expect(screen.getByText('上傳人像圖片')).toBeInTheDocument();
    });

    it('點擊上傳人像圖片應該呼叫 file:select', async () => {
      mockInvoke.mockResolvedValue({ filePath: '/path/to/portrait.png', cancelled: false });

      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const didCheckbox = screen.getByTestId('did-enable');
      await userEvent.click(didCheckbox);

      const uploadButton = screen.getByTestId('upload-portrait-btn');
      await userEvent.click(uploadButton);

      expect(mockInvoke).toHaveBeenCalledWith('file:select', {
        title: '選擇人像圖片',
        filters: [
          {
            name: '圖片檔案',
            extensions: ['png', 'jpg', 'jpeg']
          }
        ]
      });
    });
  });

  describe('驗證測試', () => {
    it('段落文字為空時應該顯示錯誤訊息', async () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const textEditor = screen.getByTestId('paragraph-text');
      await userEvent.clear(textEditor);

      const generateButton = screen.getByTestId('generate-media-btn');
      await userEvent.click(generateButton);

      expect(await screen.findByText('段落文字不能為空')).toBeInTheDocument();
    });

    it('圖片提示詞為空時應該顯示錯誤訊息', async () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const promptEditor = screen.getByTestId('image-prompt');
      await userEvent.clear(promptEditor);

      const generateButton = screen.getByTestId('generate-media-btn');
      await userEvent.click(generateButton);

      expect(await screen.findByText('圖片提示詞不能為空')).toBeInTheDocument();
    });

    it('上傳非 16:9 比例圖片應該顯示錯誤訊息', async () => {
      // Mock image validator to return false
      mockInvoke.mockResolvedValue({ filePath: '/path/to/invalid.png', cancelled: false });

      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const didCheckbox = screen.getByTestId('did-enable');
      await userEvent.click(didCheckbox);

      const uploadButton = screen.getByTestId('upload-portrait-btn');
      await userEvent.click(uploadButton);

      expect(await screen.findByText('圖片比例必須為 16:9')).toBeInTheDocument();
    });

    it('上傳超過 5MB 的圖片應該顯示錯誤訊息', async () => {
      mockInvoke.mockResolvedValue({
        filePath: '/path/to/large.png',
        cancelled: false,
        size: 6 * 1024 * 1024 // 6MB
      });

      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const didCheckbox = screen.getByTestId('did-enable');
      await userEvent.click(didCheckbox);

      const uploadButton = screen.getByTestId('upload-portrait-btn');
      await userEvent.click(uploadButton);

      expect(await screen.findByText('檔案大小不能超過 5MB')).toBeInTheDocument();
    });

    it('啟用 D-ID 但未上傳人像圖片時應該顯示錯誤訊息', async () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const didCheckbox = screen.getByTestId('did-enable');
      await userEvent.click(didCheckbox);

      const generateButton = screen.getByTestId('generate-media-btn');
      await userEvent.click(generateButton);

      expect(await screen.findByText('啟用 D-ID 時必須上傳人像圖片')).toBeInTheDocument();
    });

    it('所有段落提示詞不為空才能生成媒體', async () => {
      const paragraphsWithEmptyPrompt = [
        ...mockParagraphs,
        {
          paragraphId: 'para-003',
          text: '第三段落',
          startTime: 10.5,
          endTime: 15.0,
          imagePrompt: '', // 空提示詞
          imagePromptZh: ''
        }
      ];

      render(<ScriptEditorPage paragraphs={paragraphsWithEmptyPrompt} />);

      const generateButton = screen.getByTestId('generate-media-btn');
      expect(generateButton).toBeDisabled();
    });
  });

  describe('D-ID 位置選擇測試', () => {
    it('應該能選擇 D-ID 位置', async () => {
      render(<ScriptEditorPage paragraphs={mockParagraphs} />);

      const didCheckbox = screen.getByTestId('did-enable');
      await userEvent.click(didCheckbox);

      const didPosition = screen.getByTestId('did-position');

      // 檢查所有位置選項
      expect(screen.getByRole('option', { name: 'none' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'opening-only' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'ending-only' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'both' })).toBeInTheDocument();

      await userEvent.selectOptions(didPosition, 'opening-only');
      expect(didPosition).toHaveValue('opening-only');
    });
  });
});
