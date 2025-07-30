import React, { createContext, useContext, useState, useEffect } from "react";
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast";
import { setToastService } from "./toast-service";

type ToastType = "default" | "destructive" | "success";

interface ToastData {
    id: string;
    title?: string;
    description: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: ToastData[];
    addToast: (toast: Omit<ToastData, "id">) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = (toast: Omit<ToastData, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);

        // 自动移除通知
        if (toast.duration !== Infinity) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration || 5000);
        }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // 初始化全局 toast 服务
    useEffect(() => {
        setToastService(addToast);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            <ToastProvider>
                {children}
                {toasts.map(({ id, title, description, type }) => (
                    <Toast key={id} variant={type}>
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            <ToastDescription>{description}</ToastDescription>
                        </div>
                        <ToastClose onClick={() => removeToast(id)} />
                    </Toast>
                ))}
                <ToastViewport />
            </ToastProvider>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastContextProvider");
    }
    return context;
}