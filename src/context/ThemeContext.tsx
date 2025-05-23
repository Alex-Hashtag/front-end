import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType
{
    theme: ThemeType;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps
{
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
    // Check for user preference or stored preference
    const getInitialTheme = (): ThemeType => {
        // Check localStorage first
        const storedTheme = localStorage.getItem('theme') as ThemeType;
        if (storedTheme === 'light' || storedTheme === 'dark')
        {
            return storedTheme;
        }

        // Check for system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        {
            return 'dark';
        }

        // Default to light
        return 'light';
    };

    const [theme, setTheme] = useState<ThemeType>(getInitialTheme);

    // Apply theme class to body
    useEffect(() => {
        // Add transition class before changing theme
        document.body.classList.add('theme-transition');

        // Set the theme class
        document.body.className = `${theme} theme-transition`;
        localStorage.setItem('theme', theme);

        // Remove transition class after animation completes to prevent transition on page load
        const transitionEndTimer = setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 1000);

        return () => clearTimeout(transitionEndTimer);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined)
    {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
