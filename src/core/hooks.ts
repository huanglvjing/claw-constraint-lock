/**
 * @file hooks.ts
 * @description 负责将 claw-constraint-lock 注册为 OpenClaw 的 Hook
 * 写入 .openclaw/settings.json，无需用户手动配置
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { OPENCLAW_SETTINGS } from "../utils/path.js";

/** Hook 命令：由 OpenClaw 在对应生命周期调用 */
const HOOK_COMMAND = "npx claw-constraint-lock inject";

/** Hook 注入目标生命周期 */
const HOOK_EVENTS = ["PreCompact", "PreToolUse"] as const;

/** 需要触发约束注入的工具关键词（写操作） */
const WRITE_TOOL_MATCHER = "write|delete|execute|bash|shell";

interface HookEntry {
  hooks: Array<{ type: string; command: string }>;
  matcher?: string;
}

interface OpenClawSettings {
  hooks?: Record<string, HookEntry[]>;
  [key: string]: unknown;
}

/**
 * 读取 .openclaw/settings.json，不存在则返回空对象
 */
function readSettings(cwd: string): OpenClawSettings {
  const file = join(cwd, OPENCLAW_SETTINGS);
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, "utf-8")) as OpenClawSettings;
}

/**
 * 将 settings 对象写回磁盘
 */
function writeSettings(cwd: string, settings: OpenClawSettings): void {
  const file = join(cwd, OPENCLAW_SETTINGS);
  const dir = dirname(file);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(settings, null, 2), "utf-8");
}

/**
 * 将 claw-constraint-lock 注册进当前项目的 OpenClaw hooks
 * 幂等操作：重复调用不会重复插入
 * @param cwd 工作区根目录，默认 process.cwd()
 */
export function registerHooks(cwd = process.cwd()): void {
  const settings = readSettings(cwd);
  if (!settings.hooks) settings.hooks = {};

  // PreCompact：上下文压缩前注入所有约束（核心防遗忘机制）
  settings.hooks.PreCompact = dedupeHook(settings.hooks.PreCompact, {
    hooks: [{ type: "command", command: HOOK_COMMAND }],
  });

  // PreToolUse：每次写操作工具调用前二次注入（双重保险）
  settings.hooks.PreToolUse = dedupeHook(settings.hooks.PreToolUse, {
    matcher: WRITE_TOOL_MATCHER,
    hooks: [{ type: "command", command: HOOK_COMMAND }],
  });

  writeSettings(cwd, settings);
}

/**
 * 移除当前项目 OpenClaw hooks 中的 claw-constraint-lock 条目
 * @param cwd 工作区根目录
 */
export function unregisterHooks(cwd = process.cwd()): void {
  const settings = readSettings(cwd);
  if (!settings.hooks) return;

  for (const event of HOOK_EVENTS) {
    const entries = settings.hooks[event];
    if (!entries) continue;
    settings.hooks[event] = entries.filter(
      (e) => !e.hooks.some((h) => h.command === HOOK_COMMAND)
    );
  }

  writeSettings(cwd, settings);
}

/**
 * 幂等追加 hook 条目：如果相同 command 已存在则跳过
 */
function dedupeHook(
  existing: HookEntry[] | undefined,
  entry: HookEntry
): HookEntry[] {
  const list = existing ?? [];
  const alreadyExists = list.some((e) =>
    e.hooks.some((h) => h.command === HOOK_COMMAND)
  );
  if (alreadyExists) return list;
  return [...list, entry];
}
