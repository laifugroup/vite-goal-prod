import Bmob from './bmob';
import { Goal } from './types';

// 目标表名
const GOAL_TABLE = 'goal';

/**
 * 创建新目标
 * @param goalData 目标数据
 * @returns 创建结果
 */
export const createGoal = (goalData: Record<string, any>): Promise<any> => {
  const query = Bmob.Query(GOAL_TABLE);
  // 设置目标数据
  Object.keys(goalData).forEach(key => {
    query.set(key, goalData[key]);
  });
  // 设置创建者为当前用户
  try {
    const currentUser = Bmob.User.current();
    if (currentUser) {
      // 使用类型断言来避免TypeScript错误
      const userObj = currentUser as any;
      if (userObj.objectId) {
        query.set('creatorId', userObj.objectId);
      }
    }
  } catch (error) {
    console.warn('设置创建者信息失败', error);
  }
  
  // 使用Promise包装Bmob的返回值，确保类型兼容
  return new Promise((resolve, reject) => {
    query.save().then((res: any) => {
      resolve(res);
    }).catch((error: any) => {
      reject(error);
    });
  });
};

/**
 * 获取目标列表
 * @param conditions 查询条件
 * @returns 目标列表
 */
export const getGoalList = (conditions?: Record<string, any>): Promise<any> => {
  const query = Bmob.Query(GOAL_TABLE);
  
  // 添加查询条件
  if (conditions) {
    Object.keys(conditions).forEach(key => {
      query.equalTo(key, '==', conditions[key]);
    });
  }
  
  // 默认按创建时间降序排列
  query.order('-createdAt');
  
  return query.find().then((res: any) => {
    // 将结果转换为Goal[]类型
    return res as Goal[];
  });
};

/**
 * 获取当前用户的目标列表
 * @returns 当前用户的目标列表
 */
export const getCurrentUserGoals = (): Promise<any> => {
  try {
    const currentUser = Bmob.User.current();
    if (!currentUser) {
      throw new Error('用户未登录');
    }
    
    const query = Bmob.Query(GOAL_TABLE);
    // 使用类型断言来避免TypeScript错误
    const userObj = currentUser as any;
    if (userObj.objectId) {
      query.equalTo('creatorId', '==', userObj.objectId);
    }
    query.order('-createdAt');
    
    return query.find().then((res: any) => {
      // 将结果转换为Goal[]类型
      return res as Goal[];
    });
  } catch (error) {
    console.error('获取用户目标失败', error);
    return Promise.reject(error);
  }
};

/**
 * 获取目标详情
 * @param objectId 目标ID
 * @returns 目标详情
 */
export const getGoalDetail = (objectId: string): Promise<Goal> => {
  const query = Bmob.Query(GOAL_TABLE);
  // 使用Promise包装Bmob的返回值，确保类型兼容
  return new Promise((resolve, reject) => {
    query.get(objectId).then((res: any) => {
      // 将结果转换为Goal类型
      resolve(res as Goal);
    }).catch((error: any) => {
      reject(error);
    });
  });
};

/**
 * 更新目标
 * @param objectId 目标ID
 * @param goalData 目标数据
 * @returns 更新结果
 */
export const updateGoal = (objectId: string, goalData: Record<string, any>): Promise<any> => {
  const query = Bmob.Query(GOAL_TABLE);
  query.set('id', objectId);
  
  Object.keys(goalData).forEach(key => {
    query.set(key, goalData[key]);
  });
  
  return query.save();
};

/**
 * 删除目标
 * @param objectId 目标ID
 * @returns 删除结果
 */
export const deleteGoal = (objectId: string): Promise<any> => {
  const query = Bmob.Query(GOAL_TABLE);
  return query.destroy(objectId);
};



/**
 * 更新目标激励人数（增加1）
 * @param objectId 目标ID
 * @returns 更新结果
 */
export const updateGoalIncentiveNum = (objectId: string): Promise<any> => {
  const query = Bmob.Query(GOAL_TABLE);
  // 使用Promise包装Bmob的返回值，确保类型兼容
  return new Promise((resolve, reject) => {
    query.get(objectId).then((res: any) => {
      // 使用类型断言来避免TypeScript错误
      const goalObj = res as any;
      goalObj.increment('incentiveNum');
      goalObj.save().then((saveRes: any) => {
        resolve(saveRes);
      }).catch((err: any) => {
        reject(err);
      });
    }).catch((err: any) => {
      reject(err);
    });
  });
};

/**
 * 更新目标状态
 * @param objectId 目标ID
 * @param status 新状态
 * @returns 更新结果
 */
export const updateGoalStatus = (objectId: string, status: number): Promise<any> => {
  const query = Bmob.Query(GOAL_TABLE);
  let aa=query as any
  aa.set('id', objectId);
  // 将数字转换为字符串，以符合Bmob的API要求
  aa.set('status', status);
  return aa.save();
};

// 为了兼容性，仍然导出一个默认对象
export default {
  createGoal,
  getGoalList,
  getCurrentUserGoals,
  getGoalDetail,
  updateGoal,
  deleteGoal,
  updateGoalStatus,
  updateGoalIncentiveNum
};
