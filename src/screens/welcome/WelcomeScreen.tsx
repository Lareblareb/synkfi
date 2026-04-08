import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { TouchableOpacity } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MARQUEE_TEXT =
  'PLAY TO CONNECT  ·  WHERE STUDENTS MEET  ·  NOT NETWORKING — REAL CONNECTION  ·  CONNECTION  ·  MOVEMENT  ·  COMMUNITY  ·  ';

export const WelcomeScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t } = useTranslation('auth');
  const marqueeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      marqueeAnim.setValue(0);
      Animated.loop(
        Animated.timing(marqueeAnim, {
          toValue: -SCREEN_WIDTH * 2,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    };
    animate();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>SYNK</Text>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuLine} />
          <View style={[styles.menuLine, styles.menuLineShort]} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('welcome.badge')}</Text>
        </View>

        {/* Hero Text */}
        <View style={styles.heroText}>
          <Text style={styles.heroLine1}>{t('welcome.heroLine1')}</Text>
          <Text style={styles.heroLine2}>{t('welcome.heroLine2')}</Text>
        </View>

        {/* CTA Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {t('welcome.exploreEvents')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            {t('welcome.learnMore')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stat Pills */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{t('welcome.stat100')}</Text>
          <Text style={styles.statLabel}>{t('welcome.statStudentRun')}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{t('welcome.stat0')}</Text>
          <Text style={styles.statLabel}>{t('welcome.statExperience')}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{t('welcome.statInfinity')}</Text>
          <Text style={styles.statLabel}>{t('welcome.statConnections')}</Text>
        </View>
      </View>

      {/* Marquee */}
      <View style={styles.marqueeContainer}>
        <Animated.View
          style={[
            styles.marqueeContent,
            { transform: [{ translateX: marqueeAnim }] },
          ]}
        >
          <Text style={styles.marqueeText}>
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.base,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 2,
  },
  menuButton: {
    width: 32,
    height: 24,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.text.primary,
    borderRadius: 1,
  },
  menuLineShort: {
    width: 24,
    alignSelf: 'flex-end',
  },
  heroSection: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(197, 241, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(197, 241, 53, 0.3)',
    borderRadius: 9999,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  badgeText: {
    color: colors.accent.lime,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  heroText: {
    marginBottom: spacing['2xl'],
  },
  heroLine1: {
    ...typography.display,
    color: colors.text.primary,
    fontSize: 52,
    lineHeight: 56,
  },
  heroLine2: {
    ...typography.display,
    color: colors.accent.lime,
    fontSize: 52,
    lineHeight: 56,
  },
  primaryButton: {
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['2xl'],
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.bg.primary,
  },
  secondaryButton: {
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['2xl'],
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
  },
  statValue: {
    color: colors.accent.lime,
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '400',
  },
  marqueeContainer: {
    height: 40,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  marqueeContent: {
    flexDirection: 'row',
  },
  marqueeText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
