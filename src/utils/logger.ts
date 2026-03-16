/**
 * @file logger.ts
 * @description 统一的彩色日志输出工具，避免直接使用 console.log 散落各处
 */

/** ANSI 颜色码 */
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
} as const;

const c = (color: keyof typeof COLORS, text: string): string =>
  `${COLORS[color]}${text}${COLORS.reset}`;

export const logger = {
  /** 操作成功 */
  success: (msg: string) => console.log(`${c("green", "✅")} ${msg}`),

  /** 警告提示 */
  warn: (msg: string) => console.log(`${c("yellow", "⚠️ ")} ${msg}`),

  /** 错误信息（输出到 stderr） */
  error: (msg: string) => console.error(`${c("red", "❌")} ${msg}`),

  /** 信息提示 */
  info: (msg: string) => console.log(`${c("blue", "ℹ️ ")} ${msg}`),

  /** 普通文本 */
  log: (msg: string) => console.log(msg),

  /** 次要说明文字 */
  dim: (msg: string) => console.log(c("gray", msg)),
};
