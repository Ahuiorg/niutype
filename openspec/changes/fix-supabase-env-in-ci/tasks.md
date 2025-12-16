# Tasks

## 1. 配置 GitHub Secrets（用户手动操作）
- [ ] 1.1 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
- [ ] 1.2 添加 Secret: `VITE_SUPABASE_URL`（值为 Supabase 项目 URL）
- [ ] 1.3 添加 Secret: `VITE_SUPABASE_ANON_KEY`（值为 Supabase anon key）

## 2. 修改部署工作流
- [x] 2.1 在 `.github/workflows/deploy.yml` 的 Build 步骤中添加环境变量注入

## 3. 验证
- [ ] 3.1 推送代码触发部署
- [ ] 3.2 确认部署后应用正常加载，无环境变量错误
