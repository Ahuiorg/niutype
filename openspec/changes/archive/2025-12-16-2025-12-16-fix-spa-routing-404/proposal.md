# Proposal: 修复 SPA 路由在 GitHub Pages 刷新时 404 问题

## 背景

当前项目使用 Vue Router 的 HTML5 History 模式部署在 GitHub Pages 上。当用户在非首页路径（如 `/gifts`、`/games`）刷新页面时，GitHub Pages 返回 404 错误，因为服务器找不到对应的文件。

## 问题原因

1. HTML5 History 模式的 URL 看起来像普通路径（如 `/gifts`）
2. 当刷新页面时，浏览器向服务器请求 `/gifts` 这个文件
3. GitHub Pages 不支持服务器端路由配置，找不到文件就返回 404
4. SPA 需要所有路由请求都返回 `index.html`，由前端路由处理

## 解决方案

在构建时将 `index.html` 复制为 `404.html`。这是 GitHub Pages 上托管 SPA 的标准解决方案：

- GitHub Pages 找不到文件时会返回 `404.html`
- `404.html` 内容与 `index.html` 相同，包含完整的 SPA 应用
- Vue Router 会读取当前 URL 并正确渲染对应页面

## 影响范围

- 修改 `package.json` 的 build 脚本
- 不影响任何现有代码逻辑

## 验证方式

部署后访问 `https://leegpt.cn/gifts` 并刷新页面，应该能正常显示而不是 404。
