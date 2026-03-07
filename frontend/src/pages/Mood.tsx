import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Frown, Meh, Smile, SmilePlus, Laugh, TrendingUp, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { addMoodLog, getMoodLogs, firestoreTimestampToDate } from '@/lib/firestore';
import { computeMoodStats } from '@/lib/stats';

const Mood = () => {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const { data: moodLogs } = useQuery({
        queryKey: ['moodLogs', user?.uid],
        queryFn: () => getMoodLogs(user!.uid, 10),
        enabled: !!user?.uid,
    });

    const { data: allLogs } = useQuery({
        queryKey: ['allMoodLogs', user?.uid],
        queryFn: () => getMoodLogs(user!.uid),
        enabled: !!user?.uid,
    });

    const moodStats = allLogs ? computeMoodStats(allLogs as any) : null;

    const logMoodMutation = useMutation({
        mutationFn: async (data: { mood_level: number; notes: string }) => {
            return addMoodLog(user!.uid, data);
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['moodLogs'] }),
                queryClient.invalidateQueries({ queryKey: ['allMoodLogs'] }),
                queryClient.invalidateQueries({ queryKey: ['moodStats'] }),
            ]);
            setSelectedMood(null);
            setNotes('');
        },
    });

    const moods = [
        { level: 1, icon: Frown, label: 'Very Sad', emoji: '😢', gradient: 'from-red-400 to-orange-400', shadow: 'shadow-red-200' },
        { level: 2, icon: Meh, label: 'Sad', emoji: '😕', gradient: 'from-orange-400 to-amber-400', shadow: 'shadow-orange-200' },
        { level: 3, icon: Smile, label: 'Neutral', emoji: '😐', gradient: 'from-amber-400 to-yellow-400', shadow: 'shadow-yellow-200' },
        { level: 4, icon: SmilePlus, label: 'Good', emoji: '😊', gradient: 'from-lime-400 to-green-400', shadow: 'shadow-lime-200' },
        { level: 5, icon: Laugh, label: 'Excellent', emoji: '😄', gradient: 'from-emerald-400 to-teal-400', shadow: 'shadow-emerald-200' },
    ];

    const handleLogMood = () => {
        if (selectedMood) {
            logMoodMutation.mutate({ mood_level: selectedMood, notes });
        }
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center md:text-left"
            >
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
                    Mood Tracker
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-light">
                    Reflect on your day and track your emotional journey.
                </p>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Log Mood */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-8"
                >
                    <div className="glass-strong rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl -z-10" />

                        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-500" />
                            How are you feeling right now?
                        </h2>

                        <div className="grid grid-cols-5 gap-4 mb-8">
                            {moods.map((mood) => {
                                const isSelected = selectedMood === mood.level;
                                return (
                                    <button
                                        key={mood.level}
                                        onClick={() => setSelectedMood(mood.level)}
                                        className={`group relative flex flex-col items-center gap-4 p-4 rounded-3xl transition-all duration-300 ${isSelected
                                            ? `bg-gradient-to-br ${mood.gradient} text-white shadow-xl ${mood.shadow} scale-110`
                                            : 'bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 hover:shadow-lg hover:-translate-y-1'
                                            }`}
                                    >
                                        <span className="text-4xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">{mood.emoji}</span>
                                        <span className={`text-xs font-bold tracking-wide uppercase ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {mood.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add a note about your feelings... (optional)"
                                className="w-full px-6 py-5 bg-white/60 dark:bg-white/10 border-none rounded-3xl focus:ring-2 focus:ring-purple-200 focus:bg-white dark:focus:bg-white/15 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none text-lg"
                                rows={3}
                                maxLength={500}
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-500 font-medium">
                                {notes.length}/500
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleLogMood}
                                disabled={!selectedMood || logMoodMutation.isPending}
                                className="group relative overflow-hidden bg-gray-900 text-white px-10 py-4 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {logMoodMutation.isPending ? 'Saving...' : 'Log Entry'}
                                    {!logMoodMutation.isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        </div>
                    </div>

                    {/* Recent Entries List */}
                    <div className="glass rounded-[2.5rem] p-8 md:p-10">
                        <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-6">Recent Reflections</h2>
                        <div className="space-y-4">
                            {moodLogs?.map((log: any) => {
                                const mood = moods.find((m) => m.level === log.mood_level);
                                const date = firestoreTimestampToDate(log.created_at);
                                return (
                                    <div key={log.id} className="group flex items-start gap-5 p-5 bg-white/40 dark:bg-white/5 rounded-3xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-md border border-transparent hover:border-purple-100 dark:hover:border-purple-500/20">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${mood?.gradient} text-white shadow-md`}>
                                            {mood?.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-gray-900 dark:text-gray-100">{mood?.label}</span>
                                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-white/10 px-3 py-1 rounded-full">
                                                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            {log.notes && <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{log.notes}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                            {(!moodLogs || moodLogs.length === 0) && (
                                <div className="text-center py-12 opacity-50">
                                    <p className="text-gray-500 dark:text-gray-400 font-serif italic">No entries yet. Start your journey above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Stats */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Main Stat Card */}
                    <div className="bento-card gradient-purple text-white p-8">
                        <div className="flex items-center gap-3 mb-6 opacity-90">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm font-bold tracking-wider uppercase">Weekly Average</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-7xl font-serif font-bold">{moodStats?.average_mood || 0}</span>
                            <span className="text-2xl opacity-60">/5</span>
                        </div>
                        <p className="text-sm opacity-80 leading-relaxed">
                            Based on your last 7 days of entries. Keep tracking to see your trends!
                        </p>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="glass p-6 rounded-[2rem] flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Total Entries</p>
                                <p className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">{moodStats?.total_entries || 0}</p>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-[2rem] flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600">
                                <span className="text-2xl">🔥</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Current Streak</p>
                                <p className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">{moodStats?.streak || 0} <span className="text-sm font-sans font-normal text-gray-400 dark:text-gray-500">days</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Quote Card */}
                    <div className="bento-card bg-gray-900 text-white p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl" />
                        <Sparkles className="w-6 h-6 text-purple-400 mb-4" />
                        <p className="text-lg font-serif italic leading-relaxed opacity-90">
                            "Happiness is not something ready made. It comes from your own actions."
                        </p>
                        <p className="mt-4 text-sm font-medium text-purple-400">— Dalai Lama</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Mood;
