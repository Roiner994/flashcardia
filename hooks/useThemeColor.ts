import { Colors } from '@/constants/Colors';
import { useStore } from '@/store/useStore';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
    const systemTheme = useSystemColorScheme() ?? 'light';
    const themeMode = useStore((state) => state.themeMode);

    const theme = themeMode === 'system' ? systemTheme : themeMode;
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    } else {
        return Colors[theme][colorName];
    }
}

export function useTheme() {
    const systemTheme = useSystemColorScheme() ?? 'light';
    const themeMode = useStore((state) => state.themeMode);

    const theme = themeMode === 'system' ? systemTheme : themeMode;
    return Colors[theme];
}
