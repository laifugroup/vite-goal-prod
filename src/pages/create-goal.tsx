import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createGoal } from "@/lib/bmob/goal";
import { CreateGoalParams } from "@/lib/bmob/types";
import { useToast } from "@/lib/toast-context";
import { DatePicker } from "@/components/ui/date-picker";
import { Header } from "@/components/header";
// 移除未使用的导入
import Bmob from "@/lib/bmob/bmob";

export function CreateGoalPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState<CreateGoalParams>({
    title: "",
    worth: 100,
    deadline: "",
    incentiveNum:0,
    incentiveMode: 1, // 默认挑战模式的数字编号
    category: 1 // 默认挑战的数字编号
  });
  
  // 用于UI显示的分类
  const [displayCategory, setDisplayCategory] = useState<string>("挑战");

  // 分解任务
  const [tasks, setTasks] = useState<string[]>([]);

  // 激励模式
  const [displayIncentiveMode, setDisplayIncentiveMode] = useState<string>("挑战模式");

  // 可选的目标分类及其对应的数字编号
const categoryMap = {
  1: "挑战",
  2: "健康",
  3: "工作",
  4: "学习",
  5: "其他"
};
  // 不需要单独存储分类键，直接使用 Object.values(categoryMap) 获取分类名称
  
  // 根据分类获取目标标题提示语
  const getTitlePlaceholder = (category: string) => {
    switch (category) {
      case "健康":
        return "例如：30天减重5kg";
      case "学习":
        return "例如：期末成绩提到到90分以上";
       case "工作":
        return "例如：今年赚100w";
      case "挑战":
        return "例如：3小时速通换成绿道";
      case "其他":
        return "请输入你的定制目标";
      default:
        return "请输入你的目标";
    }
  };
  
  // 可选的激励模式及其对应的数字编号
  const incentiveModeMap = {
    "挑战模式": 1,
    "众筹模式": 2
  };
  const incentiveModes = Object.keys(incentiveModeMap);
  
  // 状态编号映射
  const statusMap = {
    "激励中": 1,
    "已结束": 2
  };

  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // 如果未登录，跳转到登录页面
      addToast({
        title: "需要登录",
        description: "请先登录后再创建目标",
        type: "destructive"
      });
      navigate("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate, addToast]);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理数值输入变化
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  // 处理分类选择变化
  const handleCategoryChange = (value: string) => {
    // 更新UI显示的分类
    setDisplayCategory(value);
    // 更新表单数据中的分类编号
    // 查找分类名称对应的数字编号
    const categoryId = Object.entries(categoryMap).find(([_, name]) => name === value)?.[0];
    if (categoryId) {
      setFormData(prev => ({ 
        ...prev, 
        category: parseInt(categoryId) 
      }));
    }
  };

  // 处理激励模式选择变化
  const handleIncentiveModeChange = (value: string) => {
    // 更新UI显示的激励模式
    setDisplayIncentiveMode(value);
    // 更新表单数据中的激励模式编号
    setFormData(prev => ({ 
      ...prev, 
      incentiveMode: incentiveModeMap[value as keyof typeof incentiveModeMap] 
    }));
  };

  // 处理添加任务
  const handleAddTask = () => {
    if (tasks.length < 3) {
      setTasks([...tasks, ""]);
    }
  };

  // 处理删除任务
  const handleDeleteTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  // 处理任务输入变化
  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.title.trim()) {
      addToast({
        title: "验证失败",
        description: "请输入目标标题",
        type: "destructive"
      });
      return;
    }

    if (!formData.deadline) {
      addToast({
        title: "验证失败",
        description: "请选择截止日期",
        type: "destructive"
      });
      return;
    }

    if (formData.worth <= 0) {
      addToast({
        title: "验证失败",
        description: "目标价值必须大于0",
        type: "destructive"
      });
      return;
    }

    // 过滤掉空的任务
    const validTasks = tasks.filter(task => task.trim() !== "");
    
    setIsLoading(true);
    try {
      // 将任务列表作为描述提交
      const tasks = validTasks.length > 0 
        ? validTasks.map((task) => `${task}`).join("\n")
        : "";
      
      // 调用Bmob API创建目标
      const goalData = {
        ...formData,
        tasks: tasks,
        status: statusMap["激励中"], // 使用数字编号 1
        incentiveMode: formData.incentiveMode, // 已经是数字编号
        category: formData.category, // 已经是数字编号
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
      };
      
      const result = await createGoal(goalData);
      console.log('目标创建成功:', result);
      
      addToast({
        title: "创建成功",
        description: "目标已成功创建",
        type: "success"
      });
      
      // 创建成功后跳转到首页
      navigate("/");
    } catch (err: any) {
      addToast({
        title: "创建失败",
        description: err.message || "创建目标失败，请重试",
        type: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 如果未登录，不渲染页面内容
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 头部 */}
      <Header isLoggedIn={isLoggedIn} onLoginClick={() => navigate("/login")} />

      {/* 主要内容 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Card className="w-[600px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">创建新目标</CardTitle>
              <CardDescription className="text-center">
                设定一个明确的目标    我来激励你
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">目标分类 <span className="text-red-500">*</span></Label>
                  <div className="w-full">
                    <Select 
                      value={displayCategory} 
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(categoryMap).map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">目标标题 <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder={getTitlePlaceholder(displayCategory)}
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="incentiveMode">激励模式 <span className="text-red-500">*</span></Label>
                    <div className="w-full">
                      <Select 
                        value={displayIncentiveMode} 
                        onValueChange={handleIncentiveModeChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="选择激励模式" />
                        </SelectTrigger>
                        <SelectContent>
                          {incentiveModes.map(mode => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="worth">目标价值（¥） <span className="text-red-500">*</span></Label>
                    <Input
                      id="worth"
                      name="worth"
                      type="number"
                      min="1"
                      placeholder="100"
                      value={formData.worth}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                </div>
     
                  <div className="grid gap-2">
                    <p className="text-xs text-gray-500 mt-1">
                      {displayIncentiveMode === "众筹模式" 
                        ? "众筹模式：设置具有挑战性的目标,他人为您提供资金支持，帮助你实现目标。" 
                        : "挑战模式：设置一个具有挑战性的目标，双方相同支付1倍保证金，完成目标后返还，否则保证金将被扣除。"}
                    </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="deadline">完成日期 <span className="text-red-500">*</span></Label>
                  <DatePicker
                    date={formData.deadline ? new Date(formData.deadline) : undefined}
                    setDate={(date) => {
                      if (date) {
                        // 修复时区问题，确保日期不会偏移
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          deadline: formattedDate
                        }));
                      }
                    }}
                    placeholder="选择完成日期"
                    className="w-full"
                  />
                </div>
                
                <div className="grid gap-2 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>分解任务(可选)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTask}
                      disabled={tasks.length >= 3}
                      className={tasks.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加任务({tasks.length}/3)
                    </Button>
                  </div>
                  
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder={`将目标分解成可执行的任务`}
                        value={task}
                        onChange={(e) => handleTaskChange(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center pt-6">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "创建中..." : "立即创建目标"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground text-center">
                创建目标后，其他用户可以关注并激励你
              </p>
            </CardFooter>
          </Card>
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