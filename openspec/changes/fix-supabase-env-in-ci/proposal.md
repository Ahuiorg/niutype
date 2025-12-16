# Change: 修复 CI 构建中 Supabase 环境变量缺失问题

## Why

部署到 GitHub Pages 后，应用在浏览器中运行时抛出错误：
```
缺少 Supabase 配置：请在环境变量中设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY
```

原因是 GitHub Actions 构建时未注入 Supabase 环境变量，导致 Vite 将 `import.meta.env.VITE_SUPABASE_*` 编译为 `undefined`。

## What Changes

- 修改 `.github/workflows/deploy.yml`，在构建步骤中通过 GitHub Secrets 注入 Supabase 环境变量
- 更新文档说明如何配置 GitHub Secrets

## Impact

- Affected specs: `infrastructure`
- Affected code: `.github/workflows/deploy.yml`
- 需要用户在 GitHub 仓库设置中添加两个 Secrets：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
