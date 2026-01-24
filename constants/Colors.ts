/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#8b5cf6'; // Violet 500
const tintColorDark = '#a78bfa'; // Violet 400

export const Colors = {
    light: {
        text: '#111827',
        textSecondary: '#6b7280',
        background: '#f5f3ff', // Violet 50
        // background: '#f9fafb', // Gray 50
        surface: '#ffffff',
        primary: tintColorLight,
        border: '#e5e7eb',
        error: '#ef4444',
        success: '#10b981',
        info: '#3b82f6',
        warning: '#f59e0b',
        icon: '#6b7280',
        tabIconDefault: '#9ca3af',
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        background: '#0f172a',
        surface: '#1e293b',
        primary: tintColorDark,
        border: '#334155',
        error: '#f87171',
        success: '#34d399',
        info: '#60a5fa',
        warning: '#fbbf24',
        icon: '#9ca3af',
        tabIconDefault: '#9ca3af',
        tabIconSelected: tintColorDark,
    },
};
