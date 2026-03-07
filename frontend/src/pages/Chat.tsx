import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getChatMessages } from '@/lib/firestore';

const Chat = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: chatHistory, isLoading: isLoading } = useQuery({
        queryKey: ['chatHistory', user?.uid],
        queryFn: async () => {
            if (!user?.uid) return [];
            return getChatMessages(user.uid);
        },
        enabled: !!user?.uid,
        retry: 1,
    });

    useEffect(() => {
        if (chatHistory) {
            setMessages(chatHistory);
        }
    }, [chatHistory]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessageMutation = useMutation({
        mutationFn: async (message: string) => {
            const response = await api.post('/chat', { message });
            return response.data;
        },
        onSuccess: (data) => {
            setMessages((prev) => [...prev, data]);
            queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
        },
        onError: (error: any) => {
            console.error('Chat error details:', error);
            const errorMessage = {
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting right now. Please make sure the backend server is running and try again.",
                isError: true,
                created_at: new Date().toISOString()
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    });

    const handleSend = () => {
        if (message.trim()) {
            const userMessage = { role: 'user', content: message, created_at: new Date().toISOString() };
            setMessages((prev) => [...prev, userMessage]);
            sendMessageMutation.mutate(message);
            setMessage('');
        }
    };

    const conversationStarters = [
        "I'm feeling anxious today",
        'Help me with breathing',
        "I can't sleep well",
        'I need motivation',
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto w-full space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 gradient-purple rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">Chat with Neeva</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Your AI wellness companion, available 24/7</p>
                    </div>
                </div>
            </motion.div>

            {/* Conversation Starters */}
            {messages.length === 0 && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 rounded-[2rem]"
                >
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">Start a conversation:</p>
                    <div className="flex flex-wrap gap-3">
                        {conversationStarters.map((starter, index) => (
                            <button
                                key={index}
                                onClick={() => setMessage(starter)}
                                className="px-6 py-3 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                {starter}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto glass rounded-[2.5rem] p-8 shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-6 py-4 rounded-3xl shadow-sm ${msg.role === 'user'
                                        ? 'gradient-purple text-white rounded-tr-none'
                                        : msg.isError
                                            ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-tl-none'
                                            : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/10 rounded-tl-none'
                                        }`}
                                >
                                    {msg.isError && <AlertCircle className="w-5 h-5 mb-2" />}
                                    <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed font-medium">
                                        {msg.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                        {sendMessageMutation.isPending && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-white dark:bg-white/10 px-6 py-4 rounded-3xl rounded-tl-none border border-gray-100 dark:border-white/10 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="glass-strong p-2 rounded-full shadow-2xl flex gap-2 items-center">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-6 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-lg"
                />
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                    {sendMessageMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Chat;
