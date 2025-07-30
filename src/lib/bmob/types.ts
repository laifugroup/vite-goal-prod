/**
 * Bmob类型定义文件
 * 注意：这些类型定义可能需要根据实际的Bmob SDK进行调整
 */

// Bmob用户类型
export interface BmobUser {
  objectId: string;
  username: string;
  email?: string;
  mobilePhoneNumber?: string;
  sessionToken?: string;
  emailVerified?: boolean;
  mobilePhoneVerified?: boolean;
  [key: string]: any;
}

// Bmob查询结果类型
export interface BmobObject {
  objectId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// 目标类型
export interface Goal extends BmobObject {
  title: string;
  status: number;
  incentiveNum: number;
  creatorId?: string;
  category?: number;
}

// 目标查询参数
export interface GoalQueryParams {
  title?: string;
  worth?: number;
  deadline?: string;
  creatorId: string;
  incentiveMode?: number; // 可以是字符串或数字
  category?: number; // 可以是字符串或数字
  status?: number; // 可以是字符串或数字
}

// 创建目标参数
export interface CreateGoalParams {
  title: string;
  worth: number;
  deadline: string;
  tasks?:string;
  incentiveNum: number; // 激励人数
  creatorId?: string;
  incentiveMode: number; // 可以是字符串或数字
  category: number; // 可以是字符串或数字
  status?: number; // 可以是字符串或数字
}
