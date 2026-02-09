import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StreakHeaderProps {
  streak: number;
  shields: number;
}

export const StreakHeader: React.FC<StreakHeaderProps> = ({ streak, shields }) => {
  const colors = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.streak + '15', borderColor: colors.streak + '30' }]}>
      <View style={styles.streakSection}>
        <Ionicons name="flame" size={18} color={colors.streak} />
        <Text style={[styles.streakText, { color: colors.streak }]}>{streak}</Text>
      </View>
      
      {shields > 0 && (
        <View style={[styles.shieldSection, { borderLeftColor: colors.warning + '40' }]}>
          <Ionicons name="shield-checkmark" size={16} color={colors.info} />
          <Text style={[styles.shieldText, { color: colors.info }]}>{shields}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: 6,
    fontWeight: '800',
    fontSize: 16,
  },
  shieldSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
  },
  shieldText: {
    marginLeft: 4,
    fontWeight: '700',
    fontSize: 13,
  },
});
