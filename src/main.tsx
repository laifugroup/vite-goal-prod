import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { LoginPage } from './pages/login.tsx'
import { HomePage } from './pages/home.tsx'
import { CreateGoalPage } from './pages/create-goal.tsx'
import { GoalDetailPage } from "./pages/goal-detail"

import { Layout } from './components/layout.tsx'
import { AuthGuard } from './components/auth-guard.tsx'
import { ToastContextProvider } from './lib/toast-context.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create" element={<CreateGoalPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
           <Route path="/goal/:id" element={<GoalDetailPage />} />
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          >
          </Route>
        </Routes>
      </Router>
    </ToastContextProvider>
  </React.StrictMode>,
)