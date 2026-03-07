import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserOnboarding } from '@/lib/firestore';

interface OnboardingData {
    dailyLife: string;
    stressLevel: number;
    goals: string[];
    communicationStyle: string;
    sleepQuality: string;
}

const OnboardingModal = () => {
    const { user, refreshUserProfile } = useAuth();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        dailyLife: '',
        stressLevel: 5,
        goals: [],
        communicationStyle: '',
        sleepQuality: '',
    });
    const [isOpen, setIsOpen] = useState(true);

    const updateOnboardingMutation = useMutation({
        mutationFn: async (data: OnboardingData) => {
            await updateUserOnboarding(user!.uid, data);
        },
        onSuccess: async () => {
            await refreshUserProfile();
            setIsOpen(false);
        },
    });

    if (user?.onboarding_completed || !isOpen) return null;

    const questions = [
        {
            title: "How's your daily life?",
            description: "Briefly describe your typical day and what occupies your time.",
            type: "text",
            field: "dailyLife",
            placeholder: "I work as a..."
        },
        {
            title: "Average Stress Level",
            description: "On a scale of 1-10, how stressed do you feel usually?",
            type: "slider",
            field: "stressLevel",
            min: 1,
            max: 10
        },
        {
            title: "What are your goals?",
            description: "Select all that apply.",
            type: "multi-select",
            field: "goals",
            options: ["Reduce Anxiety", "Better Sleep", "Improve Focus", "Manage Stress", "Build Confidence"]
        },
        {
            title: "Communication Style",
            description: "How would you like your AI companion to talk to you?",
            type: "select",
            field: "communicationStyle",
            options: ["Empathetic & Gentle", "Direct & Practical", "Casual & Friendly", "Professional & Clinical"]
        },
        {
            title: "Sleep Quality",
            description: "How well do you usually sleep?",
            type: "select",
            field: "sleepQuality",
            options: ["Great", "Good", "Okay", "Poor", "Terrible"]
        }
    ];

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            updateOnboardingMutation.mutate(data);
        }
    };

    const currentQuestion = questions[step];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex gap-1">
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-purple-600' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {step + 1}/{questions.length}
                        </span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="min-h-[300px]"
                        >
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{currentQuestion.title}</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">{currentQuestion.description}</p>

                            {currentQuestion.type === 'text' && (
                                <textarea
                                    value={data.dailyLife}
                                    onChange={(e) => setData({ ...data, dailyLife: e.target.value })}
                                    className="w-full h-32 p-4 bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-lg text-gray-900 dark:text-gray-100"
                                    placeholder={currentQuestion.placeholder}
                                />
                            )}

                            {currentQuestion.type === 'slider' && (
                                <div className="py-8">
                                    <input
                                        type="range"
                                        min={currentQuestion.min}
                                        max={currentQuestion.max}
                                        value={data.stressLevel}
                                        onChange={(e) => setData({ ...data, stressLevel: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                    <div className="mt-4 text-center text-4xl font-bold text-purple-600">
                                        {data.stressLevel}
                                    </div>
                                </div>
                            )}

                            {currentQuestion.type === 'multi-select' && (
                                <div className="grid grid-cols-1 gap-3">
                                    {currentQuestion.options?.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                const newGoals = data.goals.includes(option)
                                                    ? data.goals.filter(g => g !== option)
                                                    : [...data.goals, option];
                                                setData({ ...data, goals: newGoals });
                                            }}
                                            className={`p-4 text-left rounded-xl border transition-all duration-200 flex justify-between items-center ${data.goals.includes(option)
                                                ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 dark:border-purple-400 text-purple-700 dark:text-purple-300'
                                                : 'bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="font-medium">{option}</span>
                                            {data.goals.includes(option) && <Check size={20} />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'select' && (
                                <div className="grid grid-cols-1 gap-3">
                                    {currentQuestion.options?.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setData({ ...data, [currentQuestion.field]: option })}
                                            className={`p-4 text-left rounded-xl border transition-all duration-200 flex justify-between items-center ${data[currentQuestion.field as keyof OnboardingData] === option
                                                ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 dark:border-purple-400 text-purple-700 dark:text-purple-300'
                                                : 'bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="font-medium">{option}</span>
                                            {data[currentQuestion.field as keyof OnboardingData] === option && <Check size={20} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-medium hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-purple-500/20"
                        >
                            {step === questions.length - 1 ? 'Finish' : 'Next'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingModal;
