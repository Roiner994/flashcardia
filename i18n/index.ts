import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";

const resources = {
    en: { translation: en },
    es: { translation: es },
};

const LANGUAGE_KEY = "user-language";

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (!savedLanguage) {
        const deviceLanguage = getLocales()[0]?.languageCode;
        savedLanguage = deviceLanguage === "es" ? "es" : "en";
    }

    i18n.use(initReactI18next).init({
        resources,
        lng: savedLanguage,
        fallbackLng: "en",
        debug: true, // Enable debug
        interpolation: {
            escapeValue: false,
        },
        compatibilityJSON: 'v4'
    });
};

initI18n();

export default i18n;

export const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
};
