## MODIFIED Requirements

### Requirement: CI/CD 部署配置

GitHub Actions 工作流 SHALL 在构建时注入 Supabase 环境变量，确保生产构建包含正确的后端连接配置。

#### Scenario: 构建时注入环境变量
- **GIVEN**: GitHub 仓库已配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` Secrets
- **WHEN**: 执行 `pnpm build` 构建命令
- **THEN**: Vite 将 Secrets 值编译到生产代码中

#### Scenario: 部署后应用正常运行
- **GIVEN**: 构建产物已部署到 GitHub Pages
- **WHEN**: 用户访问应用
- **THEN**: 应用成功初始化 Supabase 客户端，无环境变量缺失错误
