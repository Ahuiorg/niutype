# 🐮 NiuType 打字小达人

<p align="center">
  <img src="public/keyboard.svg" alt="NiuType Logo" width="120" />
</p>

<p align="center">
  <strong>专为儿童设计的趣味打字练习应用</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#开发指南">开发指南</a>
</p>

---

## ✨ 功能特性

### 🎯 打字练习
- **渐进式学习**：从基础键位开始，逐步扩展到全键盘
- **实时反馈**：即时显示正确/错误，帮助纠正打字习惯
- **虚拟键盘**：可视化键盘显示，高亮当前按键和手指分配

### 📊 进度追踪
- **练习统计**：记录练习时长、准确率、打字速度
- **每日目标**：30分钟每日练习目标追踪
- **历史记录**：查看练习历程和进步曲线

### 🏆 成就系统
- **趣味成就**：完成挑战解锁各种有趣的成就徽章
- **积分奖励**：练习获得积分，激励持续学习
- **礼品商店**：用积分兑换虚拟奖励

### 🎮 休闲游戏
- **贪吃蛇**：经典小游戏，劳逸结合
- **游戏挑战**：通过游戏巩固打字技能

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm（推荐）或 npm

### 安装运行

```bash
# 克隆项目
git clone https://github.com/Ahuiorg/niutype.git
cd niutype

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开浏览器访问 http://localhost:5173

### 构建部署

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| [Vue 3](https://vuejs.org/) | 渐进式 JavaScript 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript |
| [Vite](https://vitejs.dev/) | 下一代前端构建工具 |
| [Pinia](https://pinia.vuejs.org/) | Vue 状态管理 |
| [Vue Router](https://router.vuejs.org/) | 官方路由管理器 |
| [Naive UI](https://www.naiveui.com/) | Vue 3 组件库 |

---

## 📁 项目结构

```
niutype/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 组件
│   │   ├── common/         # 通用组件
│   │   ├── exercise/       # 练习相关组件
│   │   ├── game/           # 游戏相关组件
│   │   └── keyboard/       # 键盘组件
│   ├── views/              # 页面视图
│   ├── stores/             # Pinia 状态管理
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型定义
│   ├── router.ts           # 路由配置
│   └── main.ts             # 应用入口
├── docs/                   # 项目文档
└── openspec/               # 项目规范
```

---

## 📖 开发指南

### 代码规范

- 使用 TypeScript 严格模式
- Vue 组件使用 `<script setup>` 语法
- 组件命名：PascalCase
- 工具函数：camelCase

### 状态管理

项目使用 Pinia 进行状态管理，store 按功能划分：

- `user.ts` - 用户信息、积分、成就
- `exercise.ts` - 练习状态、统计数据
- `game.ts` - 游戏状态

### 数据持久化

所有用户数据存储在 `localStorage`，通过 `pinia-plugin-persistedstate` 自动同步。

---

## 🎯 设计理念

NiuType 专为 **7岁儿童** 设计，核心理念：

1. **简单直观** - 界面简洁，操作简单
2. **循序渐进** - 从基础键位逐步学习
3. **即时反馈** - 实时显示对错，培养正确习惯
4. **游戏化** - 积分、成就、游戏，保持学习兴趣
5. **无压力** - 没有排名竞争，专注个人进步

---

## 📝 License

[MIT](LICENSE)

---

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

<p align="center">
  Made with ❤️ for kids learning to type
</p>
