import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// 移除未使用的导入
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Clock, Heart, MessageSquare, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
// 移除未使用的导入
import { useToast } from "@/lib/toast-context";
import { Header } from "@/components/header";
import { getGoalDetail, updateGoalIncentiveNum, updateGoalStatus } from "@/lib/bmob/goal";
import { createComment, getCommentsByGoalId } from "@/lib/bmob/comment";
import Bmob from "@/lib/bmob/bmob";

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
  1: "bg-green-400", // 激励中
  2: "bg-red-400" // 已结束
};

// 打卡接口
interface Comment {
  id: string;
  username: string;
  content: string;
  createdAt: string;
}

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [goal, setGoal] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [canCompleteGoal, setCanCompleteGoal] = useState(false);
  const commentsPerPage = 8;
  
  // 检查用户是否已登录 - 只在组件挂载时执行一次
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // 获取当前用户ID
    if (token) {
      const currentUser = Bmob.User.current() as any;
      if (currentUser) {
        setCurrentUserId(currentUser.objectId);
      }
    }
  }, []); // 空依赖数组确保只执行一次

  // 获取打卡列表
  const fetchComments = async (page: number) => {
    if (!goal || !goal.id) return;
    
    try {
      // 获取打卡列表
      const commentList = await getCommentsByGoalId(goal.id, page, commentsPerPage);
      
      // 转换打卡数据格式
      const formattedComments: Comment[] = commentList.map(comment => ({
        id: comment.objectId || '',
        username: comment.username || '匿名用户',
        content: comment.content,
        createdAt: comment.createdAt || new Date().toLocaleString()
      }));
      
      setComments(formattedComments);
      setCurrentPage(page);
      
      // 根据打卡列表长度估算总页数
      // 如果返回的打卡数量小于每页数量，说明这是最后一页
      if (commentList.length < commentsPerPage) {
        setTotalPages(page);
      } else {
        // 否则至少还有下一页
        setTotalPages(Math.max(page + 1, totalPages));
      }
    } catch (error) {
      console.error("获取打卡失败", error);
      addToast({
        title: "加载失败",
        description: "获取打卡列表失败",
        type: "destructive"
      });
    }
  };
  
  // 加载目标详情
  useEffect(() => {
    let isMounted = true; // 添加标记，防止组件卸载后仍然设置状态
    
    const fetchGoalDetail = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const goalData = await getGoalDetail(id);
        
        // 如果组件已卸载，不再继续执行
        if (!isMounted) return;
        
        // 转换数据格式
        const formattedGoal = {
          id: goalData.objectId,
          userId: goalData.creatorId,
          username: goalData.username || "匿名用户",
          title: goalData.title,
          worth: goalData.worth || 0,
          incentiveNum: goalData.incentiveNum || 0,
          deadline: goalData.deadline || "未设置",
          category: typeof goalData.category === 'number' ? 
            categoryMap[goalData.category as keyof typeof categoryMap] || "其他" : 
            goalData.category,
          status:statusMap[goalData.status as keyof typeof statusMap] || "激励中",
          incentiveMode: goalData.incentiveMode || 1,
          tasks: goalData.tasks || "",
          createdAt: goalData.createdAt,
          updatedAt: goalData.updatedAt
        };
        
        // 判断当前用户是否为目标创建者
        const isCurrentUserCreator = currentUserId === goalData.creatorId;
        setIsCreator(isCurrentUserCreator);
        
        // 判断是否可以完成目标（只有创建者且到达截止日期当天才能完成）
        let canComplete = false;
        if (isCurrentUserCreator && goalData.deadline) {
          const deadlineDate = new Date(goalData.deadline);
          const now = new Date();
          
          // 判断是否为同一天（年月日相同）
          const isSameDay = 
            deadlineDate.getFullYear() === now.getFullYear() &&
            deadlineDate.getMonth() === now.getMonth() &&
            deadlineDate.getDate() === now.getDate();
            
          canComplete = isSameDay;
        }
        setCanCompleteGoal(canComplete);
        
        setGoal(formattedGoal);
        // 获取打卡数据
        if (goalData.objectId) {
          try {
            // 获取打卡列表
            const commentList = await getCommentsByGoalId(goalData.objectId, 1, commentsPerPage);
            
            // 转换打卡数据格式
            const formattedComments: Comment[] = commentList.map(comment => ({
              id: comment.objectId || '',
              username: comment.username || '匿名用户',
              content: comment.content,
              createdAt: comment.createdAt || new Date().toLocaleString()
            }));
            
            setComments(formattedComments);
            setCurrentPage(1);
            
            // 根据打卡列表长度估算总页数
            setTotalPages(commentList.length < commentsPerPage ? 1 : 2);
          } catch (error) {
            console.error("获取打卡失败", error);
          }
        }
        
      } catch (error) {
        console.error("获取目标详情失败", error);
        if (isMounted) {
          addToast({
            title: "加载失败",
            description: "获取目标详情失败",
            type: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchGoalDetail();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, [id, addToast, currentUserId]); // 添加currentUserId作为依赖项

  // 处理提交打卡
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      addToast({
        title: "打卡内容不能为空",
        description: "请输入打卡内容",
        type: "destructive"
      });
      return;
    }
    
    if (!isLoggedIn) {
      addToast({
        title: "需要登录",
        description: "请先登录后再发表打卡",
        type: "destructive"
      });
      navigate("/login");
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      // 获取当前用户信息
      const currentUser = Bmob.User.current() as any;
      
      // 创建打卡数据
      const commentData = {
        goalId: goal.id,
        userId: currentUser.objectId,
        username: (() => {
          const currentUser = Bmob.User.current() as any;
          if (currentUser && currentUser.username) {
            const username = currentUser.username;
            // 只保留用户名的后4位，如果用户名长度小于4位则全部显示
            return username.length > 4 ? 
              `****${username.substring(username.length - 4)}` : 
              username;
          }
          return "匿名用户";
        })(),
        content: newComment
      };
      
      // 调用创建打卡API
      await createComment(commentData);
      // 重新获取第一页打卡
      await fetchComments(1);
      
      // 清空输入框
      setNewComment("");
      
      addToast({
        title: "打卡成功",
        description: "您的打卡已发布",
        type: "success"
      });
    } catch (error) {
      console.error("提交打卡失败", error);
      addToast({
        title: "打卡失败",
        description: "提交打卡失败，请重试",
        type: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 处理激励按钮点击
  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      addToast({
        title: "需要登录",
        description: "请先登录后再激励目标",
        type: "destructive"
      });
      navigate("/login");
      return;
    }
    
    try {
      // 更新goal接口的incentiveNum字段，使用increment方法增加1
      await updateGoalIncentiveNum(goal.id);
      
      // 更新目标的激励人数（本地状态）
      setGoal((prev: any) => ({
        ...prev,
        incentiveNum: prev.incentiveNum + 1
      }));
      
      // 显示激励成功提示
      addToast({
        title: "激励成功",
        description: "您已成功激励该目标",
        type: "success"
      });
    } catch (error) {
      console.error("激励操作失败", error);
      addToast({
        title: "操作失败",
        description: "激励操作失败，请重试",
        type: "destructive"
      });
    }
  };

  // 处理完成目标按钮点击
  const handleCompleteGoal = async () => {
    if (!isLoggedIn || !isCreator) {
      addToast({
        title: "操作失败",
        description: "只有目标创建者才能完成目标",
        type: "destructive"
      });
      return;
    }
    
    if (!canCompleteGoal) {
      addToast({
        title: "操作失败",
        description: "只能在截止日期当天完成目标",
        type: "destructive"
      });
      return;
    }
    if(goal.status=='已结束'){
       addToast({
        title: "操作成功",
        description: "您已成功完成该目标。",
        type: "success"
      });
      return;
    }
    
    try {
      // 更新目标状态为"已结束"(状态码2)
      await updateGoalStatus(goal.id, 2);
      // 显示成功提示
      addToast({
        title: "操作成功",
        description: "您已成功完成该目标",
        type: "success"
      });
    } catch (error) {
      console.error("完成目标操作失败", error);
      addToast({
        title: "操作失败",
        description: "完成目标操作失败，请重试",
        type: "destructive"
      });
    }
  };

  // 处理登录按钮点击
  const handleLoginClick = () => {
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={isLoggedIn} onLoginClick={handleLoginClick} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={isLoggedIn} onLoginClick={handleLoginClick} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">目标不存在</h2>
            <p className="mb-8">该目标可能已被删除或您没有权限查看</p>
            <Button onClick={() => navigate("/")}>返回首页</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 头部 */}
      <Header isLoggedIn={isLoggedIn} onLoginClick={handleLoginClick} />

      {/* 主要内容 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* 目标详情卡片 */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground">
                    <span role="img" aria-label="target">🎯</span>
                  </Avatar>
                  <span className="font-medium">{goal.username}</span>
                  <Badge 
                    className={`text-xs text-white ${
                      typeof goal.statusCode === 'number' ? 
                      statusColorMap[goal.statusCode as keyof typeof statusColorMap] || "bg-cyan-400" : "bg-cyan-400"
                    }`}
                  >
                    {goal.status}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{goal.title}</CardTitle>
              </div>
              <div className="flex flex-col items-end">
                <Badge 
                  className={`text-xs text-white mb-2 ${
                    goal.incentiveMode === 1 ? "bg-red-400" : "bg-green-400"
                  }`}
                >
                  {incentiveModeMap[goal.incentiveMode as keyof typeof incentiveModeMap] || "普通模式"}
                </Badge>
                <div className="text-3xl font-bold text-red-500">
                  ¥{goal.worth}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">{goal.category}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>截止日期: {goal.deadline}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Heart size={14} className="mr-1" />
                  <span>{goal.incentiveNum} 人激励</span>
                </div>
              </div>
              
              {/* 激励模式提示信息 */}
              <div className="mb-4">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium">激励模式：</span>
                  <span className={`text-sm font-medium ${goal.incentiveMode === 1 ? "text-red-500" : "text-green-500"}`}>
                    {incentiveModeMap[goal.incentiveMode as keyof typeof incentiveModeMap] || "普通模式"}
                  </span>
                </div>
                <div className={`p-3 rounded-md text-sm ${goal.incentiveMode === 1 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {goal.incentiveMode === 1 ? 
                    "挑战模式：如果未能在截止日期前完成目标，您将损失设定的金额。加油，相信自己能做到！" : 
                    "众筹模式：您的目标由支持者共同激励，完成后可获得支持者的奖励。不要让支持你的人失望！"}
                </div>
              </div>
              
              {/* 任务列表 */}
              {goal.tasks && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">任务分解</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    {goal.tasks.split('\n').map((task: string, index: number) => (
                      <div key={index} className="flex items-start mb-2 last:mb-0">
                        <div className="mr-2 mt-0.5">
                          <CheckCircle size={16} className="text-gray-400" />
                        </div>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-6">
              {isCreator ? (
                <Button 
                  variant="default"
                  className="flex-1"
                  onClick={handleCompleteGoal}
                  disabled={!canCompleteGoal}
                >
                  <CheckCircle size={16} className="mr-1" />
                  {goal.status === "激励中" ? 
                    (canCompleteGoal ? "点击完成目标" : "只能在截止日期当天完成") : 
                    "已完成目标"}
                </Button>
              ) : (
                <Button 
                  variant="default"
                  className="flex-1"
                  onClick={handleFollowToggle}
                >
                  <Heart size={16} className="mr-1" />
                  马上激励他
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* 打卡 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MessageSquare size={20} className="mr-2" />
              打卡记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 打卡输入框 */}
            <div className="mb-6">
              <Textarea
                placeholder="开始你的激励..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                >
                  {isSubmittingComment ? "提交中..." : "立即打卡"}
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* 打卡列表 */}
            {comments.length > 0 ? (
              <>
                <div className="space-y-4">
                  {comments
                    .slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage)
                    .map((comment) => (
                      <div key={comment.id} className="pb-4 border-b last:border-b-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">{comment.username}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">{comment.createdAt}</span>
                        </div>
                      </div>
                    ))}
                </div>
                
                {/* 分页控件 */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchComments(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchComments(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无打卡，快来发表第一条打卡吧
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-100 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 目标激励系统. 保留所有权利.
        </div>
      </footer>
    </div>
  );
}