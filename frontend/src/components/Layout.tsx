import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    LayoutDashboard,
    Smile,
    Flower2,
    MessageCircle,
    AlertCircle,
    Users,
    Settings,
    LogOut,
    Sparkles,
    Sun,
    Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationManager from './NotificationManager';

const Layout = () => {
    const { logout, user } = useAuth();
    const { resolvedTheme, setTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/mood', icon: Smile, label: 'Mood' },
        { path: '/wellness', icon: Flower2, label: 'Wellness' },
        { path: '/chat', icon: MessageCircle, label: 'Chat' },
        { path: '/crisis', icon: AlertCircle, label: 'Crisis' },
        { path: '/community', icon: Users, label: 'Community' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen gradient-sky selection:bg-purple-200 dark:selection:bg-purple-800">
            <NotificationManager />
            {/* Top Glassmorphic Navigation - Floating Pill */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="glass-strong rounded-full px-2 py-2 flex items-center gap-2 shadow-2xl max-w-6xl w-full justify-between">

                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-3 px-4 group">
                        <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-serif font-bold text-2xl tracking-tight hidden md:block text-gray-800 dark:text-gray-100">
                            Neeva
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center bg-gray-100/50 dark:bg-white/5 rounded-full p-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative"
                                >
                                    <div className={`
                                        flex items-center gap-2 px-5 py-2.5 rounded-full
                                        transition-all duration-300 font-medium text-sm
                                        ${isActive
                                            ? 'text-gray-900 dark:text-gray-100'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-white/60 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/10'
                                        }
                                    `}>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNavPill"
                                                className="absolute inset-0 bg-white dark:bg-white/10 rounded-full shadow-sm border border-gray-200/50 dark:border-white/10"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-purple-600' : ''}`} />
                                        <span className="relative z-10">
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-2 px-2">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-white/10 rounded-full border border-white/50 dark:border-white/10">
                            <div className="w-8 h-8 rounded-full gradient-peach flex items-center justify-center text-white font-serif italic text-sm shadow-md">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user?.name || 'User'}
                            </span>
                        </div>
                        <button
                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-300"
                            title="Toggle theme"
                        >
                            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all duration-300"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
                <div className="glass-strong rounded-3xl px-6 py-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                        {navItems.slice(0, 5).map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative"
                                >
                                    <div className={`
                                        p-3 rounded-2xl transition-all duration-300
                                        ${isActive
                                            ? 'text-purple-600 -translate-y-2'
                                            : 'text-gray-400 dark:text-gray-500'
                                        }
                                    `}>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeMobileNav"
                                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"
                                            />
                                        )}
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-32 pb-32 md:pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
};

export default Layout;
