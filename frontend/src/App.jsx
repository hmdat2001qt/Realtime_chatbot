
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage'
import Navbar from './components/NavBar'
import { useAuthStore } from './store/useAuthStore'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import { useEffect } from 'react'
import { Loader } from 'lucide-react'
import SettingPage from './pages/SettingPage'
import { useThemeStore } from './store/useThemeStore'

function App() {
  const {authUser, onlineUsers, checkAuth, isCheckingAuth} = useAuthStore()
  console.log('Online Users: ',onlineUsers)
  const {theme} = useThemeStore();

  

  useEffect(() => {
    checkAuth();
  }, [checkAuth])
  console.log('authUser: ',authUser)
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage />: <Navigate to='/login'/>} />
        <Route path="/signup" element={!authUser ? <SignUpPage />: <Navigate to='/' /> } />    
        <Route path="/login" element={!authUser ? <LoginPage />: <Navigate to='/'/> } />
        <Route path="/profile" element={authUser ? <ProfilePage />: <Navigate to='/'/> } />
        <Route path="/settings" element={<SettingPage/> } />
        
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
