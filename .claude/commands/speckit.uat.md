---
description: Prepare and manage User Acceptance Testing (UAT) environment and reports.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command manages the User Acceptance Testing (UAT) phase between automated testing and deployment. It provides a fast, production-like testing environment and helps record human testing results.

**Key principle**: Human testing happens in a near-production environment that starts quickly, after all automated tests pass.

## Purpose

This command provides:
- **Fast test environment**: Start a testable environment in seconds
- **Production-like setup**: Environment matches deployment target
- **Guided testing**: Auto-generated test checklist from specs
- **Result recording**: Interactive test report generation
- **Quality gate**: Ensures human verification before deployment

## Modes

### Mode 1: Prepare Test Environment

```bash
/speckit.uat --prepare-env
```

Quickly start a testable environment based on deployment target.

### Mode 2: Generate Test Checklist

```bash
/speckit.uat --checklist
```

Generate UAT test checklist from design-spec.yaml and integration tests.

### Mode 3: Record Test Results

```bash
/speckit.uat --report
```

Interactive Q&A to record test results and generate uat-report.md.

### Mode 4: Stop Test Environment

```bash
/speckit.uat --stop
```

Clean up and stop the test environment.

### Mode 5: View Test Status

```bash
/speckit.uat --status
```

Show current UAT status and pending items.

## Execution: Mode 1 (Prepare Test Environment)

### Step 1: Verify Prerequisites

```bash
# Check that automated tests passed
if [ ! -f "integration/integration-test-report.md" ]; then
  echo "❌ Error: 請先執行整合測試"
  echo "Run: /speckit.test --integration"
  exit 1
fi

# Check test status
TEST_STATUS=$(grep "^Status:" integration/integration-test-report.md | grep "✅ 通過")
if [ -z "$TEST_STATUS" ]; then
  echo "❌ Error: 整合測試未通過"
  echo "請先確保所有自動測試通過後再進行 UAT"
  exit 1
fi

echo "✅ 整合測試已通過，可以開始 UAT"
```

### Step 2: Read Deployment Target

```bash
# Get deployment target from design-spec.yaml
DESIGN_SPEC="$FEATURE_DIR/design-spec.yaml"
TARGET=$(yq eval '.deployment.target' "$DESIGN_SPEC")

echo "📦 部署目標: $TARGET"
echo "🔧 準備測試環境..."
```

### Step 3: Start Environment Based on Target

#### Target: static-html-single-file / static-html-spa

```bash
prepare_static_html_env() {
  echo "🔨 Building static HTML..."

  # Get build commands
  BUILD_CMD=$(yq eval '.deployment.build.build_command' "$DESIGN_SPEC")
  OUTPUT_DIR=$(yq eval '.deployment.build.output_directory' "$DESIGN_SPEC")

  # Build
  eval "$BUILD_CMD"

  if [ ! -d "$OUTPUT_DIR" ]; then
    echo "❌ Build failed: $OUTPUT_DIR not found"
    exit 1
  fi

  echo "✅ Build complete"

  # Start HTTP server
  echo "🚀 Starting test server..."

  # Try different HTTP servers
  if command -v python3 &> /dev/null; then
    python3 -m http.server 3000 -d "$OUTPUT_DIR" > uat/server.log 2>&1 &
    SERVER_PID=$!
  elif command -v npx &> /dev/null; then
    npx http-server "$OUTPUT_DIR" -p 3000 > uat/server.log 2>&1 &
    SERVER_PID=$!
  else
    echo "❌ No HTTP server available"
    echo "Install: python3 or node.js"
    exit 1
  fi

  # Save PID for cleanup
  echo "$SERVER_PID" > uat/server.pid

  # Wait for server to start
  sleep 2

  echo "✅ Test server running at http://localhost:3000"

  # Open browser
  if command -v open &> /dev/null; then
    open http://localhost:3000
  elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
  fi

  echo "🌐 Browser opened"
}
```

#### Target: gcp-cloud-run / docker-compose-local

```bash
prepare_docker_env() {
  echo "🐳 Preparing Docker test environment..."

  # Check if docker-compose.yml exists
  if [ ! -f "uat/docker-compose.yml" ]; then
    echo "📝 Generating docker-compose.yml for UAT..."
    generate_uat_docker_compose
  fi

  # Build images
  echo "🔨 Building Docker images..."
  docker-compose -f uat/docker-compose.yml build

  # Start containers
  echo "🚀 Starting containers..."
  docker-compose -f uat/docker-compose.yml up -d

  # Wait for services to be ready
  echo "⏳ Waiting for services..."
  sleep 5

  # Check health
  if docker-compose -f uat/docker-compose.yml ps | grep -q "Up"; then
    echo "✅ All services running"
  else
    echo "❌ Some services failed to start"
    docker-compose -f uat/docker-compose.yml logs
    exit 1
  fi

  # Get app port
  APP_PORT=$(yq eval '.deployment.container.port' "$DESIGN_SPEC")

  echo "✅ Test environment running at http://localhost:$APP_PORT"

  # Open browser
  if command -v open &> /dev/null; then
    open "http://localhost:$APP_PORT"
  elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:$APP_PORT"
  fi

  echo "🌐 Browser opened"
}

generate_uat_docker_compose() {
  # Generate docker-compose.yml for UAT testing
  # Based on deployment config in design-spec.yaml

  cat > uat/docker-compose.yml <<EOF
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: deployment/Dockerfile
    ports:
      - "$APP_PORT:$APP_PORT"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:password@db:5432/testdb
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:$APP_PORT/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - uat-db-data:/var/lib/postgresql/data

volumes:
  uat-db-data:
EOF
}
```

#### Target: desktop-app-electron

```bash
prepare_electron_env() {
  echo "🖥️  Preparing Electron test environment..."

  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
  fi

  # Build in development mode (fast)
  echo "🔨 Building app (dev mode)..."
  npm run build:dev

  # Start Electron
  echo "🚀 Starting Electron app..."
  npm run electron:dev > uat/electron.log 2>&1 &
  ELECTRON_PID=$!

  # Save PID
  echo "$ELECTRON_PID" > uat/electron.pid

  echo "✅ Electron app started (PID: $ELECTRON_PID)"
  echo "🖥️  App window should open automatically"
}
```

### Step 4: Generate Test Checklist

```bash
echo "📋 Generating test checklist..."

# Generate checklist from design-spec and integration tests
/speckit.uat --checklist

echo "✅ Test checklist generated: uat/test-checklist.md"
```

### Step 5: Prepare Test Data

```bash
if [ -f "uat/seed-test-data.sh" ]; then
  echo "🌱 Loading test data..."
  ./uat/seed-test-data.sh
  echo "✅ Test data loaded"
fi
```

### Step 6: Display Summary

```
========================================
✅ UAT 測試環境已就緒！
========================================

測試環境:
  URL: http://localhost:3000
  Database: PostgreSQL (localhost:5432)
  Test data: ✅ 已載入範例資料

測試清單:
  📋 uat/test-checklist.md

環境資訊:
  📄 uat/environment-info.md

開始測試！

完成測試後執行:
  /speckit.uat --report    (記錄測試結果)
  /speckit.uat --stop      (停止測試環境)

========================================
```

### Step 7: Update Journal

```markdown
### [TIMESTAMP] 啟動 UAT 測試環境

**Action**: `/speckit.uat --prepare-env`

**Deployment Target**: [TARGET]

**Environment**:
- URL: http://localhost:[PORT]
- Database: [DB_INFO]
- Test data: Loaded

**Status**: ✅ Environment ready

**Next**: Begin manual testing

---
```

## Execution: Mode 2 (Generate Test Checklist)

### Step 1: Read Specs and Tests

```bash
# Read work packages from design-spec
WP_LIST=$(yq eval '.work_packages[].id' "$DESIGN_SPEC")

# Read E2E flows from integration test report
E2E_FLOWS=$(grep "^### Test.*: " integration/integration-test-report.md)
```

### Step 2: Generate Checklist

Create: `uat/test-checklist.md`

```markdown
# UAT 測試清單

**生成時間**: [TIMESTAMP]
**專案**: [PROJECT_NAME]
**版本**: [VERSION]
**測試人員**: ___________
**測試日期**: ___________

---

## 🤖 自動生成說明

此清單自動生成自：
- `design-spec.yaml` - Work Packages 功能定義
- `integration/integration-test-report.md` - 已通過的自動測試
- `visual-spec/` - UI/UX 規格

請逐項測試並勾選。

---

## ✅ 功能測試

{{#each WORK_PACKAGES}}
### {{WP_ID}}: {{WP_NAME}}

{{#each FEATURES}}
- [ ] {{FEATURE_DESCRIPTION}}
  - 預期行為: {{EXPECTED_BEHAVIOR}}
  - 測試步驟: {{TEST_STEPS}}
{{/each}}

---
{{/each}}

## 🔄 端到端流程測試

{{#each E2E_FLOWS}}
### {{FLOW_NAME}}

**測試步驟**:
{{#each STEPS}}
{{INDEX}}. [ ] {{STEP_DESCRIPTION}}
{{/each}}

**預期結果**: {{EXPECTED_RESULT}}

---
{{/each}}

## 🎨 UI/UX 測試

### 視覺設計
- [ ] 所有文字清楚易讀（字體大小、顏色對比）
- [ ] 按鈕大小適中，容易點擊
- [ ] 間距合理，不擁擠
- [ ] 配色協調，符合設計規範
- [ ] Icon 清晰，含義明確

### 互動體驗
- [ ] 所有按鈕有 hover 效果
- [ ] 點擊後有明確反饋（loading、disabled 等）
- [ ] 表單驗證錯誤訊息清楚友善
- [ ] 成功/失敗通知明顯且適時
- [ ] 頁面切換流暢自然

### 回應式設計（如果適用）
- [ ] 桌面版（1920x1080）顯示正常
- [ ] 筆電版（1366x768）顯示正常
- [ ] 平板版（768x1024）顯示正常
- [ ] 手機版（375x667）顯示正常

## ⚡ 效能測試

### 載入速度
- [ ] 首頁載入時間 < 2 秒
- [ ] 內頁載入時間 < 1 秒
- [ ] API 回應時間 < 500ms

### 操作流暢度
- [ ] 表單輸入無延遲
- [ ] 頁面滾動流暢
- [ ] 動畫不卡頓

### 資源使用
- [ ] CPU 使用率正常（< 50%）
- [ ] 記憶體使用率正常（< 500MB）
- [ ] 無記憶體洩漏（長時間使用）

## 🔒 安全性測試

### 基本安全
- [ ] 未登入無法存取受保護頁面
- [ ] 登入後才能執行敏感操作
- [ ] 登出後 session 正確清除

### 輸入驗證
- [ ] 特殊字元正確處理（<, >, &, ', "）
- [ ] SQL injection 防護（試試 `' OR '1'='1`）
- [ ] XSS 防護（試試 `<script>alert('xss')</script>`）

### 資料保護
- [ ] 密碼不會明文顯示
- [ ] 敏感資料不會出現在 URL
- [ ] 錯誤訊息不會洩漏系統資訊

## 🌐 瀏覽器相容性測試（如果是 Web App）

- [ ] Chrome 最新版
- [ ] Firefox 最新版
- [ ] Safari 最新版（macOS/iOS）
- [ ] Edge 最新版
- [ ] 手機瀏覽器（iOS Safari / Chrome）

## 💾 資料測試

### 邊界值測試
- [ ] 空字串輸入
- [ ] 超長字串輸入（1000+ 字元）
- [ ] 特殊字元輸入
- [ ] 數字邊界值（0, 負數, 極大值）

### 資料持久性
- [ ] 重新整理後資料仍存在
- [ ] 關閉重開後資料仍存在
- [ ] 多個視窗間資料同步

## 📱 桌面應用特定測試（如果是 Electron App）

### 視窗行為
- [ ] 視窗可以正常最大化/最小化
- [ ] 視窗大小可以調整
- [ ] 全螢幕模式正常
- [ ] 關閉視窗後正確退出

### 系統整合
- [ ] 檔案開啟/儲存功能正常
- [ ] 系統通知正常
- [ ] 快捷鍵正常運作
- [ ] 應用程式 icon 顯示正確

### 安裝/更新
- [ ] 安裝程式正常運作
- [ ] 第一次啟動正常
- [ ] 解除安裝乾淨移除
- [ ] 自動更新功能正常（如果有）

## 🐛 發現的問題

記錄測試過程中發現的所有問題：

| # | 嚴重度 | 問題描述 | 重現步驟 | 預期 vs 實際 | 截圖 |
|---|--------|----------|----------|--------------|------|
| 1 | [🔴🟡🟢] | | | | |
| 2 | [🔴🟡🟢] | | | | |
| 3 | [🔴🟡🟢] | | | | |

**嚴重度說明**:
- 🔴 Critical: 核心功能無法使用，阻斷使用
- 🟡 Warning: 功能可用但有問題，影響體驗
- 🟢 Minor: 小問題，不影響使用

## 📝 測試備註

記錄任何額外的觀察、建議或注意事項：

_______________________________________________
_______________________________________________
_______________________________________________

## ✅ 測試結論

- [ ] ✅ **通過 UAT** - 所有功能正常，可以部署
- [ ] ⚠️  **條件通過** - 有小問題但不影響部署
- [ ] ❌ **未通過 UAT** - 有重大問題需要修正

**測試人員簽名**: ___________
**日期**: ___________

---

**下一步**:
- 如果通過: 執行 `/speckit.uat --report` 記錄結果，然後 `/speckit.deploy` 準備部署
- 如果未通過: 記錄問題，回到開發階段修正

---

**生成工具**: SpecKit V2 - `/speckit.uat --checklist`
**生成時間**: [TIMESTAMP]
```

## Execution: Mode 3 (Record Test Results)

### Interactive Q&A

```bash
/speckit.uat --report
```

**AI 互動式問答**:

```
========================================
📋 UAT 測試報告
========================================

我將協助你記錄測試結果。

請根據 uat/test-checklist.md 回答以下問題。

========================================
功能測試
========================================

WP001: 登入功能

1. 使用正確帳密可以登入
   ✅ 通過 / ❌ 失敗 / ⏭️  跳過:
```

User inputs: `✅`

```
   ✅ 已記錄

2. 使用錯誤帳密顯示錯誤訊息
   ✅ 通過 / ❌ 失敗 / ⏭️  跳過:
```

User inputs: `❌`

```
   請描述問題:
```

User inputs: `錯誤訊息顯示為英文 "Invalid credentials"，應該顯示中文`

```
   嚴重度 (🔴 Critical / 🟡 Warning / 🟢 Minor):
```

User inputs: `🟢`

```
   🟢 Minor issue 已記錄

   是否需要加入截圖? (y/n):
```

User inputs: `n`

Continue for all test items...

```
========================================
測試摘要
========================================

總測試項目: 45
✅ 通過: 42 (93%)
❌ 失敗: 3 (7%)
⏭️  跳過: 0 (0%)

發現的問題:
1. 🟢 Minor - WP001: 錯誤訊息應顯示中文
2. 🟡 Warning - WP002: 註冊成功但未自動登入
3. 🔴 Critical - WP005: 登出後仍可存取 Dashboard

========================================
測試結論
========================================

根據發現的問題:
- 1 個 🔴 Critical 問題
- 1 個 🟡 Warning 問題
- 1 個 🟢 Minor 問題

建議: ❌ UAT 未通過

需要修正 Critical 和 Warning 問題後重新測試。

確認測試結論? (y/n):
```

User inputs: `y`

```
✅ 測試報告已生成: uat/uat-report.md

下一步:
1. 查看詳細報告: cat uat/uat-report.md
2. 修正發現的問題
3. 重新執行 UAT: /speckit.uat --prepare-env

========================================
```

### Generate Report

Create: `uat/uat-report.md`

```markdown
# UAT 測試報告

**測試日期**: [DATE]
**測試人員**: [TESTER_NAME]
**專案**: [PROJECT_NAME]
**版本**: [VERSION]
**測試結論**: ❌ 未通過

---

## 📊 測試摘要

| 測試類別 | 總數 | 通過 | 失敗 | 跳過 | 通過率 |
|---------|------|------|------|------|--------|
| 功能測試 | 25 | 23 | 2 | 0 | 92% |
| E2E 流程測試 | 8 | 8 | 0 | 0 | 100% |
| UI/UX 測試 | 10 | 9 | 1 | 0 | 90% |
| 效能測試 | 5 | 5 | 0 | 0 | 100% |
| 安全性測試 | 6 | 6 | 0 | 0 | 100% |
| **總計** | **54** | **51** | **3** | **0** | **94%** |

---

## 🐛 發現的問題

### 問題 #1: 錯誤訊息應顯示中文

- **嚴重度**: 🟢 Minor
- **位置**: WP001 - 登入功能
- **描述**: 使用錯誤帳密登入時，錯誤訊息顯示英文 "Invalid credentials"，應該顯示中文「帳號或密碼錯誤」
- **重現步驟**:
  1. 開啟登入頁
  2. 輸入錯誤的帳號密碼
  3. 點擊登入
  4. 觀察錯誤訊息
- **預期**: 錯誤訊息為中文
- **實際**: 錯誤訊息為英文
- **建議修正**: 更新錯誤訊息為中文

---

### 問題 #2: 註冊成功但未自動登入

- **嚴重度**: 🟡 Warning
- **位置**: WP002 - 註冊功能
- **描述**: 註冊成功後應自動登入，但實際上需要手動到登入頁登入
- **重現步驟**:
  1. 開啟註冊頁
  2. 填寫所有欄位
  3. 點擊註冊
  4. 註冊成功
  5. 觀察是否自動登入
- **預期**: 註冊成功後自動登入並導向 Dashboard
- **實際**: 註冊成功後停留在註冊頁，顯示成功訊息
- **建議修正**: 註冊成功後自動呼叫登入 API 並導向 Dashboard

---

### 問題 #3: 登出後仍可存取 Dashboard

- **嚴重度**: 🔴 Critical
- **位置**: WP005 - 登出功能
- **描述**: 登出後直接在網址列輸入 Dashboard URL 仍可存取，這是嚴重的安全問題
- **重現步驟**:
  1. 登入系統
  2. 進入 Dashboard
  3. 點擊登出
  4. 在網址列輸入 `/dashboard`
  5. 觀察是否可存取
- **預期**: 應導向登入頁，顯示「請先登入」
- **實際**: 仍可存取 Dashboard，且資料正常顯示
- **建議修正**:
  - 檢查 authentication middleware
  - 確保登出後 token 失效
  - 前端路由加入 auth guard

---

## ✅ 通過的測試

### 功能測試
- ✅ WP001: 登入功能 (除錯誤訊息語言外)
- ✅ WP003: 密碼重設功能
- ✅ WP004: 個人資料功能
- ✅ WP006: Session 管理

### E2E 流程測試
- ✅ 完整認證流程
- ✅ 密碼重設流程
- ✅ Session 過期處理
- ✅ 多裝置登入

### UI/UX 測試
- ✅ 視覺設計
- ✅ 互動體驗 (9/10)
- ✅ 回應式設計

### 效能測試
- ✅ 載入速度
- ✅ 操作流暢度
- ✅ 資源使用

### 安全性測試
- ✅ 輸入驗證
- ✅ XSS 防護
- ✅ SQL Injection 防護
- ⚠️  存取控制有問題（見問題 #3）

---

## 📝 測試備註

### 優點
- 整體 UI/UX 設計良好，操作直覺
- 效能表現優秀，載入速度快
- 大部分功能運作正常
- 安全性防護到位（除存取控制）

### 需要改進
- 錯誤訊息需要中文化
- 註冊流程可以更流暢
- **存取控制需要立即修正（Critical）**

---

## 🎯 測試結論

**狀態**: ❌ **UAT 未通過**

**原因**:
- 發現 1 個 🔴 Critical 問題（登出後仍可存取 Dashboard）
- 發現 1 個 🟡 Warning 問題（註冊後未自動登入）
- 發現 1 個 🟢 Minor 問題（錯誤訊息語言）

**建議**:
1. **立即修正**: 問題 #3（Critical - 存取控制）
2. **優先修正**: 問題 #2（Warning - 自動登入）
3. **可稍後修正**: 問題 #1（Minor - 訊息中文化）

**下一步**:
1. 開發團隊修正問題 #3 和 #2
2. 重新執行 `/speckit.uat --prepare-env`
3. 重新測試修正的功能
4. 確認通過後執行 `/speckit.deploy`

---

**測試人員**: [NAME]
**測試時間**: [DURATION]
**報告生成**: [TIMESTAMP]

---

**生成工具**: SpecKit V2 - `/speckit.uat --report`
```

## Execution: Mode 4 (Stop Test Environment)

```bash
/speckit.uat --stop
```

**Steps**:

```bash
echo "🛑 停止測試環境..."

# Stop based on target
case "$TARGET" in
  static-html*)
    # Stop HTTP server
    if [ -f "uat/server.pid" ]; then
      PID=$(cat uat/server.pid)
      kill $PID 2>/dev/null
      rm uat/server.pid
      echo "✅ HTTP server stopped"
    fi
    ;;

  gcp-cloud-run|docker-compose*)
    # Stop Docker containers
    docker-compose -f uat/docker-compose.yml down
    echo "✅ Docker containers stopped"
    ;;

  desktop-app-electron)
    # Stop Electron
    if [ -f "uat/electron.pid" ]; then
      PID=$(cat uat/electron.pid)
      kill $PID 2>/dev/null
      rm uat/electron.pid
      echo "✅ Electron app stopped"
    fi
    ;;
esac

echo ""
echo "✅ 測試環境已清理"
```

## Execution: Mode 5 (View Status)

```bash
/speckit.uat --status
```

**Display**:

```
📊 UAT 測試狀態

測試環境: [Running / Stopped]
測試清單: uat/test-checklist.md [Generated / Not found]
測試報告: uat/uat-report.md [Completed / Pending]

最近測試:
- 日期: 2025-01-15
- 測試人員: John
- 結論: ❌ 未通過
- 問題數: 3 (1 Critical, 1 Warning, 1 Minor)

下一步:
- 修正 Critical 問題
- 重新執行 UAT
```

## UAT Directory Structure

```
uat/
├── test-checklist.md           # 測試清單（自動生成）
├── uat-report.md               # 測試報告（互動生成）
├── environment-info.md         # 環境資訊
├── docker-compose.yml          # Docker 測試環境（如果需要）
├── seed-test-data.sh           # 測試資料腳本
├── server.pid                  # HTTP server PID（runtime）
├── electron.pid                # Electron PID（runtime）
├── server.log                  # Server logs（runtime）
└── screenshots/                # 測試截圖
    ├── issue-1.png
    ├── issue-2.png
    └── ...
```

## Template References

- Test checklist template: `.specify/templates/uat/test-checklist-template.md`
- UAT report template: `.specify/templates/uat/uat-report-template.md`
- Environment info template: `.specify/templates/uat/environment-info-template.md`

## Integration with Other Commands

### Before UAT

```bash
/speckit.test --integration
# → Must pass before UAT
```

### After UAT

```bash
/speckit.uat --report
# → If passed ✅

/speckit.deploy
# → Prepare deployment

./deployment/build.sh
# → Build for production
```

## Summary

`/speckit.uat` 提供：

1. **快速啟動** - 根據部署目標快速啟動測試環境
2. **自動生成** - 從 spec 自動生成測試清單
3. **互動記錄** - 互動式記錄測試結果
4. **品質把關** - 確保人工驗證通過才部署

讓人工測試變得結構化、可追蹤、高效率。
