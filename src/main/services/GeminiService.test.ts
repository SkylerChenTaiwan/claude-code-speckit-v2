/**
 * GeminiService 測試
 * 根據 contract-expected.yaml 定義的契約撰寫測試
 */

describe('GeminiService', () => {
  describe('generateScript', () => {
    it('成功呼叫 Gemini API 並返回結構化腳本', async () => {
      // Arrange
      const scriptContent = '這是一段測試文稿內容，用來測試 Gemini 腳本生成功能。包含多個段落，每個段落都需要生成對應的圖片提示詞。';
      const timecodes = [
        { text: '這是一段測試文稿內容', startTime: 0, endTime: 2.5 },
        { text: '用來測試 Gemini 腳本生成功能', startTime: 2.5, endTime: 5.0 },
        { text: '包含多個段落', startTime: 5.0, endTime: 6.5 },
        { text: '每個段落都需要生成對應的圖片提示詞', startTime: 6.5, endTime: 9.0 }
      ];

      // Act
      // 預期：呼叫 GeminiService.generateScript() 會返回結構化腳本

      // Assert
      // 預期返回格式：
      // {
      //   paragraphs: Array<ScriptParagraph>,
      //   usageMetadata: { promptTokens: number, responseTokens: number, totalTokens: number }
      // }
      //
      // 每個 ScriptParagraph 包含：
      // - paragraphId: string (如 "para-001")
      // - text: string
      // - startTime: number
      // - endTime: number
      // - imagePrompt: string (英文圖片提示詞)
      // - imagePromptZh: string (中文圖片提示詞)

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('可以使用自訂 system prompt', async () => {
      // Arrange
      const scriptContent = '測試文稿內容';
      const timecodes = [
        { text: '測試文稿內容', startTime: 0, endTime: 2.0 }
      ];
      const customSystemPrompt = '你是一個專業的腳本生成器，請根據文稿內容生成結構化腳本。';

      // Act
      // 預期：使用自訂的 system prompt 呼叫 Gemini API

      // Assert
      // 預期返回的腳本使用了自訂 prompt 的風格

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('API 金鑰無效時拋出正確的錯誤訊息', async () => {
      // Arrange
      const scriptContent = '測試文稿';
      const timecodes = [
        { text: '測試文稿', startTime: 0, endTime: 1.0 }
      ];

      // Act & Assert
      // 預期錯誤訊息必須完全一致：「API 金鑰無效」

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('網路連線失敗時拋出正確的錯誤訊息', async () => {
      // Arrange
      const scriptContent = '測試文稿';
      const timecodes = [
        { text: '測試文稿', startTime: 0, endTime: 1.0 }
      ];

      // Act & Assert
      // 預期錯誤訊息必須完全一致：「網路連線失敗,請檢查您的網路連線後重試」

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('Gemini 服務錯誤時拋出正確的錯誤訊息', async () => {
      // Arrange
      const scriptContent = '測試文稿';
      const timecodes = [
        { text: '測試文稿', startTime: 0, endTime: 1.0 }
      ];

      // Act & Assert
      // 預期錯誤訊息必須完全一致：「Gemini 服務暫時無法使用,請稍後再試」

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('返回的段落資料格式正確', async () => {
      // Arrange
      const scriptContent = '第一段內容。第二段內容。第三段內容。';
      const timecodes = [
        { text: '第一段內容', startTime: 0, endTime: 1.5 },
        { text: '第二段內容', startTime: 1.5, endTime: 3.0 },
        { text: '第三段內容', startTime: 3.0, endTime: 4.5 }
      ];

      // Act

      // Assert
      // 預期每個段落包含：
      // - paragraphId: string (格式如 "para-001", "para-002")
      // - text: string
      // - startTime: number
      // - endTime: number
      // - imagePrompt: string (非空字串)
      // - imagePromptZh: string (可選)
      //
      // 驗證：
      // - endTime > startTime
      // - paragraphId 格式正確且唯一
      // - imagePrompt 為英文
      // - 所有必填欄位都存在

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('正確處理多段落腳本（10+ 段）', async () => {
      // Arrange
      const scriptContent = '段落1。段落2。段落3。段落4。段落5。段落6。段落7。段落8。段落9。段落10。段落11。';
      const timecodes = Array.from({ length: 11 }, (_, i) => ({
        text: `段落${i + 1}`,
        startTime: i * 1.0,
        endTime: (i + 1) * 1.0
      }));

      // Act

      // Assert
      // 預期返回 11 個段落
      // 每個段落都有對應的圖片提示詞
      // paragraphId 正確編號 (para-001 到 para-011)

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('圖片提示詞為英文且有意義', async () => {
      // Arrange
      const scriptContent = '一隻可愛的貓咪在陽光下玩耍。';
      const timecodes = [
        { text: '一隻可愛的貓咪在陽光下玩耍', startTime: 0, endTime: 2.0 }
      ];

      // Act

      // Assert
      // 預期 imagePrompt 為英文
      // 預期 imagePrompt 與文稿內容相關
      // 預期 imagePromptZh 為中文（如果存在）

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('返回正確的使用量統計', async () => {
      // Arrange
      const scriptContent = '測試文稿內容';
      const timecodes = [
        { text: '測試文稿內容', startTime: 0, endTime: 1.5 }
      ];

      // Act

      // Assert
      // 預期返回 usageMetadata 包含：
      // - promptTokens: number (> 0)
      // - responseTokens: number (> 0)
      // - totalTokens: number (= promptTokens + responseTokens)

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });
  });

  describe('parseGeminiResponse', () => {
    it('正確解析 Gemini JSON 回應', async () => {
      // Arrange
      const mockResponse = {
        paragraphs: [
          {
            paragraphId: 'para-001',
            text: '測試段落',
            startTime: 0,
            endTime: 2.0,
            imagePrompt: 'a cute cat playing in the sunshine',
            imagePromptZh: '一隻可愛的貓咪在陽光下玩耍'
          }
        ]
      };

      // Act
      // 預期：parseGeminiResponse 可以正確解析並驗證回應格式

      // Assert
      // 驗證所有欄位名稱與 contract-expected.yaml 一致

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('拒絕格式錯誤的回應（缺少必填欄位）', async () => {
      // Arrange
      const invalidResponse = {
        paragraphs: [
          {
            paragraphId: 'para-001',
            text: '測試段落'
            // 缺少 startTime, endTime, imagePrompt
          }
        ]
      };

      // Act & Assert
      // 預期拋出驗證錯誤

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });

    it('拒絕格式錯誤的回應（欄位型別錯誤）', async () => {
      // Arrange
      const invalidResponse = {
        paragraphs: [
          {
            paragraphId: 'para-001',
            text: '測試段落',
            startTime: '0', // 應該是 number，不是 string
            endTime: 2.0,
            imagePrompt: 'test prompt'
          }
        ]
      };

      // Act & Assert
      // 預期拋出型別錯誤

      expect(true).toBe(false); // 強制失敗 - TDD Red
    });
  });
});
