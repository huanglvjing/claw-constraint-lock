/**
 * @file init.ts
 * @description `claw-lock init` 命令
 * 将工具注册到当前项目的 OpenClaw hooks，使用 @clack/prompts 展示交互式进度
 */

import * as p from "@clack/prompts";
import { registerHooks } from "../core/hooks.js";

/**
 * 初始化：注册 PreCompact / PreToolUse hook 到 .openclaw/settings.json
 */
export async function runInit(): Promise<void> {
  p.intro("🔒 claw-constraint-lock 初始化");

  const spinner = p.spinner();
  spinner.start("正在注册到 OpenClaw hooks...");

  try {
    registerHooks();
    spinner.stop("已成功注册到 OpenClaw hooks！");

    p.note(
      [
        "写入路径：.openclaw/settings.json",
        "触发时机：PreCompact（压缩前）+ PreToolUse（写操作前）",
      ].join("\n"),
      "注册详情"
    );

    p.outro("下一步：运行 claw-lock add 添加你的第一条约束 🎉");
  } catch (err) {
    spinner.stop("注册失败");
    p.cancel(`错误：${(err as Error).message}`);
    process.exit(1);
  }
}
