/**
 * @file remove.ts
 * @description `claw-lock remove` 命令
 * 支持两种模式：
 *   1. 直接传参：claw-lock remove c001
 *   2. 交互模式：claw-lock remove（无参数时展示选择列表）
 */

import * as p from "@clack/prompts";
import { getAllConstraints, removeConstraint } from "../core/store.js";
import type { Constraint } from "../core/types.js";

const LEVEL_BADGE: Record<Constraint["level"], string> = {
  critical: "🔴",
  warning:  "🟡",
  info:     "🔵",
};

/**
 * 删除约束命令
 * @param id 命令行直接传入的约束 ID（可为空，空时进入交互模式）
 */
export async function runRemove(id: string | undefined): Promise<void> {
  // ── 直接传参模式 ──────────────────────────────────────────
  if (id && id.trim()) {
    const ok = removeConstraint(id.trim());
    if (!ok) {
      p.log.error(`未找到 ID "${id}"，运行 claw-lock list 查看所有 ID`);
      process.exit(1);
    }
    p.outro(`🗑️  约束 [${id}] 已删除`);
    return;
  }

  // ── 交互模式 ──────────────────────────────────────────────
  const constraints = getAllConstraints();

  if (constraints.length === 0) {
    p.log.info("暂无约束可删除");
    return;
  }

  p.intro("🗑️  删除约束");

  const selected = await p.select({
    message: "选择要删除的约束",
    options: constraints.map((c) => ({
      value: c.id,
      label: `${LEVEL_BADGE[c.level]} [${c.id}] ${c.text}`,
      hint: c.level,
    })),
  });

  if (p.isCancel(selected)) {
    p.cancel("已取消");
    process.exit(0);
  }

  // 二次确认，防止误删
  const confirmed = await p.confirm({
    message: `确认删除 [${selected as string}]？`,
    initialValue: false,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("已取消");
    process.exit(0);
  }

  removeConstraint(selected as string);
  p.outro(`🗑️  约束 [${selected as string}] 已删除`);
}
