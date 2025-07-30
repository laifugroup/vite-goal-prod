import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Package, 
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/lib/toast-context";

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ className, isCollapsed, toggleSidebar }: SidebarProps) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogout = () => {
    // 清除token
    localStorage.removeItem("token");
    
    // 显示通知
    addToast({
      title: "已退出登录",
      description: "您已成功退出系统",
      type: "default",
    });
    
    // 跳转到登录页面
    navigate("/login");
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300", 
        isCollapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold tracking-tight">
            金蟾寻宝
          </h2>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <Separator className="my-2" />
      
      {/* 用户信息区域 */}
      <div className={cn(
        "px-4 py-3 flex items-center",
        isCollapsed ? "justify-center" : "space-x-3"
      )}>
        <Avatar className="h-10 w-10">
          <AvatarImage src="/avatar.png" alt="用户头像" />
          <AvatarFallback>🐸</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-medium">管理员</span>
            <span className="text-xs text-muted-foreground">admin@example.com</span>
          </div>
        )}
      </div>
      
      <Separator className="my-2" />
      
      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-2"
            )}
            asChild
          >
            <Link to="/home">
              <LayoutDashboard className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>仪表盘</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-2"
            )}
            asChild
          >
            <Link to="/users">
              <Users className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>用户管理</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-2"
            )}
            asChild
          >
            <Link to="/products">
              <Package className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>产品管理</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-2"
            )}
            asChild
          >
            <Link to="/reports">
              <FileText className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>报表分析</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-2"
            )}
            asChild
          >
            <Link to="/settings">
              <Settings className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>系统设置</span>}
            </Link>
          </Button>
        </div>
      </div>
      
      {/* 底部登出按钮 */}
      <div className="mt-auto px-3 py-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isCollapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
          {!isCollapsed && <span>退出登录</span>}
        </Button>
      </div>
    </div>
  );
}