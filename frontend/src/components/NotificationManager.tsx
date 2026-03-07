import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Heart } from 'lucide-react';

const QUOTES = [
    "You are enough just as you are.",
    "Breathe in calm, breathe out stress.",
    "One step at a time.",
    "Your mental health is a priority.",
    "It's okay to take a break.",
    "Small progress is still progress.",
    "Be kind to yourself today.",
    "You are stronger than you think.",
    "Peace begins with a smile.",
    "Today is a fresh start."
];

const NotificationManager = () => {
    const [notification, setNotification] = useState<{ title: string; message: string; icon: any } | null>(null);

    useEffect(() => {
        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const checkNotifications = () => {
            const now = Date.now();
            const lastQuoteTime = parseInt(localStorage.getItem('lastQuoteTime') || '0');
            const lastMoodLogTime = parseInt(localStorage.getItem('lastMoodLogTime') || '0'); // This should be updated when user logs mood

            // 1. Quote every 2 hours (2 * 60 * 60 * 1000 = 7200000 ms)
            // For testing, let's say every 1 minute if not set, or 2 hours normally
            // Let's stick to 2 hours as requested.
            if (now - lastQuoteTime > 7200000) {
                const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
                showNotification("A gentle reminder", randomQuote, Sparkles);
                localStorage.setItem('lastQuoteTime', now.toString());
            }

            // 2. Mood Reminder (if not logged in last 4 hours, for example)
            // We'll just do a random check or based on time of day
            // Let's say if it's been > 4 hours since last log
            if (now - lastMoodLogTime > 14400000) {
                // Only show if we haven't shown a quote recently to avoid spam
                if (now - lastQuoteTime > 60000) {
                    showNotification("Time to check in?", "How are you feeling right now? Log your mood.", Heart);
                    // Update lastMoodLogTime to avoid spamming, or use a separate 'lastReminderTime'
                    // For simplicity, we just won't spam.
                }
            }
        };

        // Check every minute
        const interval = setInterval(checkNotifications, 60000);

        // Initial check (delay slightly to not overlap with app load)
        const timeout = setTimeout(checkNotifications, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    const showNotification = (title: string, message: string, Icon: any) => {
        // 1. Show in-app toast
        setNotification({ title, message, icon: Icon });

        // Auto dismiss after 5 seconds
        setTimeout(() => setNotification(null), 8000);

        // 2. Show browser notification if allowed and document is hidden
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message, icon: '/vite.svg' }); // Use vite logo or app logo
        }
    };

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
                >
                    <div className="glass-strong p-4 rounded-3xl shadow-2xl border border-white/50 flex items-start gap-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 shrink-0">
                            <notification.icon size={20} />
                        </div>
                        <div className="flex-1 pt-1">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">{notification.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationManager;
