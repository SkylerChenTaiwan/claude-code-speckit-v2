# 設計系統規範

## 設計理念

**Notion 風格的簡潔美學**:
- 簡潔但精緻的介面
- 最少的顏色使用
- 補充資訊使用淡灰色呈現
- 避免無意義的裝飾元素

## 顏色系統

### 主要顏色
```
Primary (主要操作): #2E3338 (深灰黑)
  - 用於主要按鈕、重要文字

Background: #FFFFFF (純白)
  - 頁面背景

Surface: #F7F6F3 (米白色)
  - 卡片、輸入框背景
```

### 文字顏色
```
Text Primary: #37352F (深灰)
  - 標題、主要內容文字

Text Secondary: #787774 (中灰)
  - 次要說明文字、標籤

Text Tertiary: #9B9A97 (淡灰)
  - 補充資訊、提示文字、時間戳記

Text Placeholder: #C7C7C5 (極淡灰)
  - 輸入框佔位符
```

### 狀態顏色
```
Success: #0F7B6C (深青綠)
  - 成功訊息、完成狀態

Error: #E03E3E (深紅)
  - 錯誤訊息、警告

Warning: #D9730D (深橙)
  - 警告訊息

Info: #0B6E99 (深藍)
  - 資訊提示

Progress: #2E3338 (深灰黑)
  - 進度條、載入狀態
```

### 邊框與分隔線
```
Border: #E9E9E7 (淡米色)
  - 輸入框邊框、卡片邊框

Divider: #EFEFED (極淡米色)
  - 分隔線
```

## 字型系統

### 字型家族
```
Primary Font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif
  - macOS 系統字型,確保原生感

Monospace Font: "SF Mono", Monaco, Consolas, monospace
  - 用於程式碼、JSON 預覽
```

### 字型大小
```
Heading 1: 24px / 1.5 行高 / 600 字重
Heading 2: 20px / 1.5 行高 / 600 字重
Heading 3: 16px / 1.5 行高 / 600 字重

Body Large: 15px / 1.6 行高 / 400 字重
Body Regular: 14px / 1.6 行高 / 400 字重
Body Small: 13px / 1.5 行高 / 400 字重

Caption: 12px / 1.4 行高 / 400 字重 (用於補充說明)
```

## 間距系統

```
XXS: 4px   - 元素內部微小間距
XS:  8px   - 相關元素間距
S:   12px  - 小區塊間距
M:   16px  - 標準間距
L:   24px  - 段落間距
XL:  32px  - 區塊間距
XXL: 48px  - 大區塊間距
```

## 圓角系統

```
None: 0px     - 無圓角
Small: 4px    - 按鈕、標籤
Medium: 6px   - 輸入框、小卡片
Large: 8px    - 大卡片、彈窗
XLarge: 12px  - 頁面層級容器
```

## 陰影系統

```
None: 無陰影
  - 預設狀態

Subtle: 0 1px 2px rgba(0, 0, 0, 0.04)
  - 輸入框、按鈕 hover

Card: 0 1px 3px rgba(0, 0, 0, 0.06)
  - 卡片預設

Elevated: 0 4px 8px rgba(0, 0, 0, 0.08)
  - 彈出選單、下拉選單

Modal: 0 8px 16px rgba(0, 0, 0, 0.12)
  - 對話框、彈窗
```

## 按鈕規範

### 主要按鈕 (Primary Button)
```
Background: #2E3338
Text: #FFFFFF
Border: none
Height: 36px
Padding: 0 16px
Border Radius: 4px
Font Size: 14px
Font Weight: 500

Hover:
  Background: #1A1D1F
  Shadow: 0 1px 2px rgba(0, 0, 0, 0.04)

Active:
  Background: #000000

Disabled:
  Background: #E9E9E7
  Text: #C7C7C5
  Cursor: not-allowed
```

### 次要按鈕 (Secondary Button)
```
Background: transparent
Text: #37352F
Border: 1px solid #E9E9E7
Height: 36px
Padding: 0 16px
Border Radius: 4px
Font Size: 14px
Font Weight: 400

Hover:
  Background: #F7F6F3
  Border: #D3D1CB

Active:
  Background: #EFEFED

Disabled:
  Text: #C7C7C5
  Border: #EFEFED
  Cursor: not-allowed
```

### 文字按鈕 (Text Button)
```
Background: transparent
Text: #37352F
Border: none
Height: 36px
Padding: 0 12px
Border Radius: 4px
Font Size: 14px
Font Weight: 400

Hover:
  Background: #F7F6F3

Active:
  Background: #EFEFED

Disabled:
  Text: #C7C7C5
  Cursor: not-allowed
```

## 輸入框規範

### 文字輸入框
```
Background: #FFFFFF
Text: #37352F
Placeholder: #C7C7C5
Border: 1px solid #E9E9E7
Height: 36px
Padding: 0 12px
Border Radius: 6px
Font Size: 14px

Focus:
  Border: 1px solid #2E3338
  Outline: none

Error:
  Border: 1px solid #E03E3E

Disabled:
  Background: #F7F6F3
  Text: #9B9A97
  Cursor: not-allowed
```

### 多行文字輸入框 (Textarea)
```
同文字輸入框樣式
Min Height: 120px
Padding: 12px
Resize: vertical
```

### 下拉選單 (Select)
```
同文字輸入框樣式
Padding Right: 32px (預留下拉箭頭空間)
```

## 卡片規範

```
Background: #FFFFFF
Border: 1px solid #E9E9E7
Border Radius: 8px
Padding: 24px
Shadow: 0 1px 3px rgba(0, 0, 0, 0.06)

Hover (可互動卡片):
  Border: 1px solid #D3D1CB
  Shadow: 0 4px 8px rgba(0, 0, 0, 0.08)
```

## 進度指示器

### 進度條
```
Background: #EFEFED
Fill: #2E3338
Height: 4px
Border Radius: 2px
```

### 載入中動畫
```
使用簡單的旋轉圈圈
Color: #2E3338
Size: 20px (小) / 32px (中) / 48px (大)
```

## 圖示規範

```
使用 SF Symbols (macOS 原生圖示系統)
Size: 16px (小) / 20px (中) / 24px (大)
Color: 繼承父元素文字顏色
Weight: Regular (預設) / Medium (強調)
```

## 訊息提示規範

### 成功訊息
```
Background: #E8F5F1
Text: #0F7B6C
Border: none
Border Radius: 6px
Padding: 12px 16px
Icon: ✓ (綠色)
```

### 錯誤訊息
```
Background: #FDECED
Text: #E03E3E
Border: none
Border Radius: 6px
Padding: 12px 16px
Icon: ✕ (紅色)
```

### 警告訊息
```
Background: #FEF3E8
Text: #D9730D
Border: none
Border Radius: 6px
Padding: 12px 16px
Icon: ⚠ (橙色)
```

### 資訊訊息
```
Background: #E8F3F8
Text: #0B6E99
Border: none
Border Radius: 6px
Padding: 12px 16px
Icon: ℹ (藍色)
```

## 動畫規範

```
Duration: 150ms (快速互動) / 300ms (標準) / 500ms (複雜動畫)
Easing: ease-in-out (標準) / ease-out (進入) / ease-in (離開)

避免過度動畫,保持簡潔
```

## 響應式斷點

```
由於是 macOS 桌面應用,主要支援:
Minimum Width: 1024px
Optimal Width: 1280px - 1920px
```

## 無障礙規範

```
- 所有互動元素必須支援鍵盤導航
- Focus 狀態必須明確可見
- 顏色對比度符合 WCAG AA 標準 (最少 4.5:1)
- 重要操作提供鍵盤快捷鍵
```
