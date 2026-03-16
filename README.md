# 🔒 claw-constraint-lock

> 防止 OpenClaw 因上下文压缩遗忘你的关键约束指令

[![npm version](https://img.shields.io/npm/v/claw-constraint-lock)](https://www.npmjs.com/package/claw-constraint-lock)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

---

## 🤔 为什么需要它？

你是否遇到过这种情况：

> 你告诉 OpenClaw："处理我的邮件，**但在我批准前不要执行任何删除操作**"  
> 由于邮件太多触发了上下文压缩，OpenClaw 把这句话**忘掉了**  
> 结果它开始疯狂删除邮件，你连续输入"停止"也无法阻止  

**这是 OpenClaw 的已知缺陷**：上下文压缩（Context Compaction）会丢弃早期的约束指令。

`claw-constraint-lock` 通过 **PreCompact Hook** 机制，在每次上下文压缩前自动将你的约束重新注入 AI 上下文，让它**永远不会被遗忘**。

---

## ✨ 特性

- 🔒 **约束永久生效**：通过 PreCompact Hook 防止约束被压缩丢弃
- ⚡ **双重保险**：写操作前（PreToolUse）再次注入，双重保护
- 🎯 **三级优先级**：critical / warning / info，清晰区分约束重要程度
- 📦 **零依赖**：不引入任何第三方 npm 包，轻量安全
- 🔧 **一行安装**：`npx claw-constraint-lock init` 即可完成注册

---

## 🚀 快速开始

### 第一步：在项目目录初始化

```bash
cd your-project
npx claw-constraint-lock init
```

这会自动将工具注册到 `.openclaw/settings.json` 的 hooks 配置中。

### 第二步：添加你的约束

```bash
# 添加高危约束（默认 critical 级别）
npx claw-lock add "执行任何写操作前必须等我确认"

# 指定级别
npx claw-lock add "禁止删除任何文件" --level critical
npx claw-lock add "操作前请给我一个简短的计划" --level warning
npx claw-lock add "优先使用中文回复" --level info
```

### 第三步：正常使用 OpenClaw

之后你无需做任何额外操作，每次 OpenClaw 压缩上下文前，你的约束会自动注入。

---

## 📖 完整命令

| 命令 | 说明 |
|------|------|
| `claw-lock init` | 注册到当前项目 OpenClaw hooks（首次必须执行） |
| `claw-lock add <内容> [--level critical\|warning\|info]` | 添加约束 |
| `claw-lock list` | 查看所有约束 |
| `claw-lock list --json` | 以 JSON 格式输出（方便脚本使用） |
| `claw-lock remove <id>` | 删除指定约束（ID 从 list 获取） |
| `claw-lock inject` | 输出约束文本（由 hook 自动调用，无需手动执行） |

---

## 📁 项目结构

```
claw-constraint-lock/
├── src/
│   ├── cli.ts                  # CLI 入口，命令路由
│   ├── commands/
│   │   ├── init.ts             # init 命令：注册 hooks
│   │   ├── add.ts              # add 命令：添加约束
│   │   ├── list.ts             # list 命令：查看约束
│   │   ├── remove.ts           # remove 命令：删除约束
│   │   └── inject.ts           # inject 命令：输出约束（被 hook 调用）
│   ├── core/
│   │   ├── store.ts            # 数据持久化层
│   │   ├── hooks.ts            # OpenClaw hooks 注册逻辑
│   │   └── types.ts            # TypeScript 类型定义
│   └── utils/
│       ├── logger.ts           # 彩色日志工具
│       └── path.ts             # 路径常量
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/huanglvjing/claw-constraint-lock.git
cd claw-constraint-lock

# 2. 安装依赖
npm install

# 3. 编译
npm run build

# 4. 本地测试
node dist/cli.js --help
node dist/cli.js init
node dist/cli.js add "测试约束"
node dist/cli.js list
```

---

## 🔧 工作原理

```
OpenClaw 触发上下文压缩
        ↓
PreCompact Hook 被调用
        ↓
claw-lock inject 执行
        ↓
约束文本输出到 stdout
        ↓
OpenClaw 将约束纳入压缩摘要
        ↓
新的上下文中约束依然存在 ✅
```

约束数据存储于 `~/.claw-constraint-lock/constraints.json`，全局共享，所有项目通用。

---

## 📄 License

MIT © your-name
