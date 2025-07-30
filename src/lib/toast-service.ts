// 全局 Toast 服务，可以在非 React 组件中使用
type ToastType = "default" | "destructive" | "success";

interface ToastOptions {
  title?: string;
  description: string;
  type: ToastType;
  duration?: number;
}

// 存储 addToast 函数的引用
let addToastFunction: ((options: ToastOptions) => void) | null = null;

// 设置 addToast 函数
export const setToastService = (addToast: (options: ToastOptions) => void) => {
  addToastFunction = addToast;
};

// 显示 toast
export const showToast = (options: ToastOptions) => {
  if (addToastFunction) {
    addToastFunction(options);
  } else {
    console.warn('Toast service not initialized');
  }
};