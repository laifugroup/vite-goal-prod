import Bmob from './bmob';
import { BmobUser } from './types';

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录成功的用户信息
 */
export const login = (username: string, password: string): Promise<BmobUser> => {
  return Bmob.User.login(username, password).then((res: any) => {
    // 确保返回的是BmobUser类型
    return res as BmobUser;
  });
};

/**
 * 获取当前用户
 * @returns 当前登录的用户信息
 */
export const getCurrentUser = (): BmobUser | null => {
  const user = Bmob.User.current();
  return user ? (user as any as BmobUser) : null;
};

/**
 * 退出登录
 */
export const logout = (): any => {
  return Bmob.User.logout();
};

/**
 * 用户注册
 * @param username 用户名
 * @param password 密码
 * @param email 邮箱（可选）
 * @param phone 手机号（可选）
 * @returns 注册成功的用户信息
 */
export const register = (
  username: string, 
  password: string, 
  email?: string, 
  phone?: string
): Promise<BmobUser> => {
  // 使用Bmob提供的register方法
  let emailValue = email;
  
  // 如果提供了email但不是有效的邮箱格式，则添加后缀
  if (emailValue && !emailValue.includes('@')) {
    emailValue = emailValue + "@goal.com";
  }
  
  const params: any = {
    "username": username,
    "password": password,
    "email": emailValue
  };
  
  if (phone) {
    params.mobilePhoneNumber = phone;
  }
  
  return Bmob.User.register(params).then((res: any) => {
    return res as BmobUser;
  });
};
