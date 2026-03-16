/**
 * @file path.ts
 * @description 所有路径常量，集中管理，跨命令复用
 */

import { homedir } from "os";
import { join } from "path";

/** 工具数据根目录：~/.claw-constraint-lock */
export const DATA_DIR = join(homedir(), ".claw-constraint-lock");

/** 约束数据文件路径 */
export const STORE_FILE = join(DATA_DIR, "constraints.json");

/** OpenClaw 设置文件路径（相对于工作区根目录） */
export const OPENCLAW_SETTINGS = ".openclaw/settings.json";
