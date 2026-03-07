import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Heart, MessageCircle, Sparkles, ArrowRight, Zap, Calendar, Target, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import CircularText from '@/components/CircularText';
import { getMoodLogs, getExerciseHistory } from '@/lib/firestore';
import { computeMoodStats, computeExerciseStats } from '@/lib/stats';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: moodStats } = useQuery({
        queryKey: ['moodStats', user?.uid],
        queryFn: async () => {
            if (!user?.uid) return null;
            const logs = await getMoodLogs(user.uid);
            return computeMoodStats(logs as any);
        },
        enabled: !!user?.uid,
    });

    const { data: exerciseStats } = useQuery({
        queryKey: ['exerciseStats', user?.uid],
        queryFn: async () => {
            if (!user?.uid) return null;
            const exercises = await getExerciseHistory(user.uid);
            return computeExerciseStats(exercises as any);
        },
        enabled: !!user?.uid,
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const hasData = (moodStats?.total_entries || 0) > 0 || (exerciseStats?.sessions_completed || 0) > 0;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-12 relative">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 hidden lg:block opacity-10 pointer-events-none">
                <CircularText text="YOUR JOURNEY • YOUR PACE • YOUR GROWTH • " radius={120} />
            </div>

            {/* Hero Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center md:text-left relative z-10"
            >
                <h1 className="text-6xl md:text-7xl font-serif font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                    {getGreeting()}, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 italic pr-2">
                        {user?.name?.split(' ')[0] || 'Friend'}
                    </span>
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl font-light">
                    {hasData
                        ? "Your wellness journey is unfolding beautifully. Let's continue the momentum."
                        : "Every great journey begins with a single step. We're here to guide you."}
                </p>
            </motion.div>

            {/* Quick Input / Search Bar Placeholder (Visual Only as requested) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-strong rounded-full p-2 max-w-2xl shadow-xl flex items-center gap-4 pr-4 group hover:shadow-2xl transition-all duration-500"
            >
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 dark:group-hover:bg-purple-500/20 transition-colors">
                    <Sparkles className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder="How are you feeling right now?"
                    className="flex-1 bg-transparent border-none outline-none text-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                />
                <button className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                </button>
            </motion.div>

            {/* Bento Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                {/* Large Featured Card - Mood Tracker */}
                <motion.div
                    variants={item}
                    className="md:col-span-2 md:row-span-2 bento-card gradient-purple p-10 text-white relative overflow-hidden group cursor-pointer"
                    onClick={() => navigate('/mood')}
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                <Heart className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif font-bold">Mood Tracker</h2>
                                <p className="text-white/70">Daily emotional check-in</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            {(moodStats?.total_entries || 0) > 0 ? (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/80 text-sm mb-2 uppercase tracking-wider font-medium">Average Mood</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-7xl font-serif font-bold">{moodStats?.average_mood || 0}</p>
                                            <span className="text-2xl text-white/60">/ 5</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-white/80 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm font-medium">Last 7 days</span>
                                        </div>
                                        <div className="w-px h-4 bg-white/20" />
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            <span className="text-sm font-medium">{moodStats?.total_entries || 0} entries</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-7xl mb-4 animate-float-slow">😊</div>
                                    <p className="text-xl text-white/90 font-light leading-relaxed">
                                        "To understand yourself is the beginning of wisdom."
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-5 py-3 bg-white/20 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors">
                                        <Plus className="w-5 h-5" />
                                        <span className="font-medium">Log your first entry</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Wellness Card */}
                <motion.div
                    variants={item}
                    className="md:col-span-2 bento-card gradient-mint p-8 text-gray-800 relative overflow-hidden group cursor-pointer"
                    onClick={() => navigate('/wellness')}
                >
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/40 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
                                    <Sparkles className="w-6 h-6 text-teal-600" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold">Wellness</h3>
                            </div>
                            {(exerciseStats?.sessions_completed || 0) > 0 && <TrendingUp className="w-6 h-6 text-teal-700" />}
                        </div>

                        {(exerciseStats?.sessions_completed || 0) > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/50 dark:bg-white/10 p-4 rounded-2xl">
                                    <p className="text-3xl font-bold text-teal-800">{exerciseStats?.sessions_completed || 0}</p>
                                    <p className="text-teal-600/80 text-sm font-medium">Sessions</p>
                                </div>
                                <div className="bg-white/50 dark:bg-white/10 p-4 rounded-2xl">
                                    <p className="text-3xl font-bold text-teal-800">{exerciseStats?.total_minutes || 0}</p>
                                    <p className="text-teal-600/80 text-sm font-medium">Minutes</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-lg text-gray-700 font-medium">Find your inner peace.</p>
                                <div className="flex items-center gap-2 text-gray-600 text-sm bg-white/40 p-3 rounded-xl w-fit">
                                    <Sparkles className="w-4 h-4" />
                                    <span>6 guided exercises available</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Chat Card */}
                <motion.div
                    variants={item}
                    className="bento-card bg-[#f0f4ff] dark:bg-blue-950/30 p-8 text-gray-800 dark:text-gray-100 relative overflow-hidden group cursor-pointer border border-blue-100 dark:border-blue-800/30"
                    onClick={() => navigate('/chat')}
                >
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200/50 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm text-blue-600">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-2">AI Chat</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">24/7 emotional support companion.</p>
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-bold group-hover:gap-3 transition-all">
                            Start chat
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </motion.div>

                {/* Quick Action Card */}
                <motion.div
                    variants={item}
                    className="bento-card gradient-peach p-8 text-white relative overflow-hidden group cursor-pointer"
                    onClick={() => navigate('/wellness/games')}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-xl" />
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-2">Games</h3>
                        <p className="text-white/80 text-sm mb-6 flex-1">Focus Flow & Sensory Calm.</p>
                        <div className="flex items-center gap-2 text-white text-sm font-bold group-hover:gap-3 transition-all">
                            Play now
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </motion.div>

                {/* Progress Card */}
                <motion.div
                    variants={item}
                    className="md:col-span-2 bento-card bg-white dark:bg-white/5 p-8 border border-gray-100 dark:border-white/10"
                >
                    <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-8">Today's Goals</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Daily wellness check', count: '0/3', color: 'bg-purple-500', width: '30%' },
                            { label: 'Mindfulness exercises', count: '0/1', color: 'bg-blue-500', width: '0%' },
                            { label: 'AI chat sessions', count: '0/1', color: 'bg-teal-500', width: '0%' }
                        ].map((goal, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{goal.label}</span>
                                    <span className="text-gray-400 dark:text-gray-500 font-mono">{goal.count}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: goal.width }}
                                        transition={{ duration: 1, delay: 0.5 + (idx * 0.2) }}
                                        className={`${goal.color} h-full rounded-full opacity-80`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Motivational Card */}
                <motion.div
                    variants={item}
                    className="md:col-span-2 bento-card bg-gray-900 p-8 text-white relative overflow-hidden"
                >
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float-slow" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float" />

                    <div className="relative z-10 flex flex-col justify-center h-full text-center">
                        <h3 className="text-3xl font-serif font-bold mb-4">
                            {hasData ? 'Keep Going!' : 'Begin Your Journey'}
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed font-light italic">
                            {hasData
                                ? "Every small step you take towards wellness is a victory. You're doing amazing!"
                                : "Your wellness journey starts here. Take the first step today and discover a healthier, happier you."
                            }
                        </p>
                        <div className="mt-6 text-sm text-gray-500 font-medium tracking-widest uppercase">
                            — Your Neeva Companion
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
