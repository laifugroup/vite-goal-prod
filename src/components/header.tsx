import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick?: () => void;
}

export function Header({ isLoggedIn, onLoginClick }: HeaderProps) {
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">目标激励系统</h1>
          <div className="text-sm text-gray-500">伟大的梦想，从此处开始 [监督官微信：jiliapp]</div>
        </div>
        <div>
          {isLoggedIn ? (
            <UserDropdown />
          ) : (
            <Button onClick={handleLoginClick}>登录</Button>
          )}
        </div>
      </div>
    </header>
  );
}