import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 检查是否有token
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    
    // 在实际应用中，这里可以添加验证token有效性的逻辑
    // 例如调用API验证token或检查token是否过期
  }, []);

  // 加载状态
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已认证，渲染子组件
  return <>{children}</>;
}