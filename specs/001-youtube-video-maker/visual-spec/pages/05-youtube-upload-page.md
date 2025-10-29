# YouTube 上傳頁面 (YouTube Upload Page)

## 頁面概述

完成 YouTube OAuth 2.0 認證,填寫影片資訊,上傳自訂縮圖,並設定排程發布時間。

## 頁面佈局

```
┌─────────────────────────────────────────────────────────────┐
│  ① 文稿輸入 → ② 腳本編輯 → ③ 影片預覽 → ④ YouTube 上傳     │
│  已完成       已完成       已完成       進行中               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  YouTube 上傳                                 [儲存專案] [✕]  │
│  填寫影片資訊並上傳到 YouTube                                │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  YouTube 帳號                                          │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ ✓ 已登入: user@example.com               [登出] │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                         │  │
│  │  頻道                                                   │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ 我的頻道 (123,456 訂閱者)                      ▼  │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  影片資訊                                               │  │
│  │                                                         │  │
│  │  標題 *                                                 │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ 我的影片標題                                      │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  0 / 100 字                                            │  │
│  │                                                         │  │
│  │  描述                                                   │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ 這是我的影片描述...                               │ │  │
│  │  │                                                    │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  0 / 5000 字                                           │  │
│  │                                                         │  │
│  │  標籤 (以逗號分隔)                                      │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ 教學, 科技, 產品介紹                               │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  已輸入 3 個標籤                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────┐ ┌──────────────────────────────────┐    │
│  │ 縮圖            │ │ 隱私與設定                        │    │
│  ├────────────────┤ ├──────────────────────────────────┤    │
│  │ [縮圖預覽]     │ │ 隱私設定 *                        │    │
│  │                │ │ ◉ 公開                            │    │
│  │ [上傳自訂縮圖] │ │ ○ 不公開                          │    │
│  └────────────────┘ │ ○ 私人                            │    │
│                      │                                  │    │
│                      │ 分類                             │    │
│                      │ ▼ 教育                           │    │
│                      │                                  │    │
│                      │ 排程發布                          │    │
│                      │ □ 啟用排程發布                   │    │
│                      │ 日期: [2025-10-30] 時間: [10:00]│    │
│                      └──────────────────────────────────┘    │
│                                                               │
│                                          [取消] [上傳影片 →]  │
└─────────────────────────────────────────────────────────────┘
```

## 元件規格

### 1. 進度指示器
- 使用共用元件 Stepper
- 目前步驟: ④ YouTube 上傳 (進行中)
- 總共 4 個步驟

### 2. 頁面標題區
```
內邊距: 32px
```

**標題**
- 文字: "YouTube 上傳"
- 字型: Heading 1 (24px, #37352F)
- 字重: 600

**說明**
- 文字: "填寫影片資訊並上傳到 YouTube"
- 字型: Body Regular (14px, #9B9A97)
- 上方間距: 8px

**右側按鈕**
- [儲存專案]: Secondary Button
- [✕ 關閉]: Text Button,返回首頁

### 3. YouTube 帳號區塊

**卡片容器**
```
背景: #FFFFFF
邊框: 1px solid #E9E9E7
圓角: 8px
內邊距: 24px
陰影: Card
```

**標題**
- 文字: "YouTube 帳號"
- 字型: Heading 3 (16px, #37352F)
- 字重: 600

**未登入狀態**
```
上方間距: 16px
```

**提示訊息**
```
背景: #E8F3F8
文字: #0B6E99
圓角: 6px
內邊距: 12px 16px
字型: Body Regular (14px)
Icon: ℹ
```

提示內容:
```
請先登入您的 YouTube 帳號以上傳影片
```

**[登入 YouTube] 按鈕**
```
上方間距: 12px
樣式: Primary Button
文字: "登入 YouTube"
Icon: YouTube 圖示 (左側)
```

**已登入狀態**
```
上方間距: 16px
```

**狀態顯示容器**
```
背景: #E8F5F1
邊框: 1px solid #0F7B6C
圓角: 6px
內邊距: 12px 16px
佈局: 水平 (左右對齊)
```

**左側 - 登入資訊**
```
佈局: 水平 (圖示 + 文字)
間距: 8px
```

**成功圖示**
- Icon: ✓
- 顏色: #0F7B6C
- 大小: 20px

**帳號顯示**
- 格式: "已登入: {email}"
- 字型: Body Regular (14px, #0F7B6C)
- 字重: 500

**右側 - 登出按鈕**
```
樣式: Text Button
文字: "登出"
顏色: #787774
```

**頻道選擇**
```
上方間距: 16px
```

**標籤**
- 文字: "頻道"
- 字型: Body Regular (14px, #37352F)

**下拉選單**
```
上方間距: 8px
使用共用元件 Dropdown
```

**選項格式**:
- "{頻道名稱} ({訂閱者數} 訂閱者)"
- 範例: "我的頻道 (123,456 訂閱者)"

### 4. 影片資訊區塊

**卡片容器** (同 YouTube 帳號區塊樣式)

**標題**
- 文字: "影片資訊"
- 字型: Heading 3 (16px, #37352F)
- 字重: 600

**影片標題輸入**
```
上方間距: 16px
```

**標籤**
- 文字: "標題 *"
- 字型: Body Regular (14px, #37352F)
- 必填標記: * (紅色)

**文字輸入框**
```
上方間距: 8px
寬度: 100%
高度: 36px
最大長度: 100
佔位符: "輸入影片標題"
```

**字數統計**
```
上方間距: 6px
字型: Caption (12px, #9B9A97)
格式: "{目前字數} / 100 字"
```

**影片描述輸入**
```
上方間距: 20px
```

**標籤**
- 文字: "描述"
- 字型: Body Regular (14px, #37352F)

**多行文字輸入框 (Textarea)**
```
上方間距: 8px
寬度: 100%
最小高度: 120px
最大長度: 5000
佔位符: "輸入影片描述 (可選)"
可調整大小: 垂直
```

**字數統計**
```
上方間距: 6px
字型: Caption (12px, #9B9A97)
格式: "{目前字數} / 5000 字"
```

**標籤輸入**
```
上方間距: 20px
```

**標籤**
- 文字: "標籤 (以逗號分隔)"
- 字型: Body Regular (14px, #37352F)

**文字輸入框**
```
上方間距: 8px
寬度: 100%
高度: 36px
佔位符: "例如: 教學, 科技, 產品介紹"
```

**標籤數統計**
```
上方間距: 6px
字型: Caption (12px, #9B9A97)
格式: "已輸入 {標籤數} 個標籤"
```

**提示說明**
```
上方間距: 4px
字型: Caption (12px, #9B9A97)
```

說明文字:
```
標籤有助於觀眾找到您的影片,建議使用 3-10 個相關標籤
```

### 5. 縮圖面板

**容器**
```
背景: #FFFFFF
邊框: 1px solid #E9E9E7
圓角: 8px
內邊距: 20px
陰影: Card
```

**標題**
- 文字: "縮圖"
- 字型: Heading 3 (16px, #37352F)
- 字重: 600

**縮圖預覽** (未上傳時)
```
上方間距: 16px
寬度: 100%
寬高比: 16:9
背景: #F7F6F3
邊框: 2px dashed #E9E9E7
圓角: 6px
佈局: 置中
```

**佔位內容**
```
顯示: 圖示 + 文字 (垂直排列)
```

**圖示**
- Icon: 🖼️
- 大小: 48px
- 顏色: #C7C7C5

**文字**
- 內容: "尚未上傳縮圖"
- 字型: Body Small (13px, #9B9A97)

**縮圖預覽** (已上傳時)
```
上方間距: 16px
寬度: 100%
寬高比: 16:9
圓角: 6px
物件適配: cover
```

**移除按鈕** (覆蓋在右上角)
```
位置: 絕對定位 (右上角)
樣式: Text Button
Icon: ✕
背景: rgba(0, 0, 0, 0.5)
文字: #FFFFFF
寬度: 32px
高度: 32px
圓角: 0 6px 0 6px
```

**上傳自訂縮圖按鈕**
```
上方間距: 12px
樣式: Secondary Button
文字: "上傳自訂縮圖"
寬度: 100%
```

**說明**
```
上方間距: 8px
字型: Caption (12px, #9B9A97)
```

說明文字:
```
建議尺寸: 1280x720 (16:9)
格式: JPG, PNG
最大檔案大小: 2MB
```

### 6. 隱私與設定面板

**容器** (同縮圖面板樣式)

**標題**
- 文字: "隱私與設定"
- 字型: Heading 3 (16px, #37352F)
- 字重: 600

**隱私設定**
```
上方間距: 16px
```

**標籤**
- 文字: "隱私設定 *"
- 字型: Body Regular (14px, #37352F)
- 必填標記: * (紅色)

**單選按鈕組**
```
上方間距: 8px
間距: 12px (垂直)
```

**選項**:
- ◉ 公開 (public) - 任何人都可以搜尋和觀看
- ○ 不公開 (unlisted) - 只有持有連結的人可以觀看
- ○ 私人 (private) - 只有您和指定的人可以觀看

**選項樣式**
```
佈局: 水平 (單選鈕 + 標籤 + 說明)
間距: 8px
```

**說明文字**
- 字型: Caption (12px, #9B9A97)
- 顯示於選項下方

**分類選擇**
```
上方間距: 20px
```

**標籤**
- 文字: "分類"
- 字型: Body Regular (14px, #37352F)

**下拉選單**
```
上方間距: 8px
使用共用元件 Dropdown
```

**選項**:
- 電影與動畫
- 汽車與交通工具
- 音樂
- 寵物與動物
- 體育
- 短片
- 旅遊與活動
- 遊戲
- 影音部落格
- 人物與網誌
- 喜劇
- 娛樂
- 新聞與政治
- 生活與時尚
- 教育
- 科學與技術

**排程發布**
```
上方間距: 20px
```

**標籤**
- 文字: "排程發布"
- 字型: Body Regular (14px, #37352F)

**啟用開關**
```
上方間距: 8px
佈局: 水平 (Checkbox + 標籤)
間距: 8px
```

**Checkbox**
- 使用共用元件 Checkbox

**標籤文字**
- 內容: "啟用排程發布"
- 字型: Body Regular (14px, #37352F)

**日期時間選擇器** (啟用時顯示)
```
上方間距: 12px
佈局: 水平
間距: 12px
```

**日期輸入**
```
標籤: "日期"
寬度: 150px
高度: 36px
類型: date
最小值: 今天
```

**時間輸入**
```
標籤: "時間"
寬度: 100px
高度: 36px
類型: time
```

**說明**
```
上方間距: 8px
字型: Caption (12px, #9B9A97)
```

說明文字:
```
影片將在指定時間自動發布為公開
```

### 7. 底部按鈕列

**佈局**
```
位置: 固定於頁面底部
高度: 80px
背景: #FFFFFF
上邊框: 1px solid #E9E9E7
內邊距: 20px 32px
對齊: 右側
```

**[取消] 按鈕**
- 樣式: Secondary Button
- 點擊: 顯示確認對話框

**[上傳影片 →] 按鈕**
- 樣式: Primary Button
- Icon: → (右側)
- 預設狀態: 禁用
- 啟用條件: 已登入 YouTube 且填寫必填欄位
- 點擊: 執行影片上傳

## 互動行為

### YouTube OAuth 2.0 登入流程

**點擊「登入 YouTube」按鈕**:

1. **開啟 OAuth 授權視窗**:
   - 使用 macOS 預設瀏覽器
   - 導向 Google OAuth 2.0 授權頁面
   - 請求權限:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/youtube.readonly`

2. **使用者授權**:
   - 選擇 Google 帳號
   - 確認授權應用程式存取 YouTube

3. **接收授權碼**:
   - 重定向回應用程式 (Redirect URI)
   - 交換授權碼取得 Access Token 和 Refresh Token

**OAuth 2.0 Redirect URI 和 Callback 處理詳細實作**

**Redirect URI 設定 (推薦方式: 本地 HTTP Server)**

```typescript
const REDIRECT_URI = 'http://localhost:8888/oauth/callback';
const PORT = 8888;
```

在 Google Cloud Console 設定:
- **授權重新導向 URI**: `http://localhost:8888/oauth/callback`
- **授權 JavaScript 來源**: `http://localhost`

**OAuth Server 實作 (Main Process)**

```typescript
import http from 'http';
import { URL } from 'url';

function startOAuthServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url!, `http://localhost:${PORT}`);

      if (url.pathname === '/oauth/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
              <meta charset="UTF-8">
              <title>授權失敗</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                       text-align: center; padding: 60px; }
                h1 { color: #E03E3E; }
              </style>
            </head>
            <body>
              <h1>❌ YouTube 授權失敗</h1>
              <p>錯誤: ${error}</p>
              <p>您可以關閉此視窗,回到 YTMaker3 重新嘗試。</p>
            </body>
            </html>
          `);
          server.close();
          reject(new Error(error));
        } else if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
              <meta charset="UTF-8">
              <title>授權成功</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                       text-align: center; padding: 60px; }
                h1 { color: #0F7B6C; }
              </style>
            </head>
            <body>
              <h1>✅ YouTube 授權成功!</h1>
              <p>您已成功授權 YTMaker3 存取您的 YouTube 頻道。</p>
              <p>請回到應用程式繼續操作。此視窗將在 3 秒後自動關閉...</p>
              <script>setTimeout(() => window.close(), 3000);</script>
            </body>
            </html>
          `);
          server.close();
          resolve(code);
        }
      }
    });

    server.listen(PORT, () => {
      console.log(`OAuth callback server started on port ${PORT}`);
    });

    // 10 分鐘逾時
    setTimeout(() => {
      if (server.listening) {
        server.close();
        reject(new Error('OAuth 授權逾時 (10 分鐘),請重新嘗試'));
      }
    }, 10 * 60 * 1000);
  });
}
```

**完整 OAuth 授權流程 (YouTubeService)**

```typescript
export class YouTubeService {
  private static readonly OAUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
  private static readonly TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
  private static readonly REDIRECT_URI = 'http://localhost:8888/oauth/callback';
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly'
  ];

  /**
   * 啟動 OAuth 2.0 授權流程
   */
  static async authorize(): Promise<void> {
    // 1. 讀取 Client ID 和 Client Secret
    const clientId = await KeychainService.getAPIKey('youtube-client-id');
    const clientSecret = await KeychainService.getAPIKey('youtube-client-secret');

    if (!clientId || !clientSecret) {
      throw new Error('YouTube OAuth 設定未完成');
    }

    // 2. 生成 state (防 CSRF)
    const state = crypto.randomBytes(32).toString('hex');

    // 3. 啟動本地 HTTP server
    const codePromise = startOAuthServer();

    // 4. 構建授權 URL
    const authUrl = new URL(this.OAUTH_ENDPOINT);
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.SCOPES.join(' '));
    authUrl.searchParams.append('access_type', 'offline');  // 取得 refresh token
    authUrl.searchParams.append('prompt', 'consent');       // 強制授權畫面
    authUrl.searchParams.append('state', state);

    // 5. 開啟瀏覽器
    require('electron').shell.openExternal(authUrl.toString());

    // 6. 等待授權碼
    const code = await codePromise;

    // 7. 交換 Token
    const tokens = await this.exchangeCodeForTokens(code, clientId, clientSecret);

    // 8. 儲存到 Keychain
    await KeychainService.setAPIKey('youtube-access-token', tokens.access_token);
    await KeychainService.setAPIKey('youtube-refresh-token', tokens.refresh_token);
    await KeychainService.setAPIKey('youtube-token-expiry',
      (Date.now() + tokens.expires_in * 1000).toString()
    );
  }

  /**
   * 交換授權碼取得 Token
   */
  private static async exchangeCodeForTokens(
    code: string, clientId: string, clientSecret: string
  ) {
    const response = await axios.post(this.TOKEN_ENDPOINT,
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.REDIRECT_URI,
        grant_type: 'authorization_code'
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    return response.data;
  }

  /**
   * 自動更新 Access Token
   */
  static async refreshAccessToken(): Promise<string> {
    const clientId = await KeychainService.getAPIKey('youtube-client-id');
    const clientSecret = await KeychainService.getAPIKey('youtube-client-secret');
    const refreshToken = await KeychainService.getAPIKey('youtube-refresh-token');

    if (!refreshToken) {
      throw new Error('Refresh Token 不存在,請重新授權');
    }

    const response = await axios.post(this.TOKEN_ENDPOINT,
      new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const newAccessToken = response.data.access_token;

    // 更新 Keychain
    await KeychainService.setAPIKey('youtube-access-token', newAccessToken);
    await KeychainService.setAPIKey('youtube-token-expiry',
      (Date.now() + response.data.expires_in * 1000).toString()
    );

    return newAccessToken;
  }

  /**
   * 取得有效 Token (自動檢查過期)
   */
  static async getAccessToken(): Promise<string> {
    const token = await KeychainService.getAPIKey('youtube-access-token');
    const expiryStr = await KeychainService.getAPIKey('youtube-token-expiry');

    if (!token) {
      throw new Error('未授權 YouTube');
    }

    // 檢查是否即將過期 (提前 5 分鐘更新)
    const expiry = parseInt(expiryStr || '0');
    if (Date.now() + 5 * 60 * 1000 >= expiry) {
      return await this.refreshAccessToken();
    }

    return token;
  }
}
```

**Token 過期處理**

當 Refresh Token 失效時 (通常 6 個月後):

1. 偵測到 401 錯誤且無法更新 Token
2. 顯示對話框:
   ```
   YouTube 授權已過期,請重新連結您的帳號。
   [取消] [重新連結]
   ```
3. 點擊「重新連結」:
   - 清除舊 Token
   - 重新執行 OAuth 流程

4. **儲存 Token**:
   - 儲存到 macOS Keychain (安全儲存)
   - 更新頁面狀態為「已登入」
   - 載入頻道列表

5. **載入頻道資訊**:
   - 呼叫 YouTube Data API (channels.list)
   - 顯示頻道名稱和訂閱者數
   - 若有多個頻道,顯示下拉選單

**登出操作**:
1. 點擊「登出」按鈕
2. 顯示確認對話框
3. 刪除儲存的 Token
4. 重置頁面狀態為「未登入」

### 表單驗證

**即時驗證**:

**影片標題**:
- 必填欄位
- 1-100 字
- 空白時顯示錯誤: "影片標題不能為空"
- 超過 100 字時顯示錯誤: "標題過長,最多 100 字"

**影片描述**:
- 選填欄位
- 最多 5000 字
- 超過時顯示錯誤: "描述過長,最多 5000 字"

**標籤**:
- 選填欄位
- 自動分割逗號
- 移除空白標籤
- 即時顯示標籤數量

**隱私設定**:
- 必填欄位
- 預設值: 公開

**提交驗證**:
- 必須已登入 YouTube
- 必須填寫影片標題
- 必須選擇隱私設定
- 若啟用排程發布,必須選擇未來的日期時間

### 縮圖上傳

**點擊「上傳自訂縮圖」按鈕**:

1. **開啟檔案選擇器**:
   - 篩選: JPG, PNG
   - 允許多選: 否

2. **驗證檔案**:
   - 檔案大小 ≤ 2MB
   - 格式為 JPG 或 PNG
   - 建議尺寸: 1280x720 (16:9)

3. **顯示預覽**:
   - 載入圖片到預覽區
   - 顯示移除按鈕

4. **儲存檔案路徑**:
   - 複製到專案輸出目錄
   - 儲存路徑到專案資料

**移除縮圖**:
- 點擊預覽右上角的 ✕ 按鈕
- 移除預覽和檔案路徑
- 恢復「尚未上傳」狀態

### 上傳影片流程

**點擊「上傳影片」按鈕後**:

1. **顯示上傳進度對話框**:
   ```
   ┌──────────────────────────────────────────────┐
   │  正在上傳到 YouTube...                        │
   │  ████████████████░░░░░░░░░░░░ 60%            │
   │                                              │
   │  • 正在上傳影片... (125 MB / 200 MB)         │
   │    預計剩餘時間: 3 分鐘                      │
   └──────────────────────────────────────────────┘
   ```

2. **上傳影片檔案** (YouTube Data API):
   - 使用可恢復上傳 (Resumable Upload)
   - 顯示上傳進度 (百分比 + 已上傳 / 總大小)
   - 支援暫停和繼續
   - 進度: 0% → 90%

3. **上傳自訂縮圖** (若有):
   - 呼叫 thumbnails.set API
   - 進度: 90% → 95%

4. **設定影片資訊**:
   - 標題、描述、標籤
   - 隱私設定
   - 分類
   - 排程發布時間 (若有)
   - 進度: 95% → 100%

5. **上傳完成**:
   - 關閉進度對話框
   - 顯示成功提示: "影片已成功上傳到 YouTube"
   - 跳轉到「完成頁面」
   - 傳遞資料: YouTube 影片 ID 和連結

## 錯誤處理

### OAuth 錯誤

**授權失敗**:
```
錯誤訊息: "YouTube 登入失敗"
說明: "無法完成 Google 帳號授權,請重試"
操作: [重試] [取消]
```

**Token 過期**:
```
錯誤訊息: "登入已過期"
說明: "請重新登入您的 YouTube 帳號"
操作: [重新登入]
```

**權限不足**:
```
錯誤訊息: "權限不足"
說明: "此 Google 帳號沒有管理 YouTube 頻道的權限"
操作: [使用其他帳號] [取消]
```

### 上傳錯誤

**網路中斷**:
```
錯誤訊息: "上傳中斷"
說明: "網路連線中斷,已儲存進度"
操作: [繼續上傳] [取消]
```

**配額超限**:
```
錯誤訊息: "YouTube API 配額超限"
說明: "今日上傳次數已達上限,請明天再試"
詳細: "每日配額: 10,000 單位"
操作: [確定]
```

**影片檔案過大**:
```
錯誤訊息: "影片檔案過大"
說明: "YouTube 免費帳戶最大支援 128GB 或 12 小時"
操作: [返回編輯] [取消]
```

**縮圖格式錯誤**:
```
錯誤訊息: "縮圖格式不符"
說明: "請使用 1280x720 (16:9) 的 JPG 或 PNG 檔案"
操作: [重新上傳]
```

### 驗證錯誤

**未登入**:
```
錯誤訊息: "尚未登入 YouTube"
說明: "請先登入您的 YouTube 帳號"
操作: [登入]
```

**必填欄位為空**:
```
錯誤訊息: "請填寫所有必填欄位"
說明: "影片標題和隱私設定為必填"
操作: [確定]
```

**排程時間無效**:
```
錯誤訊息: "排程時間無效"
說明: "排程發布時間必須為未來時間"
操作: [確定]
```

## 鍵盤快捷鍵

```
Cmd+S: 儲存專案
Cmd+Enter: 上傳影片 (若驗證通過)
Esc: 取消
```

## 無障礙

- 所有表單欄位支援鍵盤導航
- 必填欄位使用 ARIA required 屬性
- 錯誤訊息使用 ARIA 屬性通知螢幕閱讀器
- Focus 樣式清晰可見
- 上傳進度提供文字描述
