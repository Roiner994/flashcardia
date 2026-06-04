import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { Platform } from "react-native";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";

const resources = {
    en: { translation: en },
    es: { translation: es },
};

const LANGUAGE_KEY = "user-language";

// Initialize i18next synchronously with device locale
const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
const initialLanguage = deviceLanguage === 'es' ? 'es' : 'en';

i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    debug: false,
    interpolation: {
        escapeValue: false,
    },
    compatibilityJSON: 'v4'
});

// Load saved user preference asynchronously
const loadUserLanguage = async () => {
    // Skip on web during SSR/static generation where window is not defined
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        return;
    }
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
            await i18n.changeLanguage(savedLanguage);
        }
    } catch (error) {
        // Ignore errors during SSR/static generation where window might be missing
        // or AsyncStorage unavailable
        console.debug('Failed to load user language preference', error);
    }
};

loadUserLanguage();

export default i18n;

export const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
};
