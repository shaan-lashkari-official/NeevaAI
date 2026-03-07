import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getUserDoc, createUserDoc } from '@/lib/firestore';

interface User {
    uid: string;
    email: string;
    name: string;
    onboarding_completed?: boolean;
    onboarding_data?: any;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const doc = await getUserDoc(firebaseUser.uid);
    if (doc) {
        return {
            uid: firebaseUser.uid,
            email: (doc as any).email || firebaseUser.email || '',
            name: (doc as any).name || firebaseUser.displayName || '',
            onboarding_completed: (doc as any).onboarding_completed || false,
            onboarding_data: (doc as any).onboarding_data || null,
        };
    }
    // User doc doesn't exist yet (Google sign-in first time) — create it
    const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
    await createUserDoc(firebaseUser.uid, {
        email: firebaseUser.email || '',
        name,
    });
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name,
        onboarding_completed: false,
        onboarding_data: null,
    };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const profile = await loadUserProfile(firebaseUser);
                    setUser(profile);
                } catch (err) {
                    console.error('Failed to load user profile:', err);
                    // Don't sign user out if we already have a profile
                    // (Firestore might be temporarily unavailable)
                    setUser((prev) => prev);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle setting user
    };

    const register = async (email: string, password: string, name: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await createUserDoc(cred.user.uid, { email, name });
        // onAuthStateChanged will handle setting user
    };

    const loginWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged will handle setting user + auto-creating doc
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    const refreshUserProfile = async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            const profile = await loadUserProfile(firebaseUser);
            setUser(profile);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                loginWithGoogle,
                logout,
                refreshUserProfile,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
