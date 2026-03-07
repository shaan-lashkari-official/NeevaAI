import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, MessageCircle, Heart, Send, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
    getCommunityGroups,
    subscribeToPosts,
    createCommunityPost,
    toggleLike,
    hasUserLikedPost,
    firestoreTimestampToDate,
} from '@/lib/firestore';

interface Post {
    id: string;
    content: string;
    is_anonymous: boolean;
    group_id: string;
    user_id: string;
    user_name: string;
    likes_count: number;
    created_at: any;
    user_liked?: boolean;
}

const GROUP_EMOJIS: Record<string, string> = {
    'Anxiety Support': '🫂',
    'Mindfulness': '🧘',
    'Sleep Better': '🌙',
    'Daily Wins': '🏆',
    'Stress at Work': '💼',
    'Casual Talks': '☕',
};

const GROUP_GRADIENTS: Record<string, string> = {
    'Anxiety Support': 'from-purple-400 to-pink-400',
    'Mindfulness': 'from-violet-400 to-purple-400',
    'Sleep Better': 'from-blue-400 to-indigo-400',
    'Daily Wins': 'from-amber-400 to-orange-400',
    'Stress at Work': 'from-teal-400 to-cyan-400',
    'Casual Talks': 'from-rose-400 to-pink-400',
};

const Community = () => {
    const { user } = useAuth();
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [newPost, setNewPost] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();

    const { data: groups, isLoading: groupsLoading } = useQuery({
        queryKey: ['communityGroups'],
        queryFn: getCommunityGroups,
    });

    // Real-time subscription to posts via Firestore onSnapshot
    useEffect(() => {
        if (!selectedGroup || !user?.uid) {
            setPosts([]);
            return;
        }

        const unsubscribe = subscribeToPosts(selectedGroup, async (newPosts) => {
            // Check which posts the user has liked
            const likeChecks = await Promise.all(
                newPosts.map(async (p: any) => {
                    const liked = await hasUserLikedPost(p.id, user.uid);
                    return { id: p.id, liked };
                })
            );
            const likedSet = new Set(likeChecks.filter(c => c.liked).map(c => c.id));
            setLikedPosts(likedSet);
            setPosts(newPosts.map((p: any) => ({ ...p, user_liked: likedSet.has(p.id) })));
        });

        return () => unsubscribe();
    }, [selectedGroup, user?.uid]);

    const createPostMutation = useMutation({
        mutationFn: async (data: { content: string; is_anonymous: boolean; group_id: string }) => {
            return createCommunityPost({
                ...data,
                user_id: user!.uid,
                user_name: user!.name,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
            setNewPost('');
        },
    });

    const likePostMutation = useMutation({
        mutationFn: async (postId: string) => {
            return toggleLike(postId, user!.uid);
        },
        onMutate: async (postId: string) => {
            // Optimistic update
            const wasLiked = likedPosts.has(postId);
            const newLikedPosts = new Set(likedPosts);
            if (wasLiked) {
                newLikedPosts.delete(postId);
            } else {
                newLikedPosts.add(postId);
            }
            setLikedPosts(newLikedPosts);
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? {
                        ...p,
                        user_liked: !wasLiked,
                        likes_count: wasLiked ? p.likes_count - 1 : p.likes_count + 1,
                    }
                    : p
            ));
        },
    });

    const handleSubmitPost = () => {
        if (!newPost.trim() || !selectedGroup) return;
        createPostMutation.mutate({
            content: newPost.trim(),
            is_anonymous: isAnonymous,
            group_id: selectedGroup,
        });
    };

    const selectedGroupData = groups?.find((g: any) => g.id === selectedGroup) as any;

    const formatTime = (ts: any) => {
        const date = firestoreTimestampToDate(ts);
        const now = new Date();
        const istDate = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const istToday = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const yesterday = new Date(now.getTime() - 86400000);
        const istYesterday = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const isToday = istDate === istToday;
        const isYesterday = istDate === istYesterday;

        const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
        const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' };
        const time = date.toLocaleTimeString('en-IN', timeOpts);

        if (isToday) return time;
        if (isYesterday) return `Yesterday, ${time}`;
        return `${date.toLocaleDateString('en-IN', dateOpts)}, ${time}`;
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                            Community
                        </h1>
                        <p className="text-xl text-gray-500 dark:text-gray-400 font-light">
                            You're not alone. Share, support, and grow together.
                        </p>
                    </div>
                    {selectedGroup && (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-gray-400 dark:text-gray-500">Live</span>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Groups */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                >
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Support Groups
                    </h2>

                    {groupsLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass rounded-2xl p-5 animate-pulse h-24" />
                            ))}
                        </div>
                    ) : (
                        groups?.map((group: any) => {
                            const isActive = selectedGroup === group.id;
                            const emoji = GROUP_EMOJIS[group.name] || '💬';
                            const gradient = GROUP_GRADIENTS[group.name] || 'from-gray-400 to-gray-500';

                            return (
                                <motion.button
                                    key={group.id}
                                    variants={item}
                                    onClick={() => setSelectedGroup(isActive ? null : group.id)}
                                    className={`w-full text-left rounded-2xl p-5 transition-all duration-300 border ${
                                        isActive
                                            ? 'glass-strong shadow-lg border-purple-200 dark:border-purple-500/30 scale-[1.02]'
                                            : 'glass hover:shadow-md border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-md`}>
                                            {emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{group.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{group.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>{group.post_count || 0} posts</span>
                                    </div>
                                </motion.button>
                            );
                        })
                    )}
                </motion.div>

                {/* Right: Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Compose Box — show when group is selected */}
                    <AnimatePresence>
                        {selectedGroup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="glass-strong rounded-[2rem] p-6 shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles className="w-5 h-5 text-purple-500" />
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                            Share in {selectedGroupData?.name}
                                        </h3>
                                    </div>
                                    <textarea
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        placeholder="What's on your mind? Share your thoughts, ask for support, or celebrate a win..."
                                        className="w-full px-5 py-4 bg-white/50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none text-base"
                                        rows={3}
                                        maxLength={1000}
                                    />
                                    <div className="flex items-center justify-between mt-4">
                                        <button
                                            onClick={() => setIsAnonymous(!isAnonymous)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                                isAnonymous
                                                    ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            {isAnonymous ? 'Posting anonymously' : 'Post with name'}
                                        </button>
                                        <button
                                            onClick={handleSubmitPost}
                                            disabled={!newPost.trim() || createPostMutation.isPending}
                                            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                                        >
                                            <Send className="w-4 h-4" />
                                            {createPostMutation.isPending ? 'Posting...' : 'Post'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Posts Feed */}
                    <div className="space-y-4">
                        {!selectedGroup && (
                            <div className="glass rounded-[2rem] p-10 text-center">
                                <div className="text-5xl mb-4">👈</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Select a group</h3>
                                <p className="text-gray-500 dark:text-gray-400">Choose a support group to view posts and share your thoughts.</p>
                            </div>
                        )}

                        {selectedGroup && posts.length === 0 && (
                            <div className="glass rounded-[2rem] p-10 text-center">
                                <div className="text-5xl mb-4">🌱</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Be the first to post</h3>
                                <p className="text-gray-500 dark:text-gray-400">This group is waiting for someone to start the conversation. That could be you!</p>
                            </div>
                        )}

                        <AnimatePresence>
                            {posts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="glass rounded-2xl p-6 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-serif italic text-sm shadow-md shrink-0 ${
                                            post.is_anonymous ? 'bg-gray-400' : 'gradient-peach'
                                        }`}>
                                            {post.is_anonymous ? '?' : post.user_name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Header */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                    {post.user_name}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {post.created_at ? formatTime(post.created_at) : ''}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {post.content}
                                            </p>

                                            {/* Actions */}
                                            <div className="flex items-center gap-4 mt-4">
                                                <button
                                                    onClick={() => likePostMutation.mutate(post.id)}
                                                    className={`flex items-center gap-1.5 text-sm transition-colors group ${
                                                        post.user_liked
                                                            ? 'text-pink-500'
                                                            : 'text-gray-400 dark:text-gray-500 hover:text-pink-500'
                                                    }`}
                                                >
                                                    <Heart
                                                        className={`w-4 h-4 group-hover:scale-125 transition-transform ${
                                                            post.user_liked ? 'fill-pink-500' : ''
                                                        }`}
                                                    />
                                                    <span>{post.likes_count}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Community;
