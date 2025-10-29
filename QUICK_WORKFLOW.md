# SpecKit V2 快速工作流程

**給開發者的簡易指南 - 每個階段該用哪些指令**

---

## 🎯 完整流程概覽

```
需求定義 → 視覺化 → 設計 → 拆分 → 實作 → 驗證 → 整合 → 測試 → UAT → 部署
```

---

## 📋 階段 1: 需求定義

### 你要做什麼
定義專案需求，描述要做什麼功能。

### 使用指令

```bash
/speckit.specify
```

**AI 會問你**：
- 專案名稱是什麼？
- 要做什麼功能？
- 目標使用者是誰？
- 部署目標是什麼？（本地 HTML / 桌面 App / 雲端）

**產生**：`requirements.md`

### （可選）澄清需求

如果需求不夠清楚，AI 可以問你問題：

```bash
/speckit.clarify
```

---

## 📋 階段 2: 視覺化規格

### 你要做什麼
AI 將需求轉換為具體的 UI 設計和 API 規格。

### 使用指令

```bash
/speckit.visualize
```

**產生**：
```
visual-spec/
├── pages/          # UI 頁面設計
├── flows/          # 使用者流程
└── contracts/      # API 契約
```

### ⚠️ 重要：你必須審核這一層！

這是最重要的審核點：
- 檢查 UI 設計是否符合預期
- 檢查使用者流程是否正確
- **檢查 API 欄位名稱**（之後很難改）

如果有問題，修改 `visual-spec/` 的檔案，然後繼續。

---

## 📋 階段 3: 技術設計

### 你要做什麼
AI 將視覺規格轉換為技術設計（包含部署配置）。

### 使用指令

```bash
/speckit.plan
```

**產生**：`design-spec.yaml`

**包含**：
- 資料模型
- API 端點
- UI 元件
- 驗證規則
- **部署配置**（很重要！）

---

## 📋 階段 4: 拆分 Work Packages

### 你要做什麼
將設計拆分成可獨立開發的小任務。

### 使用指令

```bash
/speckit.breakdown
```

**產生**：
```
work-packages/
├── WP001-login-feature/
├── WP002-register-feature/
├── WP003-reset-password/
└── ...
```

每個 WP 包含：
- `README.md` - 任務描述
- `tasks/` - 子任務清單
- `contract-expected.yaml` - 預期契約

---

## 📋 階段 5: 實作與驗證

### 你要做什麼
逐個實作每個 WP，並驗證正確性。

### 實作一個 WP

```bash
/speckit.implement WP001/task-001
```

**AI 會**：
- 寫程式碼（遵循 TDD）
- 寫測試
- 更新 journal

### 驗證 WP

```bash
/speckit.verify --wp WP001
```

**AI 會**：
- 檢查契約是否符合預期
- 執行所有測試
- 生成 `verification-report.md`

**結果**：
- ✅ 通過：這個 WP 完成了
- ❌ 失敗：生成 `diagnosis-report.md`

### 如果驗證失敗，修正問題

```bash
/speckit.fix --wp WP001 --auto
```

**AI 會**：
- 讀取診斷報告
- 自動修正問題
- 重新驗證

**循環直到通過**。

### 查看所有 WP 狀態

```bash
/speckit.status
```

看看哪些完成了，哪些還在進行中。

### 重複步驟 5

對每個 WP 重複「實作 → 驗證 → 修正」：

```bash
/speckit.implement WP002/task-001
/speckit.verify --wp WP002
# 如果失敗 → /speckit.fix --wp WP002

/speckit.implement WP003/task-001
/speckit.verify --wp WP003
# ...
```

**直到所有 WP 都通過驗證**。

---

## 📋 階段 6: 整合

### 你要做什麼
將所有 WP 整合在一起，合併重複的元件。

### 分析整合衝突

```bash
/speckit.analyze
```

**產生**：`integration/integration-analysis.md`

**顯示**：
- 重複的元件（如 Button）
- 命名衝突
- 整合策略

### 執行整合

```bash
/speckit.integrate --full
```

**AI 會**：
- 合併重複元件
- 解決命名衝突
- 建立統一的目錄結構
- 生成 `integration-report.md`

---

## 📋 階段 7: 整合測試（AI 自動測試）

### 你要做什麼
執行自動化整合測試，確保一切正常。

### 執行整合測試

```bash
/speckit.test --integration
```

**AI 會測試**：
1. 個別 WP 功能（整合後沒有破壞）
2. 跨 WP 流程（E2E）
3. 共用元件
4. API 整合

**產生**：`integration/integration-test-report.md`

**結果**：
- ✅ 通過：進入下一階段
- ❌ 失敗：自動生成 `integration-diagnosis-report.md`

### 如果測試失敗，修正整合問題

```bash
/speckit.fix-integration --auto
```

**AI 會**：
- 讀取診斷報告
- 自動修正整合問題
- 重新執行整合測試

**循環直到所有測試通過**。

### 清理暫存檔案（可選）

```bash
/speckit.cleanup
```

移除 coverage reports、build artifacts 等暫存檔。

---

## 📋 階段 8: 人工測試（UAT）

### 你要做什麼
**你親自測試**應用程式，確保一切符合預期。

### 啟動測試環境

```bash
/speckit.uat --prepare-env
```

**AI 會**：
- 快速建置應用程式（5 秒）
- 啟動測試環境
  - Static HTML: 啟動 HTTP server + 開啟瀏覽器
  - Electron: 啟動 app 視窗
  - GCP: 用 Docker 在本地模擬環境
- 生成測試清單 `uat/test-checklist.md`

**你看到**：
```
✅ UAT 測試環境已就緒！

測試環境:
  URL: http://localhost:3000

測試清單: uat/test-checklist.md

開始測試！
```

### 你進行人工測試

打開瀏覽器或 app，實際測試：
- ✅ 所有功能正常嗎？
- ✅ UI/UX 好用嗎？
- ✅ 有沒有錯誤？
- ✅ 效能可以嗎？

**大約 15-30 分鐘**

### 記錄測試結果

```bash
/speckit.uat --report
```

**AI 會問你**每個測試項目：
```
1. 登入功能正常嗎？
   ✅ 通過 / ❌ 失敗 / ⏭️  跳過:
```

你回答 `✅` 或 `❌`。

如果失敗，AI 會問：
- 問題是什麼？
- 嚴重程度？
- 有截圖嗎？

**產生**：`uat/uat-report.md`

**結果**：
- ✅ 通過 UAT：可以部署了！
- ❌ 未通過 UAT：需要修正問題

### 如果測試未通過

1. 查看 `uat/uat-report.md` 了解問題
2. 回到開發階段修正
3. 重新執行 `/speckit.uat --prepare-env`
4. 重新測試

### 停止測試環境

測試完成後：

```bash
/speckit.uat --stop
```

---

## 📋 階段 9: 部署準備

### 你要做什麼
生成部署配置和建置腳本。

### 生成部署配置

```bash
/speckit.deploy
```

**AI 會**：
- 讀取 `design-spec.yaml` 的 `deployment` 區塊
- 根據部署目標生成對應檔案

**產生**：
```
deployment/
├── build.sh        # 建置腳本
├── deploy.sh       # 部署腳本（如果需要）
├── README.md       # 詳細部署指南
└── （其他配置檔）
```

---

## 📋 階段 10: 建置與部署

### 你要做什麼
真正的生產建置和部署。

### 建置

```bash
./deployment/build.sh
```

**根據部署目標不同**：

#### Static HTML
產生 `dist/index.html`（10 秒）

#### Electron 桌面 App
產生安裝檔（1-2 分鐘）：
- `MyApp-Setup-1.0.0.exe` (Windows)
- `MyApp-1.0.0.dmg` (macOS)
- `MyApp-1.0.0.deb` (Linux)

#### GCP Cloud Run
建置 Docker image（2-3 分鐘）

### 部署

#### Static HTML
```bash
# 上傳到 GitHub Pages / Netlify / Vercel
# 或直接開啟: open dist/index.html
```

#### Electron
```bash
# 發布到 GitHub Releases
gh release create v1.0.0 dist/*.exe dist/*.dmg dist/*.deb
```

#### GCP Cloud Run
```bash
./deployment/deploy.sh
# 自動部署到 GCP
```

---

## 🎉 完成！

應用程式已經：
- ✅ 開發完成
- ✅ 測試通過（AI 自動測試）
- ✅ 測試通過（人工測試）
- ✅ 建置成功
- ✅ 部署完成

---

## 📊 指令速查表

### 需求與設計
| 指令 | 用途 | 產生 |
|------|------|------|
| `/speckit.specify` | 定義需求 | requirements.md |
| `/speckit.clarify` | 澄清需求 | 更新 requirements.md |
| `/speckit.visualize` | 視覺化規格 | visual-spec/ |
| `/speckit.plan` | 技術設計 | design-spec.yaml |
| `/speckit.breakdown` | 拆分任務 | work-packages/ |

### 實作與驗證
| 指令 | 用途 | 產生 |
|------|------|------|
| `/speckit.implement WP###/task-###` | 實作任務 | 程式碼 + 測試 |
| `/speckit.verify --wp WP###` | 驗證 WP | verification-report.md |
| `/speckit.fix --wp WP###` | 修正 WP | 修正後重新驗證 |
| `/speckit.status` | 查看狀態 | work-packages/STATUS.md |

### 整合與測試
| 指令 | 用途 | 產生 |
|------|------|------|
| `/speckit.analyze` | 分析整合 | integration-analysis.md |
| `/speckit.integrate --full` | 執行整合 | integration-report.md |
| `/speckit.test --integration` | 整合測試 | integration-test-report.md |
| `/speckit.fix-integration` | 修正整合問題 | 修正後重新測試 |
| `/speckit.cleanup` | 清理暫存 | - |

### 人工測試
| 指令 | 用途 | 產生 |
|------|------|------|
| `/speckit.uat --prepare-env` | 啟動測試環境 | 測試環境 + test-checklist.md |
| `/speckit.uat --report` | 記錄測試結果 | uat-report.md |
| `/speckit.uat --stop` | 停止測試環境 | - |

### 部署
| 指令 | 用途 | 產生 |
|------|------|------|
| `/speckit.deploy` | 生成部署配置 | deployment/ |
| `./deployment/build.sh` | 建置 | 安裝檔或部署檔案 |
| `./deployment/deploy.sh` | 部署（如適用） | 部署到雲端 |

---

## 🔄 常見情境

### 情境 1：從零開始新專案

```bash
/speckit.specify
/speckit.visualize
/speckit.plan
/speckit.breakdown
/speckit.implement WP001/task-001
/speckit.verify --wp WP001
# ... 實作所有 WP
/speckit.analyze
/speckit.integrate --full
/speckit.test --integration
/speckit.uat --prepare-env
/speckit.uat --report
/speckit.deploy
./deployment/build.sh
```

### 情境 2：WP 驗證失敗

```bash
/speckit.verify --wp WP002
# ❌ 失敗

# 查看診斷報告
cat work-packages/WP002/diagnosis-report.md

# 自動修正
/speckit.fix --wp WP002 --auto

# 或手動修正後重新驗證
/speckit.verify --wp WP002
```

### 情境 3：整合測試失敗

```bash
/speckit.test --integration
# ❌ 失敗

# 查看診斷報告
cat integration/integration-diagnosis-report.md

# 自動修正
/speckit.fix-integration --auto

# 會自動重新測試
```

### 情境 4：UAT 發現問題

```bash
/speckit.uat --prepare-env
# 測試發現問題

/speckit.uat --report
# 記錄問題

/speckit.uat --stop

# 回到開發修正
# 修正程式碼...

# 重新測試
/speckit.uat --prepare-env
/speckit.uat --report
# ✅ 通過
```

### 情境 5：需要重新設計

如果在 UAT 發現需要大幅修改：

```bash
# 1. 修改視覺規格
vim visual-spec/pages/login.md

# 2. 重新生成設計
/speckit.plan

# 3. 重新拆分
/speckit.breakdown

# 4. 重新實作受影響的 WP
/speckit.implement WP001/task-001
/speckit.verify --wp WP001

# 5. 繼續流程...
```

---

## ❓ 常見問題

### Q: 我可以跳過某些階段嗎？

**A**: 不建議。每個階段都有其目的：
- 跳過 visualize：AI 可能誤解需求
- 跳過 verify：可能有 bug 進入整合
- 跳過 UAT：可能部署後才發現問題

### Q: 多個 WP 可以平行開發嗎？

**A**: 可以！所有 WP 是獨立的，可以同時執行：
```bash
# 在不同終端或讓 AI 平行處理
/speckit.implement WP001/task-001
/speckit.implement WP002/task-001
/speckit.implement WP003/task-001
```

### Q: 部署目標可以改嗎？

**A**: 可以。在 `design-spec.yaml` 修改 `deployment.target`，然後：
```bash
/speckit.deploy --update
```

### Q: UAT 測試環境啟動很慢怎麼辦？

**A**:
- Static HTML: 應該 < 10 秒
- Electron: 應該 < 10 秒（dev mode）
- GCP: 如果首次需要 build Docker，可能 1-2 分鐘

如果比這慢，可能有問題。

### Q: 我可以手動修改程式碼嗎？

**A**: 當然可以！AI 生成的程式碼只是起點。修改後記得：
```bash
/speckit.verify --wp WP001  # 重新驗證
```

---

## 📚 詳細文檔

- 完整工作流程：`.specify/NEW_WORKFLOW.md`
- 每個指令的詳細說明：`.claude/commands/speckit.*.md`
- 部署指南：`deployment/README.md`（部署後生成）

---

**版本**: 1.0.0
**最後更新**: 2025-01-15
