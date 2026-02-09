import { Input } from "@components/ui/Input";
import { useTheme } from "@hooks/useThemeColor";
import { ChallengeResult } from "@services/ChallengeService";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface ChallengeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  isRecording: boolean;
  isPaused: boolean;
  isSubmitting: boolean;
  result: ChallengeResult | null;
}

export const ChallengeInput = React.memo(
  ({
    value,
    onChangeText,
    isRecording,
    isPaused,
    isSubmitting,
    result,
  }: ChallengeInputProps) => {
    const { t } = useTranslation();
    const colors = useTheme();

    return (
      <View style={{ marginBottom: 24 }}>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={t("challenge.active.inputPlaceholder")}
          multiline
          editable={(!isRecording || isPaused) && !isSubmitting && !result}
          style={{ minHeight: 120, fontSize: 18 }}
        />
      </View>
    );
  }
);
