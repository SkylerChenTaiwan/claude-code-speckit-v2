# UAT 測試環境資訊

**生成時間**: {{TIMESTAMP}}
**專案**: {{PROJECT_NAME}}
**版本**: {{VERSION}}

---

## 🎯 部署目標

**Target**: {{DEPLOYMENT_TARGET}}

這個測試環境模擬 {{DEPLOYMENT_TARGET}} 的配置。

---

## 🌐 環境 URL

{{#if IS_WEB_APP}}
**主要 URL**: {{TEST_URL}}

**API Endpoint**: {{API_URL}}

**健康檢查**: {{HEALTH_CHECK_URL}}
{{/if}}

{{#if IS_DESKTOP_APP}}
**應用程式**: Electron App Window

**開發模式**: 是（快速啟動）
{{/if}}

---

## 🗄️  資料庫

{{#if HAS_DATABASE}}
**類型**: {{DB_TYPE}}
**Host**: {{DB_HOST}}
**Port**: {{DB_PORT}}
**Database**: {{DB_NAME}}
**用戶**: {{DB_USER}}

**連線字串** (測試用):
```
{{DB_CONNECTION_STRING}}
```

**測試資料**: {{TEST_DATA_STATUS}}
{{else}}
無資料庫（純前端應用）
{{/if}}

---

## 🔐 測試帳號

### 管理員帳號
- Email: `admin@test.com`
- Password: `Admin123!`

### 一般用戶帳號
- Email: `user@test.com`
- Password: `User123!`

### 測試用帳號
- Email: `test@test.com`
- Password: `Test123!`

**注意**: 這些帳號僅用於測試環境，請勿用於生產環境。

---

## 🔧 環境變數

```bash
NODE_ENV={{NODE_ENV}}
PORT={{PORT}}
DATABASE_URL={{DATABASE_URL}}
API_BASE_URL={{API_BASE_URL}}
LOG_LEVEL={{LOG_LEVEL}}
```

---

## 📦 服務狀態

{{#each SERVICES}}
### {{SERVICE_NAME}}

- **狀態**: {{STATUS}}
- **URL**: {{URL}}
- **健康檢查**: {{HEALTH_CHECK}}
- **日誌**: {{LOG_FILE}}

{{/each}}

---

## 🐳 容器資訊（如果使用 Docker）

{{#if USING_DOCKER}}
**Docker Compose File**: `uat/docker-compose.yml`

**執行中的容器**:
```bash
docker-compose -f uat/docker-compose.yml ps
```

**查看日誌**:
```bash
# 所有服務
docker-compose -f uat/docker-compose.yml logs -f

# 特定服務
docker-compose -f uat/docker-compose.yml logs -f {{SERVICE_NAME}}
```

**重啟服務**:
```bash
docker-compose -f uat/docker-compose.yml restart {{SERVICE_NAME}}
```
{{/if}}

---

## 📊 監控

### 即時日誌

{{#if IS_WEB_APP}}
**Server 日誌**:
```bash
tail -f uat/server.log
```
{{/if}}

{{#if IS_DESKTOP_APP}}
**Electron 日誌**:
```bash
tail -f uat/electron.log
```
{{/if}}

### 效能監控

**CPU/Memory**:
```bash
# macOS
top -pid $(cat uat/{{PID_FILE}})

# Linux
htop -p $(cat uat/{{PID_FILE}})
```

### 網路監控

**查看 API 請求** (Chrome DevTools):
1. 開啟 Developer Tools (F12)
2. 切換到 Network tab
3. 執行操作
4. 觀察 API 請求和回應

---

## 🔍 除錯工具

### 瀏覽器 DevTools（Web App）

**開啟方式**: F12 或 右鍵 → 檢查

**常用 tabs**:
- **Console**: 查看 JavaScript 錯誤和 log
- **Network**: 查看 API 請求
- **Application**: 查看 localStorage, cookies
- **Performance**: 分析效能問題

### Electron DevTools（Desktop App）

**開啟方式**:
- macOS: `Cmd + Option + I`
- Windows/Linux: `Ctrl + Shift + I`

或在 app 選單: View → Toggle Developer Tools

### 資料庫除錯

{{#if HAS_DATABASE}}
**連線資料庫**:
```bash
# PostgreSQL
psql -h {{DB_HOST}} -p {{DB_PORT}} -U {{DB_USER}} -d {{DB_NAME}}

# MySQL
mysql -h {{DB_HOST}} -P {{DB_PORT}} -u {{DB_USER}} -p{{DB_PASSWORD}} {{DB_NAME}}
```

**查看資料**:
```sql
-- 查看所有 users
SELECT * FROM users;

-- 查看最近的記錄
SELECT * FROM logs ORDER BY created_at DESC LIMIT 10;
```
{{/if}}

---

## 🔄 重新啟動環境

如果遇到問題需要重新啟動：

```bash
# 停止環境
/speckit.uat --stop

# 重新啟動
/speckit.uat --prepare-env
```

---

## 🌱 重新載入測試資料

```bash
./uat/seed-test-data.sh
```

這會：
1. 清空測試資料庫
2. 重新建立 schema
3. 載入範例資料

---

## ❓ 常見問題

### 無法連線到測試環境

**檢查服務是否運行**:
```bash
# 檢查 process
ps aux | grep {{PROCESS_NAME}}

# 檢查 port 是否被佔用
lsof -i :{{PORT}}
```

**解決方法**:
```bash
# 重新啟動
/speckit.uat --stop
/speckit.uat --prepare-env
```

### 資料庫連線失敗

**檢查資料庫狀態**:
```bash
{{#if USING_DOCKER}}
docker-compose -f uat/docker-compose.yml ps db
{{else}}
# 檢查本地資料庫服務
brew services list  # macOS
systemctl status postgresql  # Linux
{{/if}}
```

### 測試資料遺失

**重新載入**:
```bash
./uat/seed-test-data.sh
```

### 環境變數錯誤

**檢查環境變數**:
```bash
# 查看當前環境變數
env | grep {{PROJECT_NAME}}

# 或檢查 .env 檔案
cat .env.test
```

---

## 📞 需要協助？

如果遇到無法解決的問題：

1. 查看詳細日誌: `cat uat/server.log` 或 `uat/electron.log`
2. 查看測試清單: `uat/test-checklist.md`
3. 檢查部署配置: `design-spec.yaml` → `deployment` 區塊

---

**生成工具**: SpecKit V2 - `/speckit.uat --prepare-env`
**生成時間**: {{TIMESTAMP}}
