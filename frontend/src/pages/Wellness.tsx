import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, X, Volume2, VolumeX, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { addExerciseCompletion } from '@/lib/firestore';

// Declare YouTube API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

const exercises = [
        {
            id: 'basic-breathing',
            title: 'Basic Breathing',
            duration: 5,
            category: 'Breathing',
            description: 'Simple breath awareness to calm your mind',
            gradient: 'from-blue-400 to-cyan-400',
            emoji: '🌬️',
            youtubeId: 'lFcSrYw-ARY'
        },
        {
            id: 'body-scan',
            title: 'Body Scan',
            duration: 10,
            category: 'Meditation',
            description: 'Progressive body awareness and relaxation',
            gradient: 'from-purple-400 to-pink-400',
            emoji: '🧘',
            youtubeId: '1ZYbU82GVz4'
        },
        {
            id: 'mindful-awareness',
            title: 'Mindful Awareness',
            duration: 8,
            category: 'Meditation',
            description: 'Present moment meditation practice',
            gradient: 'from-violet-400 to-purple-400',
            emoji: '🌟',
            youtubeId: 'M0r0PuUfT14'
        },
        {
            id: 'loving-kindness',
            title: 'Loving Kindness',
            duration: 12,
            category: 'Meditation',
            description: 'Compassion cultivation meditation',
            gradient: 'from-pink-400 to-rose-400',
            emoji: '💝',
            youtubeId: 'z6X5oEIg6Ak'
        },
        {
            id: 'mountain-meditation',
            title: 'Mountain Meditation',
            duration: 15,
            category: 'Meditation',
            description: 'Stability and strength visualization',
            gradient: 'from-emerald-400 to-teal-400',
            emoji: '⛰️',
            youtubeId: 'lTRiuFIWV54'
        },
        {
            id: 'ocean-breathing',
            title: 'Ocean Breathing',
            duration: 7,
            category: 'Breathing',
            description: 'Rhythmic breathing with ocean visualization',
            gradient: 'from-cyan-400 to-blue-400',
            emoji: '🌊',
            youtubeId: 'UfcAVejslrU'
        },
    ];

const Wellness = () => {
    const { user } = useAuth();
    const [activeExercise, setActiveExercise] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const activeExerciseData = exercises.find(ex => ex.id === activeExercise);

    const handlePlayPause = () => {
        if (youtubePlayer) {
            if (isPlaying) {
                youtubePlayer.pauseVideo();
            } else {
                youtubePlayer.playVideo();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (youtubePlayer) {
            if (isMuted) {
                youtubePlayer.unMute();
            } else {
                youtubePlayer.mute();
            }
            setIsMuted(!isMuted);
        }
    };

    const handleClose = () => {
        if (youtubePlayer && typeof youtubePlayer.stopVideo === 'function') {
            try {
                youtubePlayer.stopVideo();
            } catch (e) {
                console.error("Error stopping video:", e);
            }
        }
        setActiveExercise(null);
        setIsPlaying(false);
        setTimeRemaining(0);
        setYoutubePlayer(null);
    };

    const completeExerciseMutation = useMutation({
        mutationFn: async (data: { exercise_id: string; duration_completed: number }) => {
            return addExerciseCompletion(user!.uid, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exerciseStats'] });
            handleClose();
        },
        onError: (error) => {
            console.error("Mutation failed:", error);
            handleClose();
        }
    });

    const handleComplete = () => {
        if (activeExerciseData) {
            completeExerciseMutation.mutate({
                exercise_id: activeExerciseData.id,
                duration_completed: activeExerciseData.duration * 60,
            });
        }
    };

    // Load YouTube IFrame API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
    }, []);

    // Initialize YouTube player when exercise is selected
    useEffect(() => {
        if (activeExercise && activeExerciseData && playerRef.current && window.YT) {
            new window.YT.Player(playerRef.current, {
                height: '0',
                width: '0',
                videoId: activeExerciseData.youtubeId,
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    loop: 1,
                    playlist: activeExerciseData.youtubeId
                },
                events: {
                    onReady: (event: any) => {
                        setYoutubePlayer(event.target);
                        if (isMuted) {
                            event.target.mute();
                        }
                    }
                }
            });
        }

        return () => {
            if (youtubePlayer) {
                youtubePlayer.destroy();
                setYoutubePlayer(null);
            }
        };
    }, [activeExercise, activeExerciseData]);

    useEffect(() => {
        if (activeExercise && activeExerciseData) {
            setTimeRemaining(activeExerciseData.duration * 60);
        }
    }, [activeExercise, activeExerciseData]);

    useEffect(() => {
        let interval: any;
        if (isPlaying && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-5xl md:text-6xl font-serif font-bold mb-3 text-gray-900 dark:text-gray-100">
                    Wellness Exercises
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-light">Guided meditations and breathing exercises with calming music</p>
            </motion.div>

            {/* Exercise Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {exercises.map((exercise) => {
                    return (
                        <motion.div
                            key={exercise.id}
                            variants={item}
                            className="glass rounded-[2rem] p-8 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 bg-gradient-to-br ${exercise.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                                    {exercise.emoji}
                                </div>
                                <span className="px-4 py-1.5 bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full uppercase tracking-wide">
                                    {exercise.duration} min
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{exercise.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{exercise.description}</p>

                            <button
                                onClick={() => {
                                    setActiveExercise(exercise.id);
                                    setIsPlaying(false);
                                }}
                                className={`w-full bg-gradient-to-r ${exercise.gradient} text-white py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:scale-105`}
                            >
                                Start Session
                            </button>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Meditation Modal */}
            <AnimatePresence>
                {activeExercise && activeExerciseData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-strong rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${activeExerciseData.gradient} opacity-10 -z-10`} />

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 flex items-center justify-center transition-all"
                            >
                                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </button>

                            {/* Exercise Info */}
                            <div className="text-center mb-8">
                                <div className={`w-20 h-20 bg-gradient-to-br ${activeExerciseData.gradient} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl`}>
                                    {activeExerciseData.emoji}
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">{activeExerciseData.title}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{activeExerciseData.description}</p>
                            </div>

                            {/* Timer Display */}
                            <div className="mb-8">
                                <div className="glass-subtle rounded-3xl p-8 text-center">
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <Clock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time Remaining</span>
                                    </div>
                                    <div className="text-6xl font-serif font-bold text-gray-900 dark:text-gray-100">
                                        {formatTime(timeRemaining)}
                                    </div>
                                    <div className="mt-4 w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${activeExerciseData.gradient} transition-all duration-1000`}
                                            style={{ width: `${((activeExerciseData.duration * 60 - timeRemaining) / (activeExerciseData.duration * 60)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePlayPause}
                                    disabled={!youtubePlayer}
                                    className={`flex-1 flex items-center justify-center gap-3 bg-gradient-to-r ${activeExerciseData.gradient} text-white py-4 rounded-full font-bold hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                                <button
                                    onClick={toggleMute}
                                    disabled={!youtubePlayer}
                                    className="w-14 h-14 glass-subtle rounded-full flex items-center justify-center hover:bg-white/80 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Volume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                                </button>

                            </div>

                            {/* Hidden YouTube Player */}
                            <div ref={playerRef} style={{ display: 'none' }} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Wellness;
