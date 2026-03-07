import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Bell, Lock, Database, LogOut, Download, Sun, Moon, Monitor } from 'lucide-react';
import { getUserDoc } from '@/lib/firestore';

const Settings = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const handleExportData = async () => {
        try {
            if (!user?.uid) return;
            const userData = await getUserDoc(user.uid);
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "neeva_user_data.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } catch (error) {
            console.error("Failed to export data", error);
        }
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="animate-in">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
                </div>

                {/* Profile Section */}
                <div className="glass rounded-[2rem] p-8 shadow-sm animate-in">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-5 h-5 text-purple-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profile</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                            <input
                                type="text"
                                defaultValue={user?.name}
                                className="w-full px-5 py-3 bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                defaultValue={user?.email}
                                disabled
                                className="w-full px-5 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="glass rounded-[2rem] p-8 shadow-sm animate-in">
                    <div className="flex items-center gap-3 mb-6">
                        <Sun className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Appearance</h2>
                    </div>
                    <div className="space-y-4">
                        {([
                            { value: 'light' as const, label: 'Light', icon: Sun },
                            { value: 'dark' as const, label: 'Dark', icon: Moon },
                            { value: 'system' as const, label: 'System', icon: Monitor },
                        ]).map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors duration-200 border ${
                                    theme === option.value
                                        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30'
                                        : 'bg-white/50 dark:bg-white/5 border-transparent hover:bg-white/80 dark:hover:bg-white/10 hover:border-gray-200 dark:hover:border-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <option.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{option.label}</span>
                                </div>
                                {theme === option.value && (
                                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass rounded-[2rem] p-8 shadow-sm animate-in">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-5 h-5 text-amber-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        {['Daily Check-ins', 'Weekly Summaries', 'Exercise Reminders', 'Community Updates'].map((item) => (
                            <label key={item} className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                                <span className="text-gray-900 dark:text-gray-100 font-medium">{item}</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Privacy */}
                <div className="glass rounded-[2rem] p-8 shadow-sm animate-in">
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="w-5 h-5 text-green-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Privacy</h2>
                    </div>
                    <div className="space-y-4">
                        {['Anonymous Mode', 'Analytics', 'Data Sharing'].map((item) => (
                            <label key={item} className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                                <span className="text-gray-900 dark:text-gray-100 font-medium">{item}</span>
                                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Data & Account */}
                <div className="glass rounded-[2rem] p-8 shadow-sm animate-in">
                    <div className="flex items-center gap-3 mb-6">
                        <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Data & Account</h2>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center justify-between px-5 py-4 bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 font-medium transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                        >
                            <span>Export My Data</span>
                            <Download size={18} />
                        </button>
                        <button className="w-full text-left px-5 py-4 bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 font-medium transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                            Clear All Mood Data
                        </button>
                        <button className="w-full text-left px-5 py-4 bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 font-medium transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                            Clear Chat History
                        </button>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-500/20 font-medium transition-colors duration-200"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                        <button className="w-full text-left px-5 py-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 font-medium transition-colors duration-200">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
