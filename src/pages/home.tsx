import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {  Clock } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
} from "@/components/ui/pagination";
import { Header } from "@/components/header";

import { getGoalList, getCurrentUserGoals } from "@/lib/bmob/goal";

// 目标卡片接口
interface GoalCard {
  id: string;
  username: string;
  goal: string;
  worth: number;
  incentiveNum: number;
  deadline: string;
  category: string | number;
  status: string | number;
  incentiveMode: number;
}

// 分类映射
const categoryMap = {
  1: "挑战",
  2: "健康",
  3: "工作",
  4: "学习",
  5: "其他"
};

// 状态映射
const statusMap = {
  1: "激励中",
  2: "已结束"
};
// 激励模式映射
const incentiveModeMap = {
  1: "挑战模式",
  2: "众筹模式"
};

// 状态颜色映射
const statusColorMap = {
  1: "bg-blue-400", // 招募中
  2: "bg-red-400", // 已失败
};

export function HomePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<GoalCard[]>([]);
  const [myGoals, setMyGoals] = useState<GoalCard[]>([]);
  const itemsPerPage = 8;
  
  // 所有可用的分类
  const categories = Object.values(categoryMap).filter(cat => cat !== "其他");
  
  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // 加载目标数据
  useEffect(() => {
    // 添加一个标志，用于跟踪是否已经尝试过获取数据
    let hasAttemptedFetch = false;
    
    const fetchGoals = async () => {
      // 如果已经尝试过获取数据并失败，则不再重试
      if (hasAttemptedFetch) return;
      
      setIsLoading(true);
      try {
        // 获取所有目标
        const allGoalsData = await getGoalList();
        
        // 转换数据格式
        const formattedGoals = allGoalsData.map((goal: any) => ({
          id: goal.objectId,
          username: goal.username || "匿名用户",
          goal: goal.title,
          worth: goal.worth || 0,
          incentiveNum: goal.incentiveNum || 0,
          deadline: goal.deadline || "未设置",
          category: typeof goal.category === 'number' ? categoryMap[goal.category as keyof typeof categoryMap] || "其他" : goal.category,
          status: typeof goal.status === 'number' ? statusMap[goal.status as keyof typeof statusMap] || "激励中" : goal.status,
          incentiveMode: goal.incentiveMode || 1
        }));
        
        setGoals(formattedGoals);
        
        // 如果用户已登录，获取用户自己的目标
        if (isLoggedIn) {
          const myGoalsData = await getCurrentUserGoals();
          const formattedMyGoals = myGoalsData.map((goal: any) => ({
            id: goal.objectId,
            username: goal.username || "匿名用户",
            goal: goal.title,
            worth: goal.worth || 0,
            incentiveNum: goal.incentiveNum || 0,
            deadline: goal.deadline || "未设置",
            category: typeof goal.category === 'number' ? categoryMap[goal.category as keyof typeof categoryMap] || "其他" : goal.category,
            status: typeof goal.status === 'number' ? statusMap[goal.status as keyof typeof statusMap] || "激励中" : goal.status,
            incentiveMode: goal.incentiveMode || 1
          }));
          
          setMyGoals(formattedMyGoals);
        }
      } catch (error) {
        console.error("获取目标数据失败", error);
        addToast({
          title: "加载失败",
          description: "获取目标数据失败",
          type: "destructive"
        });
        // 标记已经尝试过获取数据
        hasAttemptedFetch = true;
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoals();
  }, [isLoggedIn, addToast]);

  // 过滤目标卡片
  const getFilteredGoals = () => {
    // 根据当前标签选择数据源
    const dataSource = activeTab === 'my' ? myGoals : goals;
    return dataSource.filter(goal => {
      // 分类过滤
      const matchesCategory = selectedCategory === null || goal.category === selectedCategory;
      
      return   matchesCategory;
    });
  };

  // 根据当前页码获取目标卡片
  const getCurrentGoals = () => {
    const filteredGoals = getFilteredGoals();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredGoals.slice(startIndex, endIndex);
  };

  // 计算总页数
  const totalPages = Math.ceil(getFilteredGoals().length / itemsPerPage);



  // 处理分类选择
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理登录按钮点击
  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 头部 */}
      <Header isLoggedIn={isLoggedIn} onLoginClick={handleLoginClick} />

      {/* 主要内容 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* 搜索框 */}
        
        {/* 标签切换 */}
        <Tabs defaultValue="all" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">首页</TabsTrigger>
              <TabsTrigger value="my">我的目标</TabsTrigger>
              <TabsTrigger value="incentive">激励模式</TabsTrigger>
            </TabsList>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (isLoggedIn) {
                  navigate("/create");
                } else {
                  addToast({
                    title: "需要登录",
                    description: "请先登录后再创建目标",
                    type: "destructive"
                  });
                  navigate("/login");
                }
              }}
            >
              新建目标
            </Button>
          </div>
          <TabsContent value="all">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">所有目标</h2>
              <p className="text-sm text-gray-500 mt-1">监督官微信：jiliapp</p>
            </div>
            
            {/* 分类过滤 */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  key="all"
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  全部
                </Badge>
                {categories.map(category => (
                  <Badge 
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="my">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">我的目标</h2>
              <p className="text-sm text-gray-500 mt-1">监督官微信：jiliapp</p>
            </div>
            
            {/* 分类过滤 */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  key="all"
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  全部
                </Badge>
                {categories.map(category => (
                  <Badge 
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            {!isLoggedIn && (
              <div className="text-center py-8">
                <p className="mb-4">请登录后查看您的目标</p>
                <Button onClick={handleLoginClick}>立即登录</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="incentive">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">激励模式介绍</h2>
              <p className="text-sm text-gray-500 mt-1">监督官微信：jiliapp</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold text-red-500">挑战模式</h3>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">挑战模式是一种自我激励的方式，您需要设定一个目标和金额。如果在截止日期前未能完成目标，您将损失这笔金额。</p>
                  <p className="mb-4">这种模式利用"损失厌恶"心理，激励您更加努力地完成目标。</p>
                  <p className="mb-4">需要选举"监督官"保管资金。扫码下面的二维码加官方的监督管。监督官获得5%的佣金。</p>
                  <p className="font-semibold">适合人群：</p>
                  <ul className="list-disc pl-5 mb-4">
                    <li>需要强烈外部压力的人</li>
                    <li>有明确目标但缺乏执行力的人</li>
                    <li>希望通过金钱约束提高自律性的人</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold text-green-500">众筹模式</h3>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">众筹模式让您可以获得他人的支持和鼓励。其他用户可以为您的目标提供激励，当您完成目标后，将获得支持者的奖励。</p>
                  <p className="mb-4">这种模式利用社交支持和责任感，帮助您坚持完成目标。</p>
                  <p className="mb-4">需要选举"监督官"保管资金。扫码下面的二维码加官方的监督管。监督官获得5%的佣金。</p>
                  <p className="font-semibold">适合人群：</p>
                  <ul className="list-disc pl-5 mb-4">
                    <li>需要社交支持的人</li>
                    <li>希望分享成功喜悦的人</li>
                    <li>对外部认可有较强需求的人</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">如何提高完成率？</h2>
              
              <Card className="mb-6">
                <CardHeader>
                  <h3 className="text-lg font-semibold">建立微信群打卡</h3>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">发布目标后，我们建议您创建一个微信群，邀请朋友或其他目标相似的用户加入，每天在群内打卡记录进度。</p>
                  <p>社交监督是提高目标完成率的有效方法，当有人关注您的进度时，您会更有动力坚持下去。</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">专业监督</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start">
                    <div className="md:w-2/3 md:pr-6">
                      <p className="mb-4">如果您需要更专业的监督和指导，可以扫描右侧二维码添加我们的监督官微信。</p>
                      <p className="mb-4">我们的监督官会定期检查您的进度，提供专业建议，并帮助您克服执行过程中的困难。</p>
                      <p className="font-semibold">监督官服务包括：</p>
                      <ul className="list-disc pl-5 mb-4">
                        <li>每日进度检查</li>
                        <li>专业建议和指导</li>
                        <li>心理支持和激励</li>
                        <li>目标调整和优化</li>
                      </ul>
                      <p className="mb-4">需要选举"监督官"保管资金。扫码下面的二维码加官方的监督管。监督官获得5%的佣金。</p>
                    </div>
                    <div className="md:w-1/3 flex flex-col items-center justify-start mt-4 md:mt-0">
                      <div className="text-lg font-medium mb-2 text-center">扫码添加监督官</div>
                      <img 
                        src="/wechat.jpg" 
                        alt="微信二维码" 
                        className="w-40 h-auto"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        
        </Tabs>

        {/* 目标卡片列表和分页区域 - 固定高度 */}
        <div className="flex flex-col" >
          {/* 目标卡片列表 */}
          <div className="flex-grow">
            {(activeTab !== "my" || isLoggedIn) && activeTab !== "incentive" && (
              <>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="flex justify-between">
                              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : getCurrentGoals().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 ">
                    {getCurrentGoals().map((goal) => (
                      <Card 
                        key={goal.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/goal/${goal.id}`)}
                      >
                        <CardHeader className="p-0 px-2 relative">
                          <div className="flex items-start mt-1">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-7 w-7 flex items-center justify-center bg-primary text-primary-foreground">
                                <span role="img" aria-label="target">🎯</span>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-sm">{goal.username}</h3>
                              </div>
                            </div>
                            <Badge 
                              className={`absolute top-2 right-2 text-xs text-white ${
                                typeof goal.status === 'number' ? 
                                statusColorMap[goal.status as keyof typeof statusColorMap] || "bg-cyan-400" : "bg-cyan-400"
                              }`}
                            >
                              {typeof goal.status === 'number' ? 
                                statusMap[goal.status as keyof typeof statusMap] : goal.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-2 pt-1 ">
                          <div className="flex items-center mb-1">
                            <Badge 
                              className={`text-xs text-white mr-2 ${
                                typeof goal.incentiveMode === 'number' ? 
                                (goal.incentiveMode === 1 ? "bg-red-400" : "bg-green-400") : "bg-blue-400"
                              }`}
                            >
                              {incentiveModeMap[goal.incentiveMode as keyof typeof incentiveModeMap] || "普通模式"}
                            </Badge>
                            <div className="text-3xl font-bold text-red-500 mr-2">
                              ¥{goal.worth}
                            </div>
                           
                          </div>
                          <p className="font-semibold text-base mb-2">{goal.goal}</p>
                        </CardContent>
                        <CardFooter className="p-1 pt-0 flex justify-between items-center">
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{goal.incentiveNum} 人激励</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={14} className="mr-1" />
                            <span>截止：{goal.deadline}</span>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500">没有找到匹配的目标，去创建一个吧</p>
                
                  </div>
                )}
              </>
            )}
          </div>

          {/* 分页 - 固定在底部 */}
          <div className="mt-auto pt-8">
            {(activeTab !== "my" || isLoggedIn) && activeTab !== "incentive" && totalPages > 0 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      >
                        上一页
                      </Button>
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <Button 
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      >
                        下一页
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 目标激励系统. 保留所有权利.
        </div>
      </footer>
    </div>
  );
}