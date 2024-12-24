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
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await axiosInstance.get('/me'); // Check if the user is logged in
                setUser(data.user);
                console.log(data);
            } catch (err) {
                setUser(null);
            }
        };
        checkUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
