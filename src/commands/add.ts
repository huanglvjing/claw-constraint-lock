/**
 * @file add.ts
 * @description `claw-lock add` 命令
 * 支持两种模式：
 *   1. 直接传参：claw-lock add "约束内容" --level critical
 *   2. 交互模式：claw-lock add（无参数时自动进入）
 */

import * as p from "@clack/prompts";
import { addConstraint } from "../core/store.js";
import type { ConstraintLevel } from "../core/types.js";

/** 优先级选项，复用于交互模式 */
const LEVEL_OPTIONS = [
  { value: "critical", label: "🔴 Critical", hint: "强制执行，绝对不能忽略" },
  { value: "warning",  label: "🟡 Warning",  hint: "重要提醒，尽量遵守" },
  { value: "info",     label: "🔵 Info",     hint: "一般偏好，轻量提示" },
] as const;

/**
 * 添加约束命令
 * @param text    命令行直接传入的约束文本（可为空，空时进入交互模式）
 * @param level   命令行直接传入的级别（可为空）
 */
export async function runAdd(
  text: string | undefined,
  level: string | undefined
): Promise<void> {
  // ── 直接传参模式 ──────────────────────────────────────────
  if (text && text.trim()) {
    const resolvedLevel = (level ?? "critical") as ConstraintLevel;
    const constraint = addConstraint(text.trim(), resolvedLevel);

    p.outro(
      `✅ 约束已添加 [${constraint.id}]\n` +
      `   内容：${constraint.text}\n` +
      `   级别：${constraint.level}`
    );
    return;
  }

  // ── 交互模式 ──────────────────────────────────────────────
  p.intro("🔒 添加新约束");

  const inputText = await p.text({
    message: "请输入约束内容",
    placeholder: "例如：执行任何写操作前必须等我确认",
    validate: (v) => (!v?.trim() ? "约束内容不能为空" : undefined),
  });

  if (p.isCancel(inputText)) {
    p.cancel("已取消");
    process.exit(0);
  }

  const inputLevel = await p.select({
    message: "选择优先级",
    options: LEVEL_OPTIONS as unknown as { value: string; label: string; hint: string }[],
  });

  if (p.isCancel(inputLevel)) {
    p.cancel("已取消");
    process.exit(0);
  }

  const constraint = addConstraint(
    inputText.trim(),
    inputLevel as ConstraintLevel
  );

  p.outro(`✅ 约束已添加 [${constraint.id}]`);
}
