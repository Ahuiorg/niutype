# Project Context

## Purpose
打字小达人 - 一个专为7岁儿童设计的打字练习网站，帮助熟悉键盘上每个字母的位置，通过游戏化元素保持学习兴趣。

## Tech Stack
- Vue 3 + TypeScript
- Vite (构建工具)
- Pinia (状态管理) + pinia-plugin-persistedstate (持久化)
- Vue Router (路由)
- 纯 CSS (样式，无 UI 框架依赖)

## Project Conventions

### Code Style
- 使用 TypeScript 严格模式
- Vue 组件使用 `<script setup>` 语法
- 组件命名采用 PascalCase
- 工具函数命名采用 camelCase
- 类型定义集中在 `src/types/index.ts`

### Architecture Patterns
- 状态管理：Pinia stores 分离关注点（user, exercise）
- 工具函数：独立的 utils 模块（fingerMapping, exerciseGenerator, pointsCalculator, achievementChecker）
- 组件结构：按功能分组（keyboard, exercise, stats, rewards, common）

### Testing Strategy
- 开发阶段通过浏览器手动测试
- 关键功能：打字练习流程、积分计算、成就解锁、数据持久化

### Git Workflow
- 主分支：main
- 功能分支：feature/xxx
- 提交信息：中文描述

## Domain Context
- 目标用户：7岁儿童
- 练习内容：26个英文字母（不含数字和特殊字符）
- 每日练习：30分钟
- 手指分配：标准 QWERTY 键盘打字法

## Important Constraints
- 纯前端应用，无后端服务
- 数据存储在 localStorage
- 仅支持桌面端（需要物理键盘）
- 仅支持 QWERTY 键盘布局

## External Dependencies
无外部 API 依赖
