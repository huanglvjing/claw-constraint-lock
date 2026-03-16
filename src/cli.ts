#!/usr/bin/env node
/**
 * @file cli.ts
 * @description CLI 入口，使用 Commander 解析命令，路由到各子命令模块
 */

import { Command } from "commander";
import { runAdd } from "./commands/add.js";
import { runInject } from "./commands/inject.js";
import { runInit } from "./commands/init.js";
import { runList } from "./commands/list.js";
import { runRemove } from "./commands/remove.js";

const program = new Command();

program
  .name("claw-lock")
  .description("🔒 防止 OpenClaw 因上下文压缩遗忘你的约束指令")
  .version("1.0.0");

// ── init ────────────────────────────────────────────────────────────────────
program
  .command("init")
  .description("注册到当前项目的 OpenClaw hooks（首次使用必须执行）")
  .action(async () => {
    await runInit();
  });

// ── add ─────────────────────────────────────────────────────────────────────
program
  .command("add [text]")
  .description("添加一条约束（不传参数时进入交互模式）")
  .option(
    "-l, --level <level>",
    "优先级：critical | warning | info（默认 critical）"
  )
  .action(async (text: string | undefined, options: { level?: string }) => {
    await runAdd(text, options.level);
  });

// ── list ────────────────────────────────────────────────────────────────────
program
  .command("list")
  .description("查看所有约束")
  .option("--json", "以 JSON 格式输出（方便脚本调用）")
  .action((options: { json?: boolean }) => {
    runList(Boolean(options.json));
  });

// ── remove ──────────────────────────────────────────────────────────────────
program
  .command("remove [id]")
  .description("删除约束（不传 ID 时进入交互选择模式）")
  .action(async (id: string | undefined) => {
    await runRemove(id);
  });

// ── inject ──────────────────────────────────────────────────────────────────
program
  .command("inject")
  .description("输出约束文本（由 OpenClaw hook 自动调用，无需手动执行）")
  .action(() => {
    runInject();
  });

program.parse();
