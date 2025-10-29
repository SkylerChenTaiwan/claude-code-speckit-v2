---
description: Generate deployment configuration based on design specification.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command reads the `deployment` section from `design-spec.yaml` and generates deployment configurations, scripts, and documentation based on the specified deployment target.

**Key principle**: Deployment configuration is defined in spec, not hardcoded in tools.

## Purpose

This command provides:
- **Spec-driven deployment**: All deployment decisions documented in design-spec.yaml
- **Multi-target support**: Generate configs for any deployment target (static HTML, GCP, AWS, K8s, etc.)
- **Automation**: Generate Dockerfiles, CI/CD configs, deployment scripts automatically
- **Documentation**: Generate deployment guides specific to the target

## Modes

### Mode 1: Generate Deployment Config (Default)

```bash
/speckit.deploy
```

Reads `design-spec.yaml` and generates deployment files to `deployment/` directory.

### Mode 2: Preview Deployment Config

```bash
/speckit.deploy --preview
```

Shows what files would be generated without actually creating them.

### Mode 3: Specific Target Override

```bash
/speckit.deploy --target static-html-single-file
```

Override the target in design-spec.yaml (useful for testing different targets).

### Mode 4: Update Existing Deployment

```bash
/speckit.deploy --update
```

Update existing deployment files if design-spec.yaml changed.

## Execution: Mode 1 (Generate Deployment Config)

### Step 1: Setup

Locate paths:

```bash
# Get paths from prerequisites script
source .specify/scripts/bash/check-prerequisites.sh
# Returns: FEATURE_DIR, SPEC_FILE, etc.

DESIGN_SPEC="$FEATURE_DIR/design-spec.yaml"
DEPLOYMENT_DIR="$FEATURE_DIR/deployment"
```

Verify prerequisites:
- `design-spec.yaml` exists
- `deployment` section exists in design-spec.yaml
- If missing: ERROR "design-spec.yaml 沒有定義 deployment 區塊"

### Step 2: Read Deployment Configuration

Read and parse `design-spec.yaml`:

```bash
# Extract deployment section
TARGET=$(yq eval '.deployment.target' "$DESIGN_SPEC")

if [ -z "$TARGET" ] || [ "$TARGET" = "null" ]; then
  echo "❌ Error: design-spec.yaml 沒有定義 deployment.target"
  echo ""
  echo "請在 design-spec.yaml 加入 deployment 區塊："
  echo ""
  echo "deployment:"
  echo "  target: static-html-single-file  # 或其他支援的目標"
  echo ""
  exit 1
fi
```

### Step 3: Determine Deployment Strategy

Based on `deployment.target`, select generation strategy:

```bash
case "$TARGET" in
  static-html-single-file)
    echo "📦 部署目標: 靜態單一 HTML 檔案"
    generate_static_html_single_file
    ;;

  static-html-spa)
    echo "📦 部署目標: 靜態 SPA (多檔案)"
    generate_static_html_spa
    ;;

  gcp-cloud-run)
    echo "📦 部署目標: Google Cloud Run"
    generate_gcp_cloud_run
    ;;

  gcp-app-engine)
    echo "📦 部署目標: Google App Engine"
    generate_gcp_app_engine
    ;;

  aws-lambda-api-gateway)
    echo "📦 部署目標: AWS Lambda + API Gateway"
    generate_aws_lambda
    ;;

  aws-ecs)
    echo "📦 部署目標: AWS ECS"
    generate_aws_ecs
    ;;

  docker-compose-local)
    echo "📦 部署目標: Docker Compose (本地)"
    generate_docker_compose
    ;;

  kubernetes)
    echo "📦 部署目標: Kubernetes"
    generate_kubernetes
    ;;

  vercel)
    echo "📦 部署目標: Vercel"
    generate_vercel
    ;;

  netlify)
    echo "📦 部署目標: Netlify"
    generate_netlify
    ;;

  cloudflare-pages)
    echo "📦 部署目標: Cloudflare Pages"
    generate_cloudflare_pages
    ;;

  *)
    echo "❌ Error: 不支援的部署目標: $TARGET"
    echo ""
    echo "支援的部署目標："
    echo "  - static-html-single-file"
    echo "  - static-html-spa"
    echo "  - gcp-cloud-run"
    echo "  - gcp-app-engine"
    echo "  - aws-lambda-api-gateway"
    echo "  - aws-ecs"
    echo "  - docker-compose-local"
    echo "  - kubernetes"
    echo "  - vercel"
    echo "  - netlify"
    echo "  - cloudflare-pages"
    exit 1
    ;;
esac
```

### Step 4: Generate Deployment Files

Each `generate_*()` function:

1. Creates `deployment/` directory
2. Reads template from `.specify/templates/deployment/[target]/`
3. Fills template with values from `design-spec.yaml`
4. Writes files to `deployment/`
5. Makes scripts executable
6. Generates README with deployment instructions

#### Example: Generate Static HTML Single File

```bash
generate_static_html_single_file() {
  # Read config from design-spec.yaml
  INLINE_CSS=$(yq eval '.deployment.static_html.inline_css' "$DESIGN_SPEC")
  INLINE_JS=$(yq eval '.deployment.static_html.inline_js' "$DESIGN_SPEC")
  EMBED_IMAGES=$(yq eval '.deployment.static_html.embed_images' "$DESIGN_SPEC")
  OUTPUT_FILE=$(yq eval '.deployment.static_html.output_file' "$DESIGN_SPEC")
  MINIFY=$(yq eval '.deployment.static_html.minify' "$DESIGN_SPEC")

  # Create deployment directory
  mkdir -p "$DEPLOYMENT_DIR"

  # Generate build.sh
  cat > "$DEPLOYMENT_DIR/build.sh" <<EOF
#!/bin/bash
set -e

echo "🔨 Building static HTML single file..."

# Install dependencies
npm install

# Build project
npm run build

# Inline CSS
if [ "$INLINE_CSS" = "true" ]; then
  echo "📝 Inlining CSS..."
  # Use inline-source or similar tool
  npx inline-source --root dist dist/index.html > dist/index.inlined.html
  mv dist/index.inlined.html dist/index.html
fi

# Inline JS
if [ "$INLINE_JS" = "true" ]; then
  echo "📝 Inlining JavaScript..."
  # Bundle JS into HTML
fi

# Embed images as base64
if [ "$EMBED_IMAGES" = "base64" ]; then
  echo "🖼️  Embedding images as base64..."
  # Convert images to base64
fi

# Minify
if [ "$MINIFY" = "true" ]; then
  echo "⚡ Minifying..."
  npx html-minifier --collapse-whitespace --remove-comments \
    --minify-css --minify-js dist/index.html -o dist/index.min.html
  mv dist/index.min.html dist/index.html
fi

echo "✅ Build complete: $OUTPUT_FILE"
echo "📂 File size: \$(du -h $OUTPUT_FILE | cut -f1)"
EOF

  chmod +x "$DEPLOYMENT_DIR/build.sh"

  # Generate README.md
  cat > "$DEPLOYMENT_DIR/README.md" <<EOF
# 部署指南：靜態單一 HTML 檔案

## 概述

此專案將被建置為單一 HTML 檔案，可直接在瀏覽器中開啟使用。

## 部署目標

- **類型**: 靜態單一 HTML 檔案
- **輸出**: \`$OUTPUT_FILE\`
- **相依性**: 無需 web server
- **支援瀏覽器**: $(yq eval '.deployment.static_html.browser_support[]' "$DESIGN_SPEC" | tr '\n' ', ')

## 建置步驟

1. **執行建置腳本**:
   \`\`\`bash
   ./deployment/build.sh
   \`\`\`

2. **驗證輸出**:
   \`\`\`bash
   ls -lh $OUTPUT_FILE
   \`\`\`

## 部署步驟

### 方式 1: 本地測試

直接在瀏覽器開啟：
\`\`\`bash
open $OUTPUT_FILE
# 或
python -m http.server 8000 -d dist
# 然後開啟 http://localhost:8000
\`\`\`

### 方式 2: 託管到 GitHub Pages

1. Push 到 GitHub repository
2. 在 Settings → Pages 啟用
3. 選擇 branch 和 \`/dist\` 資料夾
4. 網站將發布到 \`https://[username].github.io/[repo]\`

### 方式 3: 託管到任何 Web Server

將 \`$OUTPUT_FILE\` 上傳到任何支援靜態檔案的 hosting：
- Netlify Drop
- Surge.sh
- Firebase Hosting
- AWS S3 + CloudFront
- 任何 Web Server (nginx, Apache, etc.)

## 設定說明

所有設定都在 \`design-spec.yaml\` 的 \`deployment\` 區塊：

\`\`\`yaml
deployment:
  target: static-html-single-file
  static_html:
    single_file: true
    inline_css: $INLINE_CSS
    inline_js: $INLINE_JS
    embed_images: $EMBED_IMAGES
    output_file: $OUTPUT_FILE
    minify: $MINIFY
\`\`\`

## 故障排除

### 檔案太大

如果輸出檔案超過 5MB：
- 設定 \`embed_images: external\` (不要 base64 編碼圖片)
- 設定 \`minify: true\`
- 使用 CDN 引入大型 libraries

### 功能無法運作

檢查瀏覽器 console 是否有錯誤：
- 確認所有資源都已 inline 或可存取
- 確認沒有 CORS 問題
- 確認瀏覽器版本支援

## 更新部署設定

修改 \`design-spec.yaml\` 後，重新生成部署配置：
\`\`\`bash
/speckit.deploy --update
\`\`\`

---

**生成工具**: SpecKit V2 - \`/speckit.deploy\`
**生成時間**: $(date)
EOF

  echo "✅ 已生成靜態 HTML 部署配置"
}
```

#### Example: Generate GCP Cloud Run

```bash
generate_gcp_cloud_run() {
  # Read config
  PROJECT_ID=$(yq eval '.deployment.gcp.project_id' "$DESIGN_SPEC")
  REGION=$(yq eval '.deployment.gcp.region' "$DESIGN_SPEC")
  SERVICE_NAME=$(yq eval '.deployment.gcp.service_name' "$DESIGN_SPEC")
  BASE_IMAGE=$(yq eval '.deployment.container.base_image' "$DESIGN_SPEC")
  PORT=$(yq eval '.deployment.container.port' "$DESIGN_SPEC")
  MIN_INSTANCES=$(yq eval '.deployment.gcp.cloud_run.min_instances' "$DESIGN_SPEC")
  MAX_INSTANCES=$(yq eval '.deployment.gcp.cloud_run.max_instances' "$DESIGN_SPEC")
  CPU=$(yq eval '.deployment.gcp.cloud_run.cpu' "$DESIGN_SPEC")
  MEMORY=$(yq eval '.deployment.gcp.cloud_run.memory' "$DESIGN_SPEC")

  mkdir -p "$DEPLOYMENT_DIR"

  # Generate Dockerfile
  cat > "$DEPLOYMENT_DIR/Dockerfile" <<EOF
FROM $BASE_IMAGE

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build (if needed)
RUN npm run build

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start application
CMD ["npm", "start"]
EOF

  # Generate .dockerignore
  cat > "$DEPLOYMENT_DIR/.dockerignore" <<EOF
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
dist
coverage
.vscode
.idea
*.test.js
*.spec.js
EOF

  # Generate cloudbuild.yaml
  cat > "$DEPLOYMENT_DIR/cloudbuild.yaml" <<EOF
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/$SERVICE_NAME', '-f', 'deployment/Dockerfile', '.']

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/$SERVICE_NAME']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - '$SERVICE_NAME'
      - '--image'
      - 'gcr.io/$PROJECT_ID/$SERVICE_NAME'
      - '--region'
      - '$REGION'
      - '--platform'
      - 'managed'
      - '--min-instances'
      - '$MIN_INSTANCES'
      - '--max-instances'
      - '$MAX_INSTANCES'
      - '--cpu'
      - '$CPU'
      - '--memory'
      - '$MEMORY'
      - '--port'
      - '$PORT'

images:
  - 'gcr.io/$PROJECT_ID/$SERVICE_NAME'
EOF

  # Generate deploy.sh
  cat > "$DEPLOYMENT_DIR/deploy.sh" <<EOF
#!/bin/bash
set -e

echo "🚀 Deploying to GCP Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "❌ Error: gcloud CLI not installed"
  echo "Install: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Build and deploy using Cloud Build
gcloud builds submit --config=deployment/cloudbuild.yaml .

echo "✅ Deployment complete!"
echo "🌐 Service URL: https://$SERVICE_NAME-[hash]-$REGION.a.run.app"
EOF

  chmod +x "$DEPLOYMENT_DIR/deploy.sh"

  # Generate README.md
  cat > "$DEPLOYMENT_DIR/README.md" <<EOF
# 部署指南：Google Cloud Run

## 前置需求

1. **GCP 帳號**: 確認已建立 GCP 專案
2. **gcloud CLI**: 安裝並設定 gcloud
   \`\`\`bash
   # 安裝 gcloud
   curl https://sdk.cloud.google.com | bash
   exec -l \$SHELL

   # 登入
   gcloud auth login

   # 設定專案
   gcloud config set project $PROJECT_ID
   \`\`\`

3. **啟用 APIs**:
   \`\`\`bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   \`\`\`

## 部署配置

- **專案 ID**: $PROJECT_ID
- **地區**: $REGION
- **服務名稱**: $SERVICE_NAME
- **最小實例數**: $MIN_INSTANCES
- **最大實例數**: $MAX_INSTANCES
- **CPU**: $CPU
- **記憶體**: $MEMORY

## 部署步驟

### 方式 1: 自動部署 (推薦)

\`\`\`bash
./deployment/deploy.sh
\`\`\`

### 方式 2: 手動部署

1. **Build Docker image**:
   \`\`\`bash
   docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME -f deployment/Dockerfile .
   \`\`\`

2. **Push to GCR**:
   \`\`\`bash
   docker push gcr.io/$PROJECT_ID/$SERVICE_NAME
   \`\`\`

3. **Deploy to Cloud Run**:
   \`\`\`bash
   gcloud run deploy $SERVICE_NAME \\
     --image gcr.io/$PROJECT_ID/$SERVICE_NAME \\
     --region $REGION \\
     --platform managed \\
     --min-instances $MIN_INSTANCES \\
     --max-instances $MAX_INSTANCES \\
     --cpu $CPU \\
     --memory $MEMORY \\
     --port $PORT
   \`\`\`

## 環境變數設定

如果需要設定環境變數：

\`\`\`bash
gcloud run services update $SERVICE_NAME \\
  --region $REGION \\
  --set-env-vars NODE_ENV=production,LOG_LEVEL=info
\`\`\`

## Secrets 設定

使用 Secret Manager 管理敏感資訊：

\`\`\`bash
# 建立 secret
echo -n "your-secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# 授權 Cloud Run 存取
gcloud secrets add-iam-policy-binding SECRET_NAME \\
  --member=serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com \\
  --role=roles/secretmanager.secretAccessor

# 設定 Cloud Run 使用 secret
gcloud run services update $SERVICE_NAME \\
  --region $REGION \\
  --set-secrets=SECRET_NAME=SECRET_NAME:latest
\`\`\`

## 監控與日誌

查看日誌：
\`\`\`bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit 50
\`\`\`

查看服務狀態：
\`\`\`bash
gcloud run services describe $SERVICE_NAME --region $REGION
\`\`\`

## 回滾

回滾到上一個版本：
\`\`\`bash
# 列出所有 revisions
gcloud run revisions list --service $SERVICE_NAME --region $REGION

# 回滾到特定 revision
gcloud run services update-traffic $SERVICE_NAME \\
  --region $REGION \\
  --to-revisions [REVISION_NAME]=100
\`\`\`

## 刪除服務

\`\`\`bash
gcloud run services delete $SERVICE_NAME --region $REGION
\`\`\`

---

**生成工具**: SpecKit V2 - \`/speckit.deploy\`
EOF

  echo "✅ 已生成 GCP Cloud Run 部署配置"
}
```

#### Example: Generate Docker Compose

```bash
generate_docker_compose() {
  # Read services from design-spec.yaml
  mkdir -p "$DEPLOYMENT_DIR"

  # Generate docker-compose.yml
  cat > "$DEPLOYMENT_DIR/docker-compose.yml" <<EOF
version: '3.8'

services:
$(yq eval '.deployment.docker_compose.services[]' "$DESIGN_SPEC" | while read -r service; do
  # Parse each service and generate config
done)

volumes:
$(yq eval '.deployment.docker_compose.volumes[]' "$DESIGN_SPEC" | while read -r volume; do
  echo "  $volume:"
done)
EOF

  # Generate .env.example
  # Generate start.sh, stop.sh
  # Generate README.md

  echo "✅ 已生成 Docker Compose 部署配置"
}
```

### Step 5: Generate Deployment Report

Create: `deployment/deployment-config.md`

```markdown
# 部署配置報告

**生成時間**: [TIMESTAMP]
**部署目標**: [TARGET]

## 配置來源

- **Design Spec**: design-spec.yaml
- **Deployment Section**: design-spec.yaml#deployment

## 生成的檔案

- `deployment/Dockerfile`
- `deployment/docker-compose.yml` (if applicable)
- `deployment/deploy.sh`
- `deployment/README.md`
- `deployment/.env.example`

## 部署設定摘要

[根據 target 顯示相關配置]

## 下一步

1. 檢查生成的檔案是否正確
2. 根據需要調整設定
3. 執行 `./deployment/deploy.sh` 進行部署

---

**生成工具**: SpecKit V2 - `/speckit.deploy`
```

### Step 6: Display Summary

```
🎉 部署配置生成完成！

部署目標: GCP Cloud Run
地區: asia-east1

生成的檔案:
├─ deployment/Dockerfile
├─ deployment/.dockerignore
├─ deployment/cloudbuild.yaml
├─ deployment/deploy.sh
├─ deployment/README.md
└─ deployment/deployment-config.md

下一步:
1. 檢查 deployment/README.md 了解部署步驟
2. 設定 GCP 專案和權限
3. 執行: ./deployment/deploy.sh

📋 部署指南: deployment/README.md
```

## Execution: Mode 2 (Preview)

```bash
/speckit.deploy --preview
```

Show what would be generated without creating files:

```
🔍 部署配置預覽

部署目標: gcp-cloud-run
來源: design-spec.yaml

將生成以下檔案:

deployment/
├─ Dockerfile (120 lines)
│  FROM node:18-alpine
│  WORKDIR /app
│  ...
│
├─ cloudbuild.yaml (35 lines)
│  steps:
│    - name: 'gcr.io/cloud-builders/docker'
│  ...
│
├─ deploy.sh (executable, 45 lines)
│  #!/bin/bash
│  gcloud builds submit...
│
└─ README.md (200 lines)
   # 部署指南：Google Cloud Run
   ...

要實際生成這些檔案，執行:
  /speckit.deploy
```

## Supported Deployment Targets

### 1. static-html-single-file

生成檔案：
- `build.sh` - 建置腳本
- `README.md` - 部署指南
- `test.sh` - 本地測試

適用場景：
- 簡單的工具或小型應用
- 不需要 server 的應用
- 離線使用的應用

### 2. static-html-spa

生成檔案：
- `build.sh`
- `netlify.toml` (如果選擇 Netlify)
- `vercel.json` (如果選擇 Vercel)
- `README.md`

適用場景：
- React/Vue/Angular SPA
- 需要 routing 的前端應用

### 3. gcp-cloud-run

生成檔案：
- `Dockerfile`
- `.dockerignore`
- `cloudbuild.yaml`
- `deploy.sh`
- `README.md`

適用場景：
- Containerized 應用
- 需要自動擴展
- Serverless 容器

### 4. aws-lambda-api-gateway

生成檔案：
- `serverless.yml`
- `handler.js`
- `deploy.sh`
- `README.md`

適用場景：
- Serverless API
- Event-driven 應用
- 低成本小流量應用

### 5. docker-compose-local

生成檔案：
- `docker-compose.yml`
- `Dockerfile`
- `.env.example`
- `start.sh`
- `stop.sh`
- `README.md`

適用場景：
- 本地開發環境
- Multi-service 應用
- Database + Backend + Frontend 組合

### 6. kubernetes

生成檔案：
- `deployment.yaml`
- `service.yaml`
- `ingress.yaml`
- `configmap.yaml`
- `secret.yaml` (template only)
- `README.md`

適用場景：
- 大規模生產環境
- 需要複雜的 orchestration
- Multi-region 部署

## Template System

Templates 存放在：

```
.specify/templates/deployment/
├─ static-html-single-file/
│  ├─ build.sh.template
│  └─ README.md.template
│
├─ static-html-spa/
│  ├─ build.sh.template
│  ├─ netlify.toml.template
│  └─ README.md.template
│
├─ gcp-cloud-run/
│  ├─ Dockerfile.template
│  ├─ cloudbuild.yaml.template
│  ├─ deploy.sh.template
│  └─ README.md.template
│
├─ aws-lambda/
│  ├─ serverless.yml.template
│  ├─ handler.js.template
│  └─ README.md.template
│
├─ docker-compose/
│  ├─ docker-compose.yml.template
│  ├─ Dockerfile.template
│  └─ README.md.template
│
└─ kubernetes/
   ├─ deployment.yaml.template
   ├─ service.yaml.template
   ├─ ingress.yaml.template
   └─ README.md.template
```

Templates 使用變數替換：
- `{{PROJECT_ID}}` → 從 design-spec.yaml 讀取
- `{{SERVICE_NAME}}` → 從 design-spec.yaml 讀取
- etc.

## Error Handling

- If design-spec.yaml missing: ERROR "Run /speckit.plan first"
- If deployment section missing: ERROR + show example
- If unsupported target: ERROR + list supported targets
- If required config missing: ERROR + show what's missing

## Context for Deployment

User-provided context: $ARGUMENTS

Use this to:
- Override target if specified
- Customize generation options
- Skip certain files if requested

## Example Workflows

### Workflow 1: Static HTML

```bash
# 1. 定義需求時就指定部署方式
/speckit.specify
# → 在互動式問答中選擇「靜態 HTML」

# 2. 生成 design-spec 時包含部署配置
/speckit.plan
# → design-spec.yaml 包含 deployment.target = static-html-single-file

# 3. 完成開發和測試
/speckit.implement ...
/speckit.verify ...
/speckit.test --integration

# 4. 生成部署配置
/speckit.deploy
# → 生成 deployment/build.sh 等

# 5. 建置和部署
./deployment/build.sh
open dist/index.html
```

### Workflow 2: GCP Cloud Run

```bash
# 1-3. 同上

# 4. 生成部署配置
/speckit.deploy
# → 生成 Dockerfile, cloudbuild.yaml, deploy.sh

# 5. 部署到 GCP
./deployment/deploy.sh
# → 自動 build, push, deploy
```

### Workflow 3: 多環境部署

```yaml
# design-spec.yaml 可以定義多個環境

deployment:
  target: gcp-cloud-run

  environments:
    staging:
      gcp:
        project_id: my-project-staging
        region: asia-east1

    production:
      gcp:
        project_id: my-project-prod
        region: asia-east1
```

```bash
# 部署到 staging
/speckit.deploy --env staging

# 部署到 production
/speckit.deploy --env production
```

## Integration with CI/CD

Generate CI/CD configs automatically:

```yaml
# design-spec.yaml
deployment:
  target: gcp-cloud-run

  ci_cd:
    enabled: true
    provider: github-actions
```

Then `/speckit.deploy` also generates:

```
.github/
└─ workflows/
   ├─ deploy-staging.yml
   └─ deploy-production.yml
```

## Future Enhancements

Potential future targets:
- Azure Container Apps
- Fly.io
- Railway
- Render
- Heroku
- DigitalOcean App Platform

## Summary

`/speckit.deploy` 提供：

1. **讀取 spec** - 從 design-spec.yaml 讀取部署配置
2. **選擇策略** - 根據 target 選擇生成策略
3. **生成檔案** - 生成 Dockerfile, scripts, configs
4. **產生文檔** - 生成部署指南
5. **多目標支援** - 支援 10+ 部署目標

讓部署配置成為 spec 的一部分，而不是事後才考慮的問題。
