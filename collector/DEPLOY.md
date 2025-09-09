# Collector Deployment Guide

## Prerequisites

1. Cloudflare account with Workers and R2 enabled
2. GitHub repository with this code
3. GitHub Actions enabled
4. Cloudflare API token with Workers and R2 permissions

## Deployment Steps

### 1. Configure Environment Variables

Set the following secrets in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `GEMINI_API_KEY`: Your Google Gemini API key

### 2. Configure wrangler.toml

The [wrangler.toml](file:///Users/evgeniy/analizer_error/collector/wrangler.toml) file is already configured with:

```toml
name = "ai-debug-collector"
main = "src/worker.ts"
compatibility_date = "2023-10-01"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "ai-debug-storage"

[vars]
PROJECT_TOKENS = '{"test": "secret"}'
GEMINI_API_KEY = "your-gemini-api-key"
```

### 3. Create R2 Bucket

Before deploying, create the R2 bucket in your Cloudflare account:

1. Go to your Cloudflare dashboard
2. Navigate to R2
3. Create a new bucket named `ai-debug-storage`

### 4. GitHub Actions Deployment

The GitHub Actions workflow in [.github/workflows/deploy-collector.yml](file:///Users/evgeniy/analizer_error/.github/workflows/deploy-collector.yml) will automatically deploy the collector when changes are pushed to the main branch.

### 5. Manual Deployment (Optional)

If you prefer to deploy manually:

```bash
cd collector
npx wrangler deploy
```

## Collector URL

After successful deployment, your collector will be available at:
`https://ai-debug-collector.YOUR-CLOUDFLARE-ACCOUNT-ID.workers.dev`

You can find your exact URL in the Cloudflare Workers dashboard after deployment.

## Testing the Deployment

After deployment, test the collector with curl:

```bash
# Test /ingest/logs endpoint
curl -X POST https://YOUR-COLLECTOR-URL/ingest/logs \
  -H "Authorization: Bearer secret" \
  -H "Content-Type: application/json" \
  -d '[{"level": "ERROR", "message": "Test error", "timestamp": "2023-01-01T00:00:00Z"}]'

# Test /analyze endpoint
curl -X POST https://YOUR-COLLECTOR-URL/analyze \
  -H "Content-Type: application/json" \
  -d '{"logs": [{"level": "ERROR", "message": "Test error"}]}'

# Test /tupik/analyze endpoint
curl -X POST https://YOUR-COLLECTOR-URL/tupik/analyze \
  -H "Content-Type: application/json" \
  -d '{"errorPattern": "deadlock", "description": "Application stuck in reasoning loop"}'
```

## Troubleshooting

### Common Issues

1. **R2 Bucket Not Found**: Ensure the R2 bucket `ai-debug-storage` exists in your Cloudflare account
2. **Authentication Errors**: Verify that `PROJECT_TOKENS` in [wrangler.toml](file:///Users/evgeniy/analizer_error/collector/wrangler.toml) matches the tokens used by your agents
3. **Gemini API Errors**: Check that `GEMINI_API_KEY` is correctly set in your GitHub secrets

### Checking Deployment Status

You can check the deployment status in the GitHub Actions tab of your repository or in the Cloudflare Workers dashboard.