# Claude 專案指引

## 核心原則

**最重要：與用戶溝通時一律使用繁體中文。**

可以使用英文進行內部思考和程式碼開發，但所有與用戶的對話、說明、回應都必須使用繁體中文。

---

## Git 工作流程

### 分支策略

**主分支**:
- `main` - 穩定的生產版本

**開發分支**:
- `develop` - 整合分支（所有 WP 最終合併到這裡）

**Work Package 分支**:
- `wp/WP001-login-feature` - 每個 WP 有自己的分支
- `wp/WP002-register-feature`
- `wp/WP003-reset-password`
- ... (每個 WP 一個分支)

**整合分支**:
- `integration/auth` - 整合測試分支（整合多個相關 WP）

---

### 每個 Work Package 的 Git 流程

當你執行 `/speckit.implement WP001/task-001` 時，AI 應該：

#### 1. 建立 WP 分支（如果還不存在）
```bash
# 從 develop 分支建立新的 WP 分支
git checkout develop
git pull origin develop
git checkout -b wp/WP001-login-feature
```

#### 2. 在 WP 分支上開發
```bash
# 執行開發工作
# 寫程式碼、寫測試...

# 定期 commit（每完成一個 task）
git add .
git commit -m "WP001: 完成 task-001 - 撰寫登入功能測試

- 新增登入 API 測試
- 新增登入 UI 測試
- 測試覆蓋率: 85%

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 3. 推送到遠端
```bash
# 每完成一個 task 就推送
git push -u origin wp/WP001-login-feature
```

#### 4. 驗證通過後，準備合併
```bash
# 當 /speckit.verify --wp WP001 通過後
# 推送最終版本
git push origin wp/WP001-login-feature
```

---

### 整合階段的 Git 流程

當執行 `/speckit.integrate` 時：

#### 1. 建立整合分支
```bash
# 從 develop 建立整合分支
git checkout develop
git pull origin develop
git checkout -b integration/auth
```

#### 2. 合併所有相關的 WP 分支
```bash
# 合併所有認證相關的 WP
git merge wp/WP001-login-feature --no-ff -m "整合: 合併 WP001 登入功能"
git merge wp/WP002-register-feature --no-ff -m "整合: 合併 WP002 註冊功能"
git merge wp/WP003-reset-password --no-ff -m "整合: 合併 WP003 密碼重設"
# ...
```

#### 3. 執行整合和整合測試
```bash
# 整合程式碼（合併重複元件等）
# /speckit.integrate --full 已執行

# Commit 整合後的變更
git add .
git commit -m "整合: 完成認證模組整合

- 合併 4 個共用元件 (Button, Input, Card, Modal)
- 解決 2 個命名衝突
- 建立統一的目錄結構
- 所有整合測試通過

整合報告: integration/integration-report.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 4. 推送整合分支
```bash
git push -u origin integration/auth
```

#### 5. 建立 Pull Request
```bash
# 使用 gh CLI 建立 PR
gh pr create --base develop --head integration/auth --title "整合: 認證模組 (WP001-WP003)" --body "$(cat <<'EOF'
## 整合摘要

本 PR 整合了以下 Work Packages:
- WP001: 登入功能
- WP002: 註冊功能
- WP003: 密碼重設功能

## 整合內容

### 合併的元件
- Button (4 個版本 → 1 個共用元件)
- Input (3 個版本 → 1 個共用元件)
- Card (2 個版本 → 1 個共用元件)

### 解決的衝突
- FormValidator → LoginFormValidator / RegisterFormValidator

### 測試結果
- 個別 WP 測試: ✅ 3/3 通過
- E2E 流程測試: ✅ 8/8 通過
- 整合測試覆蓋率: 87%

## 相關文件
- 整合報告: `integration/integration-report.md`
- 測試報告: `integration/integration-test-report.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### 6. PR 審核通過後，合併到 develop
```bash
# 合併到 develop（通常透過 GitHub UI）
# 或使用 CLI
gh pr merge --merge
```

---

### 最終合併到 main

當 develop 分支穩定且準備發布時：

```bash
# 從 develop 建立 release 分支
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 執行最終驗證
/speckit.verify --final

# 合併到 main
git checkout main
git pull origin main
git merge release/v1.0.0 --no-ff -m "發布: v1.0.0 認證模組"

# 打標籤
git tag -a v1.0.0 -m "Release v1.0.0: 認證模組

功能:
- 使用者登入
- 使用者註冊
- 密碼重設

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

# 推送
git push origin main
git push origin v1.0.0

# 也推送回 develop
git checkout develop
git merge main
git push origin develop
```

---

## AI 執行 Git 指令的規則

### 何時自動 commit

AI 應該在以下時機自動 commit:

1. **完成一個 task** - `/speckit.implement WP001/task-001` 完成後
2. **驗證通過** - `/speckit.verify --wp WP001` 通過後
3. **修正完成** - `/speckit.fix` 成功修正後
4. **整合完成** - `/speckit.integrate --full` 完成後

### Commit 訊息格式

```
[類型]: [簡短描述]

[詳細說明]
- [變更項目 1]
- [變更項目 2]

[相關資訊]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**類型**:
- `WP001` - Work Package 開發
- `整合` - 整合工作
- `修正` - Bug 修正
- `文件` - 文件更新
- `測試` - 測試相關

### 何時推送

AI 應該在以下時機自動推送:

1. **每次 commit 後** - 確保工作即時備份到 GitHub
2. **使用者明確要求時**

### 推送指令

```bash
# 如果是第一次推送該分支
git push -u origin [branch-name]

# 後續推送
git push origin [branch-name]
```

---

## Git 最佳實踐

### 1. 永遠在 WP 分支上工作
- ❌ 不要直接在 develop 或 main 上開發
- ✅ 每個 WP 都在自己的分支上

### 2. 保持 commit 小而頻繁
- ✅ 每完成一個 task 就 commit
- ✅ 每次修正就 commit
- ❌ 不要累積太多變更才 commit

### 3. 定期推送
- ✅ 每次 commit 後就推送
- ✅ 確保工作備份到 GitHub
- ❌ 不要只在本地累積 commits

### 4. 使用有意義的分支名稱
- ✅ `wp/WP001-login-feature`
- ✅ `integration/auth`
- ❌ `feature1`, `test`, `temp`

### 5. 整合前先更新
```bash
# 在合併前，先更新 develop 的最新變更
git checkout wp/WP001-login-feature
git fetch origin
git rebase origin/develop
```

---

## 故障排除

### 如果 WP 分支有衝突

```bash
# 1. 更新 develop
git checkout develop
git pull origin develop

# 2. Rebase WP 分支
git checkout wp/WP001-login-feature
git rebase develop

# 3. 解決衝突後
git add .
git rebase --continue

# 4. 強制推送（因為 rebase 改變了歷史）
git push --force-with-lease origin wp/WP001-login-feature
```

### 如果需要放棄 WP 分支的變更

```bash
# 重新從 develop 開始
git checkout develop
git branch -D wp/WP001-login-feature
git checkout -b wp/WP001-login-feature
```
