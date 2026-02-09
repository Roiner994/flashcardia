import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface StreakCelebrationProps {
  visible: boolean;
  streak: number;
  shieldUsed?: boolean;
  onClose: () => void;
}

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  visible,
  streak,
  shieldUsed,
  onClose,
}) => {
  const { t } = useTranslation();
  const colors = useTheme();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Play animation when modal becomes visible
      setTimeout(() => {
          animationRef.current?.play();
      }, 100);
    }
  }, [visible]);

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker overlay for emphasis
    },
    container: {
      width: Platform.OS === 'web' ? 400 : '85%',
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
        width: 70, // Increased size for Lottie
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 999,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: colors.border,
    },
    streakText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginLeft: 12,
    },
    button: {
      backgroundColor: colors.primary,
      width: '100%',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    }
  }), [colors, shieldUsed]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          entering={ZoomIn.duration(500).springify()}
          style={styles.container}
        >
          <Animated.View 
            entering={FadeIn.delay(300).duration(500)}
            style={styles.iconContainer}
          >
            {shieldUsed ? (
              <Ionicons name="shield-checkmark" size={80} color={colors.info} />
            ) : (
               <LottieView
                ref={animationRef}
                source={require('@assets/animations/ray.json')}
                style={styles.lottie}
                autoPlay
                loop
              />
            )}
          </Animated.View>

          <Text style={styles.title}>
            {shieldUsed ? t('streak.savedTitle') : t('streak.extendedTitle')}
          </Text>
          
          <Text style={styles.message}>
            {shieldUsed 
              ? t('streak.savedSubtitle') 
              : t('streak.extendedSubtitle')}
          </Text>

          {!shieldUsed && (
            <View style={styles.streakBadge}>
                {/* Optional: Add small fire lottie here too? For now keep Icon for small badge */}
                <Ionicons name="flame" size={32} color={colors.streak} />
                <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('streak.continueButton')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
