# AI Skills 使用指南

> 通过 OpenSkills 赋能 AI 助手，提升开发效率

## 目录

- [概述](#概述)
- [什么是 Skills](#什么是-skills)
- [什么是 OpenSkills](#什么是-openskills)
- [快速开始](#快速开始)
- [Skills 工作原理](#skills-工作原理)
- [可用 Skills 详解](#可用-skills-详解)
  - [文档处理类](#文档处理类)
  - [前端开发类](#前端开发类)
  - [测试与调试类](#测试与调试类)
  - [创意设计类](#创意设计类)
  - [工具与集成类](#工具与集成类)
- [高级用法](#高级用法)
- [创建自定义 Skill](#创建自定义-skill)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)
- [参考资源](#参考资源)

---

## 概述

本文档介绍如何在项目中使用 AI Skills 系统来增强 AI 助手（如 Claude）的能力。通过 Skills，AI 助手可以获得专业领域的知识和工作流程，从而更高效、更专业地完成各类开发任务。

**适用场景：**
- 使用 Cursor、Claude Code、Windsurf、Aider 等 AI 编程工具的开发者
- 希望提升 AI 辅助开发效率的团队
- 需要标准化 AI 工作流程的组织

---

## 什么是 Skills

### 来源

Skills 是 **Anthropic 官方** 推出的能力扩展系统，官方仓库：[anthropics/skills](https://github.com/anthropics/skills)

### 定义

Skills 是包含指令、脚本和资源的文件夹，Claude 会动态加载这些内容以提升在特定任务上的表现。Skills 教会 Claude 如何以可重复的方式完成特定任务，无论是：

- 使用公司品牌指南创建文档
- 使用组织特定的工作流程分析数据
- 自动化个人任务

### 核心特性

| 特性 | 描述 |
|------|------|
| **渐进式加载** | Skills 按需加载，不会预先占用上下文 |
| **自包含** | 每个 Skill 都是独立的文件夹，包含 `SKILL.md` 和相关资源 |
| **可扩展** | 支持创建自定义 Skills 满足特定需求 |
| **跨平台** | 可在 Claude Code、Cursor、Windsurf、Aider 等工具中使用 |

---

## 什么是 OpenSkills

### 简介

[OpenSkills](https://github.com/numman-ali/openskills) 是一个**第三方开源工具**（由 [numman-ali](https://github.com/numman-ali) 创建），用于将 Anthropic 的 Skills 系统带给所有 AI 编程工具。

> ⭐ GitHub Stars: 2.3k+ | 📦 npm: `openskills`

### 为什么需要 OpenSkills

**对于 Claude Code 用户：**
- 从任何 GitHub 仓库安装 Skills，不仅限于官方市场
- 支持本地路径和私有 Git 仓库
- 跨多个 Agent 共享 Skills
- 在仓库中版本控制你的 Skills

**对于其他 Agent 用户（Cursor、Windsurf、Aider）：**
- 获得与 Claude Code 相同的 Skills 系统
- 通过 GitHub 访问 Anthropic 市场的 Skills
- 使用渐进式加载（按需加载 Skills）

### 与 Claude Code 的兼容性

OpenSkills 与 Claude Code 的 Skills 系统 **100% 兼容**：

| 方面 | Claude Code | OpenSkills |
|------|-------------|------------|
| **提示格式** | `<available_skills>` XML | ✅ 相同 |
| **市场来源** | Anthropic marketplace | ✅ GitHub (anthropics/skills) |
| **文件夹** | `.claude/skills/` | ✅ 相同 |
| **SKILL.md 格式** | YAML frontmatter + markdown | ✅ 相同 |
| **渐进式加载** | 是 | ✅ 是 |
| **调用方式** | `Skill("pdf")` 工具 | `openskills read pdf` CLI |

**唯一区别：** Claude Code 使用 `Skill` 工具，OpenSkills 使用 `openskills read <name>` CLI 命令。

---

## 快速开始

### 1. 安装 OpenSkills CLI

```bash
# 使用 npm
npm i -g openskills

# 或使用 pnpm
pnpm add -g openskills
```

### 2. 安装 Skills

```bash
# 从 Anthropic 官方市场安装（交互式选择）
openskills install anthropics/skills

# 或从任何 GitHub 仓库安装
openskills install your-org/custom-skills
```

### 3. 同步到 AGENTS.md

> ⚠️ **注意：** 必须先有一个 `AGENTS.md` 文件，sync 才能更新它。

```bash
# 同步到 AGENTS.md
openskills sync
```

完成！你的 Agent 现在拥有与 Claude Code 相同格式的 `<available_skills>`。

### 4. 验证安装

```bash
# 查看已安装的 Skills
openskills list
```

---

## Skills 工作原理

### 调用流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  用户请求   │ -> │  AI 分析    │ -> │ 匹配 Skill  │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  返回结果   │ <- │  执行任务   │ <- │ 加载 Skill  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### AGENTS.md 中的格式

OpenSkills 在 `AGENTS.md` 中生成与 Claude Code **完全相同**的 XML 格式：

```xml
<skills_system priority="1">

## Available Skills

<usage>
When users ask you to perform tasks, check if any of the available skills 
below can help complete the task more effectively.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions
- Base directory provided in output for resolving bundled resources
</usage>

<available_skills>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit...</description>
<location>project</location>
</skill>

<skill>
<name>xlsx</name>
<description>Comprehensive spreadsheet creation...</description>
<location>project</location>
</skill>

</available_skills>

</skills_system>
```

### 技术细节

当 AI 决定使用某个 Skill 时，会执行：

```bash
openskills read <skill-name>
```

该命令会输出：
- Skill 的基础目录路径
- `SKILL.md` 的完整内容（包含详细指令）

示例输出：
```
Reading: pdf
Base directory: /path/to/.claude/skills/pdf

---
[SKILL.md 内容]
```

### SKILL.md 格式

每个 Skill 都使用相同的格式：

```markdown
---
name: pdf
description: Comprehensive PDF manipulation toolkit for extracting 
text and tables, creating new PDFs, merging/splitting documents...
---

# PDF Skill Instructions

When the user asks you to work with PDFs, follow these steps:

1. Install dependencies: `pip install pypdf2`
2. Extract text using the extract_text.py script in scripts/
3. For bundled resources, use the base directory provided
4. ...
```

### 项目结构

```
your-project/
├── .claude/
│   └── skills/           # Skills 存储目录
│       ├── pdf/
│       │   ├── SKILL.md
│       │   ├── scripts/
│       │   └── references/
│       ├── xlsx/
│       └── ...
├── AGENTS.md             # AI 助手配置文件
└── ...
```

---

## 可用 Skills 详解

以下 Skills 来自 [Anthropic 官方 Skills 仓库](https://github.com/anthropics/skills)：

### 文档处理类

#### 📄 docx - Word 文档处理

**功能：** 全面的 Word 文档创建、编辑和分析能力。

**支持操作：**
- 创建新文档
- 修改现有文档
- 修订跟踪（Track Changes）
- 添加批注
- 格式保留

**使用示例：**
```
帮我创建一份技术方案文档，包含目录和代码示例
```

---

#### 📊 xlsx - Excel 电子表格

**功能：** 专业的电子表格处理能力，支持复杂公式和数据分析。

**支持格式：** `.xlsx`, `.xlsm`, `.csv`, `.tsv`

**支持操作：**
- 创建带公式的报表
- 数据分析和可视化
- 修改现有表格（保留公式）
- 图表生成
- 公式重算

**使用示例：**
```
帮我创建一个销售数据分析表，包含环比增长率计算和图表
```

---

#### 📑 pdf - PDF 文档处理

**功能：** 全面的 PDF 操作工具包。

**支持操作：**
- 提取文本和表格
- 创建新 PDF
- 合并/拆分文档
- 填写 PDF 表单
- 批量处理

**使用示例：**
```
帮我把这几个 PDF 文件合并成一个，并提取第三页的表格数据
```

---

#### 📽️ pptx - PowerPoint 演示文稿

**功能：** 演示文稿的创建、编辑和分析。

**支持操作：**
- 创建新演示文稿
- 修改幻灯片内容
- 布局调整
- 添加演讲者备注
- 批注管理

**使用示例：**
```
帮我制作一个产品介绍 PPT，需要 10 页左右，包含图表
```

---

#### 📝 doc-coauthoring - 文档协作

**功能：** 结构化的文档协作工作流程，适用于撰写各类专业文档。

**适用文档类型：**
- 技术规范（Technical Spec）
- 设计文档（Design Doc）
- 决策文档（Decision Doc）
- RFC / PRD

**工作流程：**
1. **上下文收集** - 通过问答明确需求
2. **优化与结构** - 逐节构建和打磨
3. **读者测试** - 验证文档可读性

**使用示例：**
```
帮我写一份系统架构设计文档
```

---

### 前端开发类

#### 🎨 frontend-design - 前端界面设计

**功能：** 创建独特的、生产级的高质量前端界面。

**适用场景：**
- 网站/着陆页设计
- 仪表盘（Dashboard）
- React/Vue 组件
- HTML/CSS 布局
- UI 美化

**特点：**
- 避免通用的 AI 美学风格
- 生成可直接使用的代码
- 遵循现代设计原则

**使用示例：**
```
帮我设计一个 SaaS 产品的定价页面，要求现代、简洁
```

---

#### 🧩 web-artifacts-builder - Web 组件构建器

**功能：** 使用现代前端技术栈创建复杂的多组件 Web 应用。

**技术栈：**
- React
- Tailwind CSS
- shadcn/ui

**适用场景：**
- 需要状态管理的复杂组件
- 多页面路由应用
- 使用 shadcn/ui 组件库的项目

**注意：** 不适用于简单的单文件 HTML/JSX，这类需求使用 `frontend-design` 更合适。

**使用示例：**
```
帮我构建一个带有状态管理的任务看板应用
```

---

#### 🎭 theme-factory - 主题工厂

**功能：** 为各类制品应用统一的视觉主题。

**适用制品：**
- 幻灯片
- 文档
- 报告
- HTML 着陆页

**特点：**
- 10 个预设主题
- 支持即时生成新主题
- 统一的颜色/字体方案

**使用示例：**
```
帮我把这个着陆页应用一个专业的企业风格主题
```

---

### 测试与调试类

#### 🧪 webapp-testing - Web 应用测试

**功能：** 使用 Playwright 进行 Web 应用的自动化测试。

**支持操作：**
- 前端功能验证
- UI 行为调试
- 浏览器截图捕获
- 浏览器日志查看
- 端到端测试

**使用示例：**
```
帮我测试一下本地运行的登录功能是否正常工作
```

---

### 创意设计类

#### 🖼️ canvas-design - 画布设计

**功能：** 创建精美的静态视觉作品。

**输出格式：** `.png`, `.pdf`

**适用场景：**
- 海报设计
- 艺术作品
- 图形设计
- 静态视觉元素

**使用示例：**
```
帮我设计一张技术分享会的海报
```

---

#### 🎨 algorithmic-art - 算法艺术

**功能：** 使用 p5.js 创建生成式艺术作品。

**技术特点：**
- 种子随机性（可复现）
- 交互式参数探索
- 支持流场、粒子系统

**使用示例：**
```
帮我创建一个流场效果的生成艺术作品
```

---

#### 🎬 slack-gif-creator - Slack GIF 创建器

**功能：** 创建针对 Slack 优化的动画 GIF。

**特点：**
- 符合 Slack 的尺寸限制
- 优化的文件大小
- 内置动画概念库

**使用示例：**
```
帮我做一个庆祝发布成功的 GIF 用于 Slack
```

---

### 工具与集成类

#### 🔌 mcp-builder - MCP 服务器构建器

**功能：** 创建 MCP（Model Context Protocol）服务器，使 LLM 能够与外部服务交互。

**支持语言：**
- Python（FastMCP）
- Node/TypeScript（MCP SDK）

**适用场景：**
- 集成外部 API
- 扩展 AI 能力
- 自定义工具开发

**使用示例：**
```
帮我创建一个连接 Jira API 的 MCP 服务器
```

---

#### 🛠️ skill-creator - Skill 创建器

**功能：** 创建自定义 Skills 来扩展 AI 能力。

**适用场景：**
- 团队特定工作流程
- 专业领域知识封装
- 工具集成

**使用示例：**
```
帮我创建一个用于代码审查的自定义 Skill
```

---

#### 📧 internal-comms - 内部沟通

**功能：** 撰写各类内部沟通文档。

**支持文档类型：**
- 状态报告
- 领导层更新
- 项目更新
- 公司简报
- 事故报告
- FAQ

**使用示例：**
```
帮我写一份本周的项目进度报告
```

---

#### 🏢 brand-guidelines - 品牌指南

**功能：** 应用 Anthropic 官方品牌样式。

**适用场景：**
- 需要品牌一致性的制品
- 公司设计标准
- 视觉格式化

---

## 高级用法

### 命令参考

```bash
openskills install <source> [options]  # 从 GitHub、本地路径或私有仓库安装
openskills sync [-y] [-o <path>]       # 更新 AGENTS.md
openskills list                        # 显示已安装的 Skills
openskills read <name>                 # 加载 Skill（供 Agent 使用）
openskills manage                      # 交互式移除 Skills
openskills remove <name>               # 移除指定 Skill
```

### 安装选项

```bash
# 默认：安装到项目目录（推荐）
openskills install anthropics/skills
# → 安装到 ./.claude/skills (项目级，已 gitignore)

# 全局安装
openskills install anthropics/skills --global
# → 安装到 ~/.claude/skills (跨项目共享)

# Universal 模式（高级）
openskills install anthropics/skills --universal
# → 安装到 ./.agent/skills (用于 Claude Code + 其他 Agent)
```

### Universal 模式

**问题：** 如果你同时使用 Claude Code 和其他 Agent（Cursor、Windsurf、Aider），并共享一个 AGENTS.md，安装到 `.claude/skills/` 可能与 Claude Code 的市场插件产生重复。

**解决方案：** 使用 `--universal` 安装到 `.agent/skills/`：

```bash
openskills install anthropics/skills --universal
```

**优先级顺序：** OpenSkills 按以下顺序搜索 4 个位置：
1. `./.agent/skills/` (项目 universal)
2. `~/.agent/skills/` (全局 universal)
3. `./.claude/skills/` (项目)
4. `~/.claude/skills/` (全局)

同名 Skill 只出现一次（优先级高的获胜）。

### 从本地路径安装

```bash
# 绝对路径
openskills install /path/to/my-skill

# 相对路径
openskills install ./local-skills/my-skill

# Home 目录
openskills install ~/my-skills/custom-skill

# 安装目录中的所有 Skills
openskills install ./my-skills-folder
```

### 从私有 Git 仓库安装

```bash
# SSH（使用你的 SSH 密钥）
openskills install git@github.com:your-org/private-skills.git

# HTTPS（可能提示输入凭据）
openskills install https://github.com/your-org/private-skills.git
```

### 同步选项

```bash
# 同步到默认 AGENTS.md
openskills sync

# 同步到自定义文件（如果不存在会自动创建）
openskills sync --output .ruler/AGENTS.md
openskills sync -o custom-rules.md

# 非交互模式（用于 CI/CD）
openskills sync -y
```

### 本地开发：使用符号链接

对于正在开发的 Skill，可以创建符号链接：

```bash
# 克隆你正在开发的 Skills 仓库
git clone git@github.com:your-org/my-skills.git ~/dev/my-skills

# 创建符号链接到项目的 Skills 目录
mkdir -p .claude/skills
ln -s ~/dev/my-skills/my-skill .claude/skills/my-skill

# 现在对 ~/dev/my-skills/my-skill 的修改会立即生效
openskills list  # 显示 my-skill
openskills sync  # 将 my-skill 包含到 AGENTS.md
```

这种方式可以：
- 在你喜欢的位置编辑 Skills
- 保持 Skills 的版本控制
- 无需重新安装即可测试更改
- 通过符号链接在多个项目间共享 Skills

---

## 创建自定义 Skill

### 最小结构

```
my-skill/
└── SKILL.md
```

```markdown
---
name: my-skill
description: What this does and when to use it
---

# My Skill Name

[Add your instructions here that Claude will follow when this skill is active]

## Examples
- Example usage 1
- Example usage 2

## Guidelines
- Guideline 1
- Guideline 2
```

frontmatter 只需要两个字段：
- `name` - Skill 的唯一标识符（小写，用连字符分隔）
- `description` - 完整描述 Skill 的功能和使用场景

### 带有捆绑资源

```
my-skill/
├── SKILL.md
├── references/
│   └── api-docs.md      # 支持文档
├── scripts/
│   └── process.py       # 辅助脚本
└── assets/
    └── template.json    # 模板、配置
```

在 SKILL.md 中引用资源：

```markdown
1. Read the API documentation in references/api-docs.md
2. Run the process.py script from scripts/
3. Use the template from assets/template.json
```

### 发布到 GitHub

1. 推送到 GitHub: `your-username/my-skill`
2. 用户安装: `openskills install your-username/my-skill`

### 使用 skill-creator 获取详细指导

```bash
openskills install anthropics/skills
openskills read skill-creator
```

这会加载关于以下内容的详细指导：
- 编写有效的 Skill 描述
- 为 Agent 结构化指令
- 使用捆绑资源
- 测试和迭代

---

## 最佳实践

### 1. 清晰描述需求

```
❌ 不好：帮我做个表格
✅ 好：帮我创建一个月度销售报表，包含各区域销售额对比和环比增长率图表
```

### 2. 提供足够的上下文

```
❌ 不好：帮我设计一个页面
✅ 好：帮我设计一个 B2B SaaS 产品的定价页面，目标用户是中小企业，
      需要展示 3 个套餐等级，风格要简洁专业
```

### 3. 迭代优化

Skills 支持迭代式工作流程。如果第一次输出不满意，可以继续提供反馈：

```
👤 这个设计不错，但颜色太鲜艳了，能改成更沉稳的商务风格吗？
```

### 4. 组合使用多个 Skills

复杂任务可以分解并使用多个 Skills：

```
1. 先用 doc-coauthoring 完成方案文档
2. 再用 pptx 制作演示文稿
3. 最后用 frontend-design 实现原型
```

### 5. 善用显式调用

当自动匹配不准确时，显式指定 Skill：

```
请使用 xlsx skill 来处理这个数据分析任务
```

---

## 常见问题

### Q: 如何查看所有可用的 Skills？

```bash
openskills list
```

或查看项目根目录的 `AGENTS.md` 文件。

### Q: Skills 会消耗额外的 Token 吗？

是的，每次加载 Skill 会消耗一定的 Token，但相比获得的专业能力和输出质量提升，这是值得的。关键是 Skills 采用**渐进式加载**，只有在需要时才加载，不会预先占用上下文。

### Q: 如何更新 Skills？

```bash
# 重新安装以获取最新版本
openskills install anthropics/skills
openskills sync
```

### Q: 可以创建自定义 Skill 吗？

可以！使用 `skill-creator` skill 来创建自定义 Skills：

```
帮我创建一个用于 [你的需求] 的自定义 Skill
```

### Q: Skills 支持哪些 AI 工具？

- Claude Code（原生支持 + OpenSkills）
- Cursor
- Windsurf
- Aider
- 其他支持 AGENTS.md 的 AI 编程工具

### Q: OpenSkills 和 Claude Code 的 Skills 有什么区别？

它们使用**完全相同**的格式和功能，唯一区别是调用方式：
- Claude Code: `Skill("pdf")` 工具
- OpenSkills: `openskills read pdf` CLI

### Q: 为什么不用 MCP 实现 Skills？

MCP 和 Skills 解决不同的问题：
- **MCP** 用于服务器-客户端连接、动态工具、实时数据
- **Skills** 是静态的 markdown 指令，无需运行服务器

Skills 更简单，且与 Anthropic 的设计一致。

---

## 参考资源

### 官方资源

- [Anthropic Skills 仓库](https://github.com/anthropics/skills) - 官方 Skills 集合
- [What are skills?](https://docs.anthropic.com/en/docs/claude-code/skills) - 官方文档
- [Agent Skills Spec](https://github.com/anthropics/skills/tree/main/spec) - Skills 规范

### OpenSkills

- [OpenSkills GitHub](https://github.com/numman-ali/openskills) - CLI 工具仓库
- [npm: openskills](https://www.npmjs.com/package/openskills) - npm 包

### 相关工具

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Cursor](https://cursor.sh/)
- [Claude Code](https://claude.ai/code)

---

## 贡献与反馈

如果你有好的 Skill 想法或使用经验，欢迎：
1. 在团队内分享
2. 提交 Issue 或 PR 到 [OpenSkills 仓库](https://github.com/numman-ali/openskills)
3. 提交 PR 到 [Anthropic Skills 仓库](https://github.com/anthropics/skills)
4. 使用 `skill-creator` 创建并共享自定义 Skills

---

*文档版本: 1.1.0*  
*最后更新: 2024-12*
