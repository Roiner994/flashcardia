import { AnimatedBottomSheet } from "@/components/ui/AnimatedBottomSheet";
import { BottomSheetHeader } from "@/components/ui/BottomSheetHeader";
import { useTheme } from "@/hooks/useThemeColor";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  // Future languages can be added here
];

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage: (languageCode: string) => void;
  currentLanguage: string;
}

export function LanguageModal({
  visible,
  onClose,
  onSelectLanguage,
  currentLanguage,
}: LanguageModalProps) {
  const colors = useTheme();

  const styles = StyleSheet.create({
    content: {
      paddingTop: 8,
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "40", // lighter border
    },
    languageInfo: {
      flexDirection: "column",
    },
    languageName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    nativeName: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "white",
    },
  });

  return (
    <AnimatedBottomSheet visible={visible} onClose={onClose} snapPoint={35}>
      {(handleClose) => (
        <>
          <BottomSheetHeader title="Select Language" onClose={handleClose} />

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {LANGUAGES.map((lang) => {
              const isSelected = currentLanguage.startsWith(lang.code);
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.languageItem}
                  onPress={() => {
                    onSelectLanguage(lang.code);
                    handleClose();
                  }}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.nativeName}>{lang.nativeName}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}
    </AnimatedBottomSheet>
  );
}
