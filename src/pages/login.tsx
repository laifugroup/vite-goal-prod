import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginParams } from "@/lib/api/types";
import { useToast } from "@/lib/toast-context";
import { login, register } from "@/lib/bmob/user";

export function LoginPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginFormData, setLoginFormData] = useState<LoginParams>({
    username: "",
    password: "",
    grantType: 'password'
  });
  const [registerFormData, setRegisterFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    wechat: ""
  });
  //const [error, setError] = useState<string | null>(null);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({ ...prev, [name]: value }));
  };

  // 使用Bmob登录的方法
  const handleBmobLogin = async () => {
    try {
      // 使用封装好的login函数
      const result = await login(loginFormData.username, loginFormData.password);
      console.log('Bmob登录成功:', result);
      // 确保result有sessionToken属性
      if (result && result.sessionToken) {
        localStorage.setItem('token', result.sessionToken);
      }
      addToast({
        title: "登录成功",
        description: "欢迎回来！",
        type: "success"
      });
      
      navigate("/home");
      return result;
    } catch (error: any) {
      console.error('Bmob登录失败:', error);
      throw error;
    }
  };

  // 处理登录表单提交
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 使用Bmob登录
      await handleBmobLogin();
    } catch (err: any) {
      // 处理网络错误或其他异常
      addToast({
        title: "登录失败",
        description: err.error || "请检查您的网络连接",
        type: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理注册表单提交
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证密码是否匹配
    if (registerFormData.password !== registerFormData.confirmPassword) {
      addToast({
        title: "注册失败",
        description: "两次输入的密码不一致",
        type: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用注册API
      const result = await register(
        registerFormData.username, 
        registerFormData.password,
        registerFormData.wechat, // email参数
        undefined  // phone参数
      );
      console.log('注册成功:', result);
      result.username=registerFormData.username
      // 保存token
      if (result && result.sessionToken) {
        localStorage.setItem('token', result.sessionToken);
      }
      
      localStorage.setItem('bmob',  JSON.stringify(result));
      addToast({
        title: "注册成功",
        description: "账号已创建，欢迎加入！",
        type: "success"
      });
      
      // 注册成功后跳转到首页
      navigate("/home");
      
    } catch (err: any) {
      console.error('注册失败:', err);
      
      addToast({
        title: "注册失败",
        description: err.error || "请检查您的输入信息",
        type: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">目标激励系统</CardTitle>
          <CardDescription className="text-center">
            登录或注册账号以使用系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            {/* 登录表单 */}
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="login-username">账号</Label>
                    <Input
                      id="login-username"
                      name="username"
                      placeholder="请输入账号"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="username"
                      autoCorrect="off"
                      value={loginFormData.username}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="login-password">密码</Label>
                    <Input
                      id="login-password"
                      name="password"
                      placeholder="请输入密码"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      value={loginFormData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? "登录中..." : "登录"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            {/* 注册表单 */}
            <TabsContent value="register" className="mt-4">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="register-username">账号 <span className="text-red-500">*</span></Label>
                    <Input
                      id="register-username"
                      name="username"
                      placeholder="请设置账号"
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={registerFormData.username}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="register-password">密码 <span className="text-red-500">*</span></Label>
                    <Input
                      id="register-password"
                      name="password"
                      placeholder="请设置密码"
                      type="password"
                      autoCapitalize="none"
                      value={registerFormData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="confirm-password">确认密码 <span className="text-red-500">*</span></Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      placeholder="请再次输入密码"
                      type="password"
                      autoCapitalize="none"
                      value={registerFormData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="wechat">微信号</Label>
                    <Input
                      id="wechat"
                      name="wechat"
                      placeholder="选填，如需参加挑战可填写"
                      type="text"
                      value={registerFormData.wechat}
                      onChange={handleRegisterChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      如需要后续参加挑战，添加客服微信：jiliapp
                    </p>
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? "注册中..." : "注册"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 目标激励系统. 保留所有权利.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}