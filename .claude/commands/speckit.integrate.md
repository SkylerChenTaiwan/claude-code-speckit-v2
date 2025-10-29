---
description: 整合所有 Work Packages，合併重複元件並解決命名衝突。
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

此指令執行實際的整合工作:
- 合併重複的元件和工具函數
- 解決命名衝突
- 建立統一的目錄結構
- 更新所有 import 路徑

這是整合階段的核心步驟，基於 `/speckit.analyze` 的分析結果。

## Modes

### Mode 1: Dry Run（預覽模式）

```bash
/speckit.integrate --dry-run
```

預覽整合結果，但不實際修改檔案。用於確認整合策略正確。

### Mode 2: Auto Mode（自動模式）

```bash
/speckit.integrate --auto
```

只執行相似度 ≥ 90% 的自動合併，跳過需要人工決策的項目。

### Mode 3: Full Mode（完整模式）

```bash
/speckit.integrate --full
```

執行完整整合，包括所有自動合併和已決策的手動項目。

### Mode 4: Custom Mode（自訂模式）

```bash
/speckit.integrate --custom --include "Card" --exclude "validateInput"
```

自訂要合併和不合併的項目。

## Execution Steps

### Step 1: Setup and Load Analysis

```bash
# Run prerequisite check
.specify/scripts/bash/check-prerequisites.sh --json --paths-only
```

Parse JSON output for `FEATURE_DIR`.

**Load analysis report**:
- Read `FEATURE_DIR/integration/integration-analysis.md`
- Extract auto-merge list
- Extract manual-decision list
- Extract conflict list

If analysis report missing: ERROR "Run /speckit.analyze first"

### Step 2: Determine Integration Strategy

Based on mode:

**--dry-run**:
- Plan all changes
- Output what would happen
- Don't modify any files

**--auto**:
- Execute only items with similarity ≥ 90%
- Skip manual-decision items
- Execute conflict resolutions (renaming)

**--full**:
- Execute all auto-merge items
- For manual-decision items, use default strategy (merge if similarity ≥ 75%)
- Execute all conflict resolutions

**--custom**:
- Use `--include` and `--exclude` flags to control

### Step 3: Create Integration Directory Structure

Create directory:
```bash
mkdir -p integration/
```

Create journal file:
```bash
cp .specify/templates/integration-journal-template.md \
   integration/integration-journal.md
```

### Step 4: Execute Integration

整合分為 4 個階段，按順序執行。

#### Phase 1: 建立共用檔案

**For each item in auto-merge list**:

1. **選擇最完整的版本作為基礎**

Example (Button component):
```typescript
// WP001: Button (48 lines) - basic
// WP002: Button (52 lines) - has loading prop
// WP003: Button (45 lines) - basic
// WP005: Button (50 lines) - has disabled state

// Choose WP002 as base (most complete)
```

2. **合併所有 props/features from other versions**

```typescript
// Final merged Button
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger';  // from all
  variant?: 'solid' | 'outlined' | 'text';   // from WP003
  size?: 'small' | 'medium' | 'large';       // from WP005
  loading?: boolean;                          // from WP002
  disabled?: boolean;                         // from WP005
  onClick?: (e: React.MouseEvent) => void;   // from all
  children: React.ReactNode;                 // from all
}
```

3. **Create merged file in src/shared/**

```bash
# Create file
cat > src/shared/components/Button.tsx << 'EOF'
[merged component code]
EOF

# Create test file (merge all tests)
cat > src/shared/components/Button.test.tsx << 'EOF'
[merged test code]
EOF
```

4. **Record the merge**

Append to `integration/integration-journal.md`:
```markdown
## [TIMESTAMP] - 合併 Button 元件

來源:
- WP001/components/Button.tsx (48 行)
- WP002/components/Button.tsx (52 行)
- WP003/components/Button.tsx (45 行)
- WP005/components/Button.tsx (50 行)

目標:
- src/shared/components/Button.tsx (78 行)
- src/shared/components/Button.test.tsx (156 行)

策略: 以 WP002 為基礎，合併所有 props

變更:
- 新增 variant prop (from WP003)
- 新增 size prop (from WP005)
- 保留 loading prop (from WP002)
- 統一 event handlers
```

#### Phase 2: 重新組織功能模組

**For each Work Package**:

1. **Move WP code to src/features/**

```bash
# WP001 (Login Feature)
mkdir -p src/features/auth/login
mv work-packages/WP001/components/* src/features/auth/login/
mv work-packages/WP001/services/* src/features/auth/login/

# WP002 (Register Feature)
mkdir -p src/features/auth/register
mv work-packages/WP002/components/* src/features/auth/register/
```

2. **Resolve naming conflicts**

```bash
# FormValidator conflict
mv src/features/auth/login/FormValidator.ts \
   src/features/auth/login/LoginFormValidator.ts

mv src/features/auth/register/FormValidator.ts \
   src/features/auth/register/RegisterFormValidator.ts
```

3. **Update exports**

Create/update `src/features/auth/index.ts`:
```typescript
// Export all auth features
export * from './login';
export * from './register';
export * from './reset-password';
export * from './logout';
```

#### Phase 3: 更新 Import 路徑

**Scan all files for old imports**:

```bash
# Find all files that import Button
grep -r "from '\./.*Button'" src/
```

**For each file with old import**:

```typescript
// Before
import { Button } from './components/Button';
import { Input } from '../../WP001/components/Input';

// After
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
```

**Update using sed or programmatic replacement**:

```bash
# Example for TypeScript
find src/ -name "*.tsx" -o -name "*.ts" | while read file; do
  sed -i "s|from '\./.*Button'|from '@/shared/components/Button'|g" "$file"
  sed -i "s|from '\./.*Input'|from '@/shared/components/Input'|g" "$file"
done
```

**Record all changes**:
- File path
- Old import
- New import
- Line number

#### Phase 4: 刪除重複檔案

**For each merged item**:

1. **Delete source files from WPs**

```bash
# Delete Button from all WPs
rm work-packages/WP001/components/Button.tsx
rm work-packages/WP002/components/Button.tsx
rm work-packages/WP003/components/Button.tsx
rm work-packages/WP005/components/Button.tsx
```

2. **Keep work-packages/ as archive**

Don't delete the work-packages/ directory itself (keep as history).

### Step 5: Load Integration Report Template

```bash
cat .specify/templates/integration-report-template.md
```

### Step 6: Generate Integration Report

Create `FEATURE_DIR/integration/integration-report.md` using template.

Fill in:
1. **整合統計**:
   - 合併的元件數
   - 合併的工具函數數
   - 解決的衝突數
   - 建立的檔案數
   - 更新的 import 數
   - 刪除的檔案數
   - 節省的程式碼行數

2. **檔案變更**:
   - 新建的共用檔案列表
   - 重新組織的功能模組
   - 刪除的重複檔案

3. **Import 路徑更新**:
   - 更新的檔案清單
   - 舊路徑 → 新路徑對照表

4. **命名衝突解決**:
   - 衝突的檔案
   - 重新命名策略
   - 受影響的檔案

5. **整合前後比較**:
   - 程式碼統計
   - 目錄結構變化

### Step 7: Validate Integration

**Run basic checks**:

1. **TypeScript compile** (if applicable):
```bash
npm run build
# or
tsc --noEmit
```

2. **Check for import errors**:
```bash
# Should be no "Cannot find module" errors
npm run lint
```

3. **Check for unused files**:
```bash
# Find files in src/ that are never imported
npx unimport
```

**If validation fails**:
- Report errors
- Suggest rollback
- Do NOT proceed to testing

### Step 8: Update Journal

Append to `integration/integration-journal.md`:

```markdown
## [TIMESTAMP] - 整合完成

執行模式: [--dry-run / --auto / --full / --custom]

### 統計
- 合併的元件: [X] 個
- 合併的工具函數: [Y] 個
- 解決的衝突: [Z] 個
- 更新的檔案: [A] 個

### 遇到的問題
[列出任何問題]

### 驗證結果
- TypeScript compile: [✅ / ❌]
- Lint: [✅ / ❌]
- No unused files: [✅ / ❌]
```

### Step 9: Report

Output to user:

```
整合完成 [✅ 成功 / ⚠️ 部分完成 / ❌ 失敗]

📊 統計:
- 合併的元件: 4 個
- 合併的工具函數: 3 個
- 解決的命名衝突: 2 個
- 建立的共用檔案: 8 個
- 更新的 import 路徑: 45 處
- 刪除的重複檔案: 19 個
- 節省的程式碼: 1,377 行 (16%)

📁 新結構:
src/
├── shared/
│   ├── components/ (4 個合併的元件)
│   └── utils/ (3 個合併的工具函數)
└── features/
    ├── auth/ (來自 WP001, WP002, WP003, WP005)
    └── profile/ (來自 WP004)

📋 報告位置:
integration/integration-report.md

⚠️ 警告:
- Card 元件未合併（保留各自實作）
- validateInput 未合併（功能差異太大）

下一步:
1. 查看報告確認整合正確
2. 執行 /speckit.test --integration 進行整合測試
3. 如有問題，執行 /speckit.fix-integration 修正
```

## Dry Run Output Example

When using `--dry-run`, output what would happen without actually doing it:

```
整合預覽（模擬模式）

將會執行以下操作：

📁 建立共用檔案:
✨ src/shared/components/Button.tsx (合併自 WP001, WP002, WP003, WP005)
✨ src/shared/components/Input.tsx (合併自 WP001, WP002, WP003)
✨ src/shared/utils/formatDate.ts (合併自 WP001, WP003, WP004)
✨ src/shared/utils/validateEmail.ts (合併自 WP001, WP002)

🔄 移動並重新命名:
♻️  work-packages/WP001/validators/FormValidator.ts
   → src/features/auth/login/LoginFormValidator.ts

♻️  work-packages/WP002/validators/FormValidator.ts
   → src/features/auth/register/RegisterFormValidator.ts

📝 更新 import 路徑:
🔄 src/features/auth/login/LoginPage.tsx (3 處)
🔄 src/features/auth/register/RegisterPage.tsx (2 處)
... (共 45 個檔案)

❌ 刪除重複檔案:
🗑️  work-packages/WP001/components/Button.tsx
🗑️  work-packages/WP002/components/Button.tsx
🗑️  work-packages/WP003/components/Button.tsx
🗑️  work-packages/WP005/components/Button.tsx
... (共 19 個檔案)

⚠️ 未處理項目（需要人工決策）:
- Card 元件 (相似度 75%)
- validateInput (相似度 68%)

✅ 預覽完成，無實際變更

如要執行整合，請執行:
/speckit.integrate --full
```

## Rollback Strategy

If integration fails or user wants to undo:

```bash
# Git is your friend
git checkout -- .
git clean -fd

# Or use the backup (if created)
/speckit.integrate --rollback
```

**Automatic backup** (recommended):
Before any modification, create a git commit or backup:

```bash
# Create backup branch
git checkout -b backup-pre-integration
git add .
git commit -m "Backup before integration"

# Return to main branch
git checkout -

# If need to rollback
git reset --hard backup-pre-integration
```

## Guidelines

### Merge Strategy Priority

1. **Prefer newer implementations** (higher WP number, assuming later = better)
2. **Prefer more complete implementations** (more props, more features)
3. **Prefer better tested implementations** (higher test coverage)
4. **Preserve all unique features** (union of all features)

### Import Path Updates

**Path alias setup** (if not already configured):

TypeScript (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/shared/*": ["src/shared/*"],
      "@/features/*": ["src/features/*"],
      "@/*": ["src/*"]
    }
  }
}
```

Webpack/Vite (`vite.config.ts`):
```typescript
export default {
  resolve: {
    alias: {
      '@': '/src',
      '@/shared': '/src/shared',
      '@/features': '/src/features'
    }
  }
}
```

### File Organization

**Recommended structure**:
```
src/
├── shared/              # Merged components and utilities
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts    # Export all
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── formatDate.test.ts
│   │   └── index.ts    # Export all
│   └── types/
│       └── common.ts   # Shared types
│
├── features/           # Feature modules (from WPs)
│   ├── auth/
│   │   ├── login/      # From WP001
│   │   ├── register/   # From WP002
│   │   └── index.ts    # Export all auth features
│   └── profile/        # From WP004
│       ├── ProfilePage.tsx
│       └── index.ts
│
└── api/
    └── routes/         # Aggregated API routes
        ├── auth.ts     # All auth routes
        └── users.ts    # All user routes
```

## Error Handling

- If analysis report missing: ERROR "Run /speckit.analyze first"
- If TypeScript compile fails: ERROR "Integration caused compile errors. See report"
- If file conflicts: ERROR "File already exists at target location"
- If git not initialized: WARN "No version control. Proceed without backup?"
- If work-packages/ missing: ERROR "No Work Packages found"

## Context for Integration

User-provided context: $ARGUMENTS

Use this context to guide integration (e.g., "be conservative", "prefer WP002 implementations", "keep all variants").
