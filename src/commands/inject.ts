/**
 * @file inject.ts
 * @description `claw-lock inject` 命令
 *
 * 此命令由 OpenClaw 的 Hook 系统自动调用，用户无需手动执行。
 * 将所有约束以结构化文本输出到 stdout，OpenClaw 将其纳入上下文摘要。
 * 故意不使用 @clack/prompts（输出必须纯净，不能有 UI 控制字符）。
 */

import { getAllConstraints } from "../core/store.js";
import type { Constraint } from "../core/types.js";

/** 每个优先级对应的注入标签 */
const LEVEL_TAG: Record<Constraint["level"], string> = {
  critical: "🔴 [CRITICAL]",
  warning:  "🟡 [WARNING]",
  info:     "🔵 [INFO]",
};

/** 优先级排序权重 */
const LEVEL_ORDER: Record<Constraint["level"], number> = {
  critical: 0,
  warning:  1,
  info:     2,
};

/**
 * 将约束文本输出到 stdout，供 OpenClaw hook 消费
 * critical 约束始终排在最前
 */
export function runInject(): void {
  const constraints = getAllConstraints();

  // 无约束时静默退出，避免向 OpenClaw 注入空噪音
  if (constraints.length === 0) return;

  const sorted = [...constraints].sort(
    (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
  );

  const lines = [
    "╔══════════════════════════════════════════════╗",
    "║   🔒 LOCKED CONSTRAINTS — 永不可忽略          ║",
    "║   以下约束在整个会话中始终有效，即使压缩上下文  ║",
    "╠══════════════════════════════════════════════╣",
    ...sorted.map((c) => `║  ${LEVEL_TAG[c.level]} ${c.text}`),
    "╚══════════════════════════════════════════════╝",
  ];

  process.stdout.write(lines.join("\n") + "\n");
}
