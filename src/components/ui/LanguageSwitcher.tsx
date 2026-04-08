import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { useSettingsStore } from '../../store/settings';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useSettingsStore();

  const handleToggle = (lang: 'en' | 'fi') => {
    if (lang !== language) {
      setLanguage(lang);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, language === 'en' && styles.active]}
        onPress={() => handleToggle('en')}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.label, language === 'en' && styles.activeLabel]}
        >
          English
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, language === 'fi' && styles.active]}
        onPress={() => handleToggle('fi')}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.label, language === 'fi' && styles.activeLabel]}
        >
          Suomi
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.pill,
    padding: spacing.xs,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.accent.lime,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeLabel: {
    color: colors.black,
  },
});
