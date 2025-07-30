import Bmob from './bmob';

// 评论表名
const COMMENT_TABLE = 'comment';

/**
 * 评论接口
 */
export interface Comment {
  objectId?: string;
  goalId: string;      // 目标ID
  userId: string;      // 用户ID
  username: string;    // 用户名
  content: string;     // 评论内容
  createdAt?: string;  // 创建时间
  updatedAt?: string;  // 更新时间
}

/**
 * 创建评论
 * @param commentData 评论数据
 * @returns 创建结果
 */
export const createComment = (commentData: Omit<Comment, 'objectId' | 'createdAt' | 'updatedAt'>): Promise<any> => {
  const query = Bmob.Query(COMMENT_TABLE);
  
  // 设置评论数据
  Object.keys(commentData).forEach(key => {
    // 使用类型断言来避免TypeScript错误
    query.set(key, commentData[key as keyof typeof commentData]);
  });
  
  // 设置创建者为当前用户
  try {
    const currentUser = Bmob.User.current();
    if (currentUser) {
      // 使用类型断言来避免TypeScript错误
      const userObj = currentUser as any;
      if (userObj.objectId) {
        query.set('userId', userObj.objectId);
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
 * 获取目标的评论列表
 * @param goalId 目标ID
 * @param page 页码，从1开始
 * @param pageSize 每页数量
 * @returns 评论列表
 */
export const getCommentsByGoalId = (goalId: string, page: number = 1, pageSize: number = 10): Promise<Comment[]> => {
  const query = Bmob.Query(COMMENT_TABLE);
  
  // 添加查询条件
  query.equalTo('goalId', '==', goalId);
  
  // 分页
  const skip = (page - 1) * pageSize;
  query.skip(skip);
  query.limit(pageSize);
  
  // 默认按创建时间降序排列（最新的在前面）
  query.order('-createdAt');
  
  return query.find().then((res: any) => {
    // 将结果转换为Comment[]类型
    return res as Comment[];
  });
};



/**
 * 删除评论
 * @param objectId 评论ID
 * @returns 删除结果
 */
export const deleteComment = (objectId: string): Promise<any> => {
  const query = Bmob.Query(COMMENT_TABLE);
  return query.destroy(objectId);
};

// 为了兼容性，导出一个默认对象
export default {
  createComment,
  getCommentsByGoalId,
  deleteComment
};