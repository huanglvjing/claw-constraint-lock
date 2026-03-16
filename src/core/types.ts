/**
 * @file types.ts
 * @description 所有核心类型定义，集中管理避免分散
 */

/** 约束优先级等级 */
export type ConstraintLevel = "critical" | "warning" | "info";

/** 单条约束项 */
export interface Constraint {
  /** 唯一 ID，格式 c001 / c002 */
  id: string;
  /** 约束正文，用户自定义文字 */
  text: string;
  /** 优先级：critical = 红色强制 / warning = 黄色提醒 / info = 蓝色信息 */
  level: ConstraintLevel;
  /** ISO 8601 创建时间 */
  createdAt: string;
}

/** constraints.json 根结构 */
export interface ConstraintStore {
  /** schema 版本，方便未来迁移 */
  version: string;
  constraints: Constraint[];
}

/** CLI add 命令的选项 */
export interface AddOptions {
  level?: ConstraintLevel;
}

/** CLI list 命令的选项 */
export interface ListOptions {
  json?: boolean;
}
