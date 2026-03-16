/**
 * @file list.ts
 * @description `claw-lock list` 命令
 * 展示当前所有约束，支持 --json 输出机器可读格式
 */

import * as p from "@clack/prompts";
import { getAllConstraints } from "../core/store.js";
import type { Constraint } from "../core/types.js";

/** 每个优先级的图标 */
const LEVEL_BADGE: Record<Constraint["level"], string> = {
  critical: "🔴",
  warning:  "🟡",
  info:     "🔵",
};

/**
 * 列出所有约束
 * @param json 为 true 时输出 JSON 格式（方便脚本调用）
 */
export function runList(json: boolean): void {
  const constraints = getAllConstraints();

  // JSON 模式：直接输出，不加任何 UI 装饰
  if (json) {
    console.log(JSON.stringify(constraints, null, 2));
    return;
  }

  if (constraints.length === 0) {
    p.log.info("暂无约束，运行 claw-lock add 添加第一条");
    return;
  }

  p.log.message(`🔒 当前约束列表（共 ${constraints.length} 条）\n`);

  for (const c of constraints) {
    p.log.message(
      `  ${LEVEL_BADGE[c.level]} [${c.id}] ${c.text}\n` +
      `\x1b[90m       级别：${c.level}  创建：${c.createdAt.slice(0, 10)}\x1b[0m`
    );
  }
}
