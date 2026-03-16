/**
 * @file store.ts
 * @description 约束数据的持久化层，负责读写 ~/.claw-constraint-lock/constraints.json
 * 所有命令通过此模块存取数据，不直接操作文件系统
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { DATA_DIR, STORE_FILE } from "../utils/path.js";
import type { Constraint, ConstraintLevel, ConstraintStore } from "./types.js";

/** 当前 schema 版本，用于未来数据迁移 */
const SCHEMA_VERSION = "1.0.0";

/** 空 store 初始值 */
const EMPTY_STORE: ConstraintStore = {
  version: SCHEMA_VERSION,
  constraints: [],
};

/**
 * 读取 store，如果文件/目录不存在则自动初始化
 */
export function loadStore(): ConstraintStore {
  if (!existsSync(STORE_FILE)) {
    return EMPTY_STORE;
  }
  const raw = readFileSync(STORE_FILE, "utf-8");
  return JSON.parse(raw) as ConstraintStore;
}

/**
 * 将 store 写回磁盘
 * @param store 要保存的数据
 */
export function saveStore(store: ConstraintStore): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

/**
 * 生成下一个约束 ID（c001, c002, ...）
 * @param constraints 现有约束列表
 */
export function nextId(constraints: Constraint[]): string {
  const max = constraints.reduce((acc, c) => {
    const n = parseInt(c.id.slice(1), 10);
    return n > acc ? n : acc;
  }, 0);
  return `c${String(max + 1).padStart(3, "0")}`;
}

/**
 * 添加一条新约束
 * @param text  约束正文
 * @param level 优先级，默认 critical
 * @returns 新建的约束对象
 */
export function addConstraint(
  text: string,
  level: ConstraintLevel = "critical"
): Constraint {
  const store = loadStore();
  const constraint: Constraint = {
    id: nextId(store.constraints),
    text,
    level,
    createdAt: new Date().toISOString(),
  };
  store.constraints.push(constraint);
  saveStore(store);
  return constraint;
}

/**
 * 删除指定 ID 的约束
 * @param id 约束 ID（如 c001）
 * @returns 是否找到并删除成功
 */
export function removeConstraint(id: string): boolean {
  const store = loadStore();
  const before = store.constraints.length;
  store.constraints = store.constraints.filter((c) => c.id !== id);
  if (store.constraints.length === before) return false;
  saveStore(store);
  return true;
}

/**
 * 获取全部约束列表
 */
export function getAllConstraints(): Constraint[] {
  return loadStore().constraints;
}
