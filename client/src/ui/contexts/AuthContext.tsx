import { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface AuthContextProps {
    user: any;
    setUser: (user: any) => void;
}

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true); // Track loading state

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await axiosInstance.get('/me'); // Check if the user is logged in
                setUser(data.user);
            } catch (err) {
                console.log('Error getting user from /me', err);
                setUser(null); // Ensure no user is set when error occurs
            } finally {
                setLoading(false); // Stop loading after the attempt
            }
        };
        checkUser();
    }, []); // Only runs once after mount

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {!loading && children} {/* Wait for loading to finish */}
        </AuthContext.Provider>
    );
};
