---
description: Clean up temporary files and build artifacts from integration process.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command cleans up temporary files, test artifacts, and build outputs generated during the integration and testing process. It keeps important reports and documentation.

**Key principle**: Remove clutter while preserving essential records.

## Purpose

Cleanup solves:
- **Disk space**: Remove large test coverage reports and build artifacts
- **Repository cleanliness**: Remove temporary files before committing
- **CI/CD optimization**: Reduce artifact upload sizes
- **Developer experience**: Clean working directory

## Modes

### Mode 1: Standard Cleanup (Default)

```bash
/speckit.cleanup
```

Removes:
- Test coverage reports (HTML, JSON)
- Build artifacts (dist/, build/)
- Test cache (`.test-cache`, `pytest_cache`)
- Temporary logs
- Node modules cache (optional)

Keeps:
- All `.md` reports (integration-report.md, integration-test-report.md, etc.)
- Journal files (integration-journal.md)
- Diagnosis reports (integration-diagnosis-report.md)
- Contract files (contract-expected.yaml, contract-implementation.yaml)

### Mode 2: Deep Cleanup

```bash
/speckit.cleanup --deep
```

Also removes:
- All `node_modules/` (requires re-install later)
- All `__pycache__/` and `.pyc` files
- All `.cargo/` build caches
- All IDE caches (`.vscode/`, `.idea/`)

### Mode 3: Aggressive Cleanup (Dangerous)

```bash
/speckit.cleanup --aggressive
```

Removes everything including reports (use before starting fresh):
- All test and integration reports
- All journal files
- All contract-implementation.yaml (keeps contract-expected.yaml)
- All analysis files

**⚠️  Warning**: This is destructive. Only use when starting a new integration cycle.

### Mode 4: Dry Run

```bash
/speckit.cleanup --dry-run
```

Shows what would be deleted without actually deleting.

## Execution: Mode 1 (Standard Cleanup)

### Step 1: Setup

Parse arguments and locate paths:

```bash
# Get paths from prerequisites script
source .specify/scripts/bash/check-prerequisites.sh
# Returns: FEATURE_DIR, INTEGRATION_DIR, SPEC_FILE, etc.
```

### Step 2: Identify Files to Remove

Scan for temporary files:

#### Category 1: Test Coverage Reports

```bash
# Coverage directories
coverage/
htmlcov/
.nyc_output/
.coverage
coverage.xml
coverage-summary.json

# Language-specific coverage
lcov.info           # JavaScript
coverage.json       # JavaScript
.tox/               # Python
target/debug/       # Rust
target/release/     # Rust
```

#### Category 2: Build Artifacts

```bash
# JavaScript/TypeScript
dist/
build/
out/
.next/
.nuxt/
.output/

# Python
build/
dist/
*.egg-info/
.eggs/

# Rust
target/

# Go
bin/
pkg/
```

#### Category 3: Test Cache

```bash
# Jest
.jest-cache/

# Pytest
.pytest_cache/
__pycache__/
*.pyc
*.pyo

# Vitest
.vitest/

# General
.test-cache/
.tmp/
tmp/
```

#### Category 4: Log Files

```bash
# Test logs
integration/integration-test-log.txt
*.log

# Build logs
npm-debug.log
yarn-error.log
pnpm-debug.log
```

#### Category 5: OS and IDE Files (Optional)

```bash
.DS_Store
Thumbs.db
*.swp
*.swo
*~
```

### Step 3: Calculate Space to Reclaim

Before deleting, show user how much space will be freed:

```bash
# Calculate total size
TOTAL_SIZE=0
for dir in coverage/ dist/ build/ .pytest_cache/ .jest-cache/ node_modules/.cache/; do
  if [ -d "$dir" ]; then
    SIZE=$(du -sh "$dir" | cut -f1)
    echo "  $dir: $SIZE"
    TOTAL_SIZE=$((TOTAL_SIZE + $(du -sk "$dir" | cut -f1)))
  fi
done

echo "Total space to reclaim: $(echo "$TOTAL_SIZE" | awk '{print $1/1024 "MB"}')"
```

Output:

```
📦 Cleanup Preview

Files to remove:
├─ coverage/: 45MB
├─ dist/: 12MB
├─ .pytest_cache/: 2MB
├─ .jest-cache/: 8MB
├─ integration/integration-test-log.txt: 1.5MB
└─ *.log files: 0.5MB

Total space to reclaim: 69MB

Files to keep:
├─ integration/integration-report.md
├─ integration/integration-test-report.md
├─ integration/integration-diagnosis-report.md
├─ integration/integration-journal.md
├─ integration/integration-analysis.md
└─ All work-packages/**/*.md files
```

### Step 4: Confirm with User

```bash
是否繼續清理? (y/n)
```

If user says no, exit.

If `--force` flag provided, skip confirmation.

### Step 5: Remove Files

```bash
# Remove coverage
echo "🗑️  Removing coverage reports..."
rm -rf coverage/ htmlcov/ .nyc_output/ .coverage coverage.xml

# Remove build artifacts
echo "🗑️  Removing build artifacts..."
rm -rf dist/ build/ out/ .next/

# Remove test cache
echo "🗑️  Removing test cache..."
rm -rf .jest-cache/ .pytest_cache/ __pycache__/ .vitest/

# Remove logs
echo "🗑️  Removing log files..."
rm -f integration/integration-test-log.txt
rm -f npm-debug.log yarn-error.log pnpm-debug.log
find . -name "*.log" -type f -delete

# Remove OS files (optional)
echo "🗑️  Removing OS temporary files..."
find . -name ".DS_Store" -type f -delete
find . -name "*.swp" -type f -delete
```

### Step 6: Verify Important Files Remain

```bash
# Check that important files still exist
IMPORTANT_FILES=(
  "integration/integration-report.md"
  "integration/integration-journal.md"
  "integration/integration-analysis.md"
)

for file in "${IMPORTANT_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  Warning: Expected file missing: $file"
  fi
done
```

### Step 7: Update Journal

Append to: `integration/integration-journal.md`

```markdown
### [2025-01-15 19:00] Cleanup

**Action**: `/speckit.cleanup`

**Files Removed**:
- coverage/ (45MB)
- dist/ (12MB)
- .pytest_cache/ (2MB)
- .jest-cache/ (8MB)
- *.log files (2MB)

**Space Reclaimed**: 69MB

**Files Preserved**:
- All integration reports
- All journal files
- All contract files
- All work package documentation

**Status**: ✅ Cleanup completed

---
```

### Step 8: Report Results

```
✅ Cleanup completed!

Removed:
├─ 📊 Coverage reports (45MB)
├─ 🏗️  Build artifacts (12MB)
├─ 💾 Test cache (10MB)
└─ 📝 Log files (2MB)

Total space reclaimed: 69MB

Preserved:
├─ 📋 All integration reports
├─ 📔 All journal files
└─ 📄 All contract files

Working directory is clean! ✨
```

## Execution: Mode 2 (Deep Cleanup)

```bash
/speckit.cleanup --deep
```

Additional removals:

```bash
# Remove node_modules
echo "🗑️  Removing node_modules..."
rm -rf node_modules/

# Remove Python virtual environments
echo "🗑️  Removing virtual environments..."
rm -rf venv/ .venv/ env/

# Remove Cargo cache
echo "🗑️  Removing Cargo cache..."
rm -rf target/

# Remove IDE caches
echo "🗑️  Removing IDE caches..."
rm -rf .vscode/.cache/ .idea/
```

Output:

```
✅ Deep cleanup completed!

Removed:
├─ 📊 Coverage reports (45MB)
├─ 🏗️  Build artifacts (12MB)
├─ 💾 Test cache (10MB)
├─ 📝 Log files (2MB)
├─ 📦 node_modules/ (450MB)
├─ 🐍 Virtual environments (120MB)
└─ 🦀 Cargo cache (230MB)

Total space reclaimed: 869MB

⚠️  Note: You will need to reinstall dependencies:
- npm install
- pip install -r requirements.txt
- cargo build
```

## Execution: Mode 3 (Aggressive Cleanup)

```bash
/speckit.cleanup --aggressive
```

**⚠️  Extra confirmation required**:

```
⚠️  AGGRESSIVE CLEANUP MODE

This will remove:
- All integration reports
- All journal files
- All contract-implementation.yaml files
- All test results
- All build artifacts

This is IRREVERSIBLE.

Only use this when starting a fresh integration cycle.

Type "DELETE" to confirm:
```

User must type "DELETE" exactly to proceed.

Then remove:

```bash
# Remove all integration files
rm -rf integration/

# Remove all contract-implementation.yaml
find . -name "contract-implementation.yaml" -type f -delete

# Remove all verification reports
find . -name "verification-report.md" -type f -delete

# Remove all diagnosis reports
find . -name "diagnosis-report.md" -type f -delete

# Keep: contract-expected.yaml, requirements.md, journal.md (in work-packages/)
```

## Execution: Mode 4 (Dry Run)

```bash
/speckit.cleanup --dry-run
```

Show what would be deleted, but don't actually delete:

```
🔍 Dry Run Mode (no files will be deleted)

Would remove:
├─ coverage/ (45MB)
├─ dist/ (12MB)
├─ .pytest_cache/ (2MB)
├─ .jest-cache/ (8MB)
├─ integration/integration-test-log.txt (1.5MB)
└─ *.log files (0.5MB)

Total space that would be reclaimed: 69MB

Would preserve:
├─ integration/integration-report.md
├─ integration/integration-test-report.md
├─ integration/integration-diagnosis-report.md
├─ integration/integration-journal.md
└─ All work-packages/**/*.md files

To actually delete these files, run:
  /speckit.cleanup
```

## Selective Cleanup

### Clean Only Coverage

```bash
/speckit.cleanup --coverage-only
```

Removes only coverage reports, keeps everything else.

### Clean Only Build Artifacts

```bash
/speckit.cleanup --build-only
```

Removes only build artifacts (dist/, build/), keeps everything else.

### Clean Only Logs

```bash
/speckit.cleanup --logs-only
```

Removes only log files, keeps everything else.

## Safety Features

### 1. Protected Files

These files are NEVER deleted (even in aggressive mode):

```bash
# Core specification files
requirements.md
design-spec.yaml
contract-expected.yaml
visual-spec/

# Templates
.specify/templates/

# Scripts
.specify/scripts/

# Commands
.claude/commands/
```

### 2. Git-Ignored Files Only

By default, only remove files that are in `.gitignore`:

```bash
# Check if file is git-ignored before deleting
if git check-ignore -q "$file"; then
  rm -rf "$file"
else
  echo "⚠️  Skipping $file (not in .gitignore)"
fi
```

This prevents accidentally deleting important files.

### 3. Backup Before Aggressive Cleanup

If using `--aggressive`, create backup first:

```bash
BACKUP_DIR=".specify/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup integration directory
cp -r integration/ "$BACKUP_DIR/integration/"

echo "📦 Backup created: $BACKUP_DIR"
```

User can restore with:

```bash
/speckit.cleanup --restore "$BACKUP_DIR"
```

## Integration with CI/CD

In CI pipelines, use cleanup to save artifact space:

```yaml
# .github/workflows/integration.yml
- name: Run Integration Tests
  run: /speckit.test --integration

- name: Upload Reports (before cleanup)
  uses: actions/upload-artifact@v2
  with:
    name: integration-reports
    path: |
      integration/*.md
      work-packages/**/verification-report.md

- name: Cleanup
  run: /speckit.cleanup --force
```

## Error Handling

- If file deletion fails: WARN "Failed to delete X" + continue
- If protected file would be deleted: ERROR "Cannot delete protected file"
- If running as root: WARN "Running as root - be careful!"
- If disk space check fails: WARN "Could not calculate disk space"

## Context for Cleanup

User-provided context: $ARGUMENTS

Use this to:
- Customize cleanup scope (e.g., "only remove coverage")
- Skip certain categories if requested
- Set custom thresholds (e.g., "only if > 100MB")

## Example Usage

### After Integration Testing

```bash
# Run integration tests
/speckit.test --integration

# Tests pass, cleanup temporary files
/speckit.cleanup
# → Removes coverage, build artifacts, logs
# → Keeps all reports and documentation

# Continue with verification
/speckit.verify --final
```

### Before Committing

```bash
# Clean up before git commit
/speckit.cleanup --dry-run
# → Check what will be removed

/speckit.cleanup --force
# → Remove temporary files

git add .
git commit -m "feat: integration complete"
```

### Starting Fresh

```bash
# Failed integration, want to start over
/speckit.cleanup --aggressive
# → Removes all integration files
# → Start from scratch

/speckit.analyze
/speckit.integrate --full
```

## Post-Cleanup Verification

After cleanup, verify repository state:

```bash
# Check git status
git status

# Verify no tracked files were deleted
git diff --name-only

# Verify important files still exist
ls -la integration/integration-report.md
ls -la integration/integration-journal.md
```

## Template References

- Journal template: `.specify/templates/integration-journal-template.md`

## Summary

The cleanup command provides three levels:

1. **Standard** (`/speckit.cleanup`): Remove temp files, keep reports
2. **Deep** (`/speckit.cleanup --deep`): Also remove dependencies
3. **Aggressive** (`/speckit.cleanup --aggressive`): Remove everything, start fresh

Always use `--dry-run` first if unsure!
