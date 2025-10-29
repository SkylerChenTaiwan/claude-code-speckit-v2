import { test, expect, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'path';

test.describe('腳本編輯與 D-ID 設定', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../out/main/index.js')]
    });

    // Get the first window
    window = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('完整的腳本編輯流程', async () => {
    // Step 1: 進入腳本編輯頁面
    await window.click('[data-testid="script-editor-nav"]');
    await expect(window.locator('[data-testid="paragraph-list"]')).toBeVisible();

    // Step 2: 修改段落文字
    const firstParagraph = window.locator('[data-testid="paragraph-list"] > div').first();
    await firstParagraph.click();

    const textEditor = window.locator('[data-testid="paragraph-text"]');
    await textEditor.fill('這是修改後的段落內容');

    // 等待 debounce
    await window.waitForTimeout(600);

    // 驗證文字已更新
    await expect(textEditor).toHaveValue('這是修改後的段落內容');

    // Step 3: 選擇圖片風格為可愛插畫
    const styleSelector = window.locator('[data-testid="image-style-selector"]');
    await styleSelector.selectOption('cute-illustration');
    await expect(styleSelector).toHaveValue('cute-illustration');

    // Step 4: 啟用 D-ID,選擇僅開頭
    const didCheckbox = window.locator('[data-testid="did-enable"]');
    await didCheckbox.check();
    await expect(didCheckbox).toBeChecked();

    const didPosition = window.locator('[data-testid="did-position"]');
    await didPosition.selectOption('opening-only');
    await expect(didPosition).toHaveValue('opening-only');

    // Step 5: 上傳 16:9 人像圖片
    // 準備測試用圖片路徑
    const testImagePath = path.join(__dirname, '../fixtures/test-portrait-16-9.png');

    // Mock file dialog
    await window.evaluate(() => {
      // @ts-ignore
      window.electronAPI.invoke = async (channel: string, args: any) => {
        if (channel === 'file:select') {
          return {
            filePath: testImagePath,
            cancelled: false,
            size: 2 * 1024 * 1024 // 2MB
          };
        }
      };
    });

    const uploadButton = window.locator('[data-testid="upload-portrait-btn"]');
    await uploadButton.click();

    // 等待上傳完成
    await window.waitForTimeout(1000);

    // Step 6: 驗證所有設定已儲存
    await expect(textEditor).toHaveValue('這是修改後的段落內容');
    await expect(styleSelector).toHaveValue('cute-illustration');
    await expect(didCheckbox).toBeChecked();
    await expect(didPosition).toHaveValue('opening-only');

    // 驗證生成媒體按鈕可用
    const generateButton = window.locator('[data-testid="generate-media-btn"]');
    await expect(generateButton).toBeEnabled();
  });

  test('驗證段落文字不能為空', async () => {
    await window.click('[data-testid="script-editor-nav"]');

    const textEditor = window.locator('[data-testid="paragraph-text"]');
    await textEditor.clear();

    const generateButton = window.locator('[data-testid="generate-media-btn"]');
    await generateButton.click();

    // 應該顯示錯誤訊息
    await expect(window.locator('text=段落文字不能為空')).toBeVisible();
  });

  test('驗證圖片提示詞不能為空', async () => {
    await window.click('[data-testid="script-editor-nav"]');

    const promptEditor = window.locator('[data-testid="image-prompt"]');
    await promptEditor.clear();

    const generateButton = window.locator('[data-testid="generate-media-btn"]');
    await generateButton.click();

    // 應該顯示錯誤訊息
    await expect(window.locator('text=圖片提示詞不能為空')).toBeVisible();
  });

  test('驗證人像圖片 16:9 比例', async () => {
    await window.click('[data-testid="script-editor-nav"]');

    const didCheckbox = window.locator('[data-testid="did-enable"]');
    await didCheckbox.check();

    // Mock 上傳非 16:9 圖片
    await window.evaluate(() => {
      // @ts-ignore
      window.electronAPI.invoke = async (channel: string, args: any) => {
        if (channel === 'file:select') {
          return {
            filePath: '/path/to/invalid.png',
            cancelled: false,
            size: 2 * 1024 * 1024,
            dimensions: { width: 1000, height: 1000 } // 1:1 比例
          };
        }
      };
    });

    const uploadButton = window.locator('[data-testid="upload-portrait-btn"]');
    await uploadButton.click();

    // 應該顯示錯誤訊息
    await expect(window.locator('text=圖片比例必須為 16:9')).toBeVisible();
  });

  test('驗證檔案大小限制 5MB', async () => {
    await window.click('[data-testid="script-editor-nav"]');

    const didCheckbox = window.locator('[data-testid="did-enable"]');
    await didCheckbox.check();

    // Mock 上傳超過 5MB 的圖片
    await window.evaluate(() => {
      // @ts-ignore
      window.electronAPI.invoke = async (channel: string, args: any) => {
        if (channel === 'file:select') {
          return {
            filePath: '/path/to/large.png',
            cancelled: false,
            size: 6 * 1024 * 1024, // 6MB
            dimensions: { width: 1920, height: 1080 }
          };
        }
      };
    });

    const uploadButton = window.locator('[data-testid="upload-portrait-btn"]');
    await uploadButton.click();

    // 應該顯示錯誤訊息
    await expect(window.locator('text=檔案大小不能超過 5MB')).toBeVisible();
  });

  test('驗證啟用 D-ID 時必須上傳人像圖片', async () => {
    await window.click('[data-testid="script-editor-nav"]');

    const didCheckbox = window.locator('[data-testid="did-enable"]');
    await didCheckbox.check();

    const generateButton = window.locator('[data-testid="generate-media-btn"]');
    await generateButton.click();

    // 應該顯示錯誤訊息
    await expect(window.locator('text=啟用 D-ID 時必須上傳人像圖片')).toBeVisible();
  });

  test('驗證圖片風格選項', async () => {
    await window.click('[data-testid="script-editor-nav"]');

    const styleSelector = window.locator('[data-testid="image-style-selector"]');

    // 驗證所有風格選項存在
    await expect(styleSelector.locator('option[value="realistic"]')).toBeVisible();
    await expect(styleSelector.locator('option[value="cute-illustration"]')).toBeVisible();
    await expect(styleSelector.locator('option[value="chinese-classic"]')).toBeVisible();
    await expect(styleSelector.locator('option[value="children"]')).toBeVisible();

    // 測試切換風格
    await styleSelector.selectOption('chinese-classic');
    await expect(styleSelector).toHaveValue('chinese-classic');

    await styleSelector.selectOption('children');
    await expect(styleSelector).toHaveValue('children');
  });

  test('驗證 D-ID 位置選項', async () => {
    await window.click('[data-testid="script-editor-nav"]');

    const didCheckbox = window.locator('[data-testid="did-enable"]');
    await didCheckbox.check();

    const didPosition = window.locator('[data-testid="did-position"]');

    // 驗證所有位置選項存在
    await expect(didPosition.locator('option[value="none"]')).toBeVisible();
    await expect(didPosition.locator('option[value="opening-only"]')).toBeVisible();
    await expect(didPosition.locator('option[value="ending-only"]')).toBeVisible();
    await expect(didPosition.locator('option[value="both"]')).toBeVisible();

    // 測試切換位置
    await didPosition.selectOption('ending-only');
    await expect(didPosition).toHaveValue('ending-only');

    await didPosition.selectOption('both');
    await expect(didPosition).toHaveValue('both');
  });
});
