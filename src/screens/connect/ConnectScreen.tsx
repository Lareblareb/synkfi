import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Animated,
  PanResponder, Dimensions, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useConnections } from '../../hooks/useConnections';
import { useAuthStore } from '../../store/auth';
import { PublicProfile } from '../../types/user.types';
import { SPORT_EMOJI, SPORT_LABELS, SPORT_LIST } from '../../types/event.types';
import { SportType } from '../../types/database.types';
import { getInitial } from '../../utils/formatters';
import { getAvatarColor } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.62;
const SWIPE_OUT_DURATION = 300;

export const ConnectScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation(['connect', 'common']);
  const user = useAuthStore((s) => s.user);
  const { members, sendConnectionRequest, isLoading, refresh } = useConnections();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterSports, setFilterSports] = useState<SportType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const isAnimating = useRef(false);

  useEffect(() => {
    setCurrentIndex(0);
    position.setValue({ x: 0, y: 0 });
  }, [members.length, filterSports.join(',')]);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const filteredMembers = members.filter((m) => {
    if (m.id === user?.id) return false;
    if (filterSports.length === 0) return true;
    return m.sports?.some((s) => filterSports.includes(s as SportType));
  });

  const currentMember = filteredMembers[currentIndex];
  const nextMember = filteredMembers[currentIndex + 1];

  const resetCard = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: false,
    }).start();
  };

  const forceSwipe = (direction: 'left' | 'right') => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const x = direction === 'right' ? SCREEN_WIDTH + 200 : -SCREEN_WIDTH - 200;

    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      onSwipeComplete(direction);
    });
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    if (direction === 'right' && user && currentMember) {
      sendConnectionRequest(user.id, currentMember.id);
    }
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
    isAnimating.current = false;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating.current,
      onMoveShouldSetPanResponder: (_, gesture) =>
        !isAnimating.current && Math.abs(gesture.dx) > 5,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetCard();
        }
      },
      onPanResponderTerminate: () => {
        resetCard();
      },
    })
  ).current;

  const toggleSportFilter = (sport: SportType) => {
    setFilterSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const clearFilters = () => {
    setFilterSports([]);
    setShowFilters(false);
  };

  if (isLoading && members.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.accent.lime} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>SYNK</Text>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={22} color={colors.text.primary} />
          {filterSports.length > 0 && (
            <View style={styles.filterDot}>
              <Text style={styles.filterDotText}>{filterSports.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Card Stack */}
      <View style={styles.cardArea}>
        {filteredMembers.length === 0 || currentIndex >= filteredMembers.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>No more profiles</Text>
            <Text style={styles.emptyHint}>
              {filterSports.length > 0
                ? 'Try adjusting your sport filters'
                : 'Check back later for new members'}
            </Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={refresh}>
              <Ionicons name="refresh" size={18} color={colors.bg.primary} />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Next card (behind) */}
            {nextMember && (
              <View style={[styles.card, styles.nextCard]}>
                <MemberCardContent member={nextMember} />
              </View>
            )}

            {/* Current card (swipeable) */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                  ],
                },
              ]}
            >
              <MemberCardContent member={currentMember} />

              <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}>
                <Text style={styles.likeText}>CONNECT</Text>
              </Animated.View>

              <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}>
                <Text style={styles.nopeText}>SKIP</Text>
              </Animated.View>
            </Animated.View>
          </>
        )}
      </View>

      {/* Action Buttons */}
      {filteredMembers.length > 0 && currentIndex < filteredMembers.length && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.skipBtn]}
            onPress={() => forceSwipe('left')}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={32} color={colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.infoBtn]}
            onPress={() =>
              currentMember &&
              navigation.navigate('PublicProfile', { userId: currentMember.id })
            }
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.connectBtn]}
            onPress={() => forceSwipe('right')}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={32} color={colors.accent.lime} />
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal - above everything with Modal component */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by sport</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.filterChips}>
                {SPORT_LIST.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[styles.chip, filterSports.includes(sport) && styles.chipActive]}
                    onPress={() => toggleSportFilter(sport)}
                  >
                    <Text style={styles.chipEmoji}>{SPORT_EMOJI[sport]}</Text>
                    <Text style={[styles.chipText, filterSports.includes(sport) && styles.chipTextActive]}>
                      {SPORT_LABELS[sport]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const MemberCardContent: React.FC<{ member: PublicProfile }> = ({ member }) => {
  return (
    <View style={cardStyles.cardContent}>
      {member.avatar_url ? (
        <Image source={{ uri: member.avatar_url }} style={cardStyles.cardImage} />
      ) : (
        <View style={[cardStyles.cardImagePlaceholder, { backgroundColor: getAvatarColor(member.name) }]}>
          <Text style={cardStyles.cardInitial}>{getInitial(member.name)}</Text>
        </View>
      )}

      <View style={cardStyles.cardOverlay}>
        <Text style={cardStyles.cardName}>{member.name ?? 'Unknown'}{member.age ? `, ${member.age}` : ''}</Text>
        {member.location_name && (
          <View style={cardStyles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.text.primary} />
            <Text style={cardStyles.cardLocation}>{member.location_name}</Text>
          </View>
        )}
        {member.bio && <Text style={cardStyles.cardBio} numberOfLines={2}>{member.bio}</Text>}

        {member.sports && member.sports.length > 0 && (
          <View style={cardStyles.sportsRow}>
            {member.sports.slice(0, 4).map((sport) => (
              <View key={sport} style={cardStyles.sportPill}>
                <Text style={cardStyles.sportPillEmoji}>
                  {SPORT_EMOJI[sport as SportType] ?? '🤸'}
                </Text>
                <Text style={cardStyles.sportPillText}>
                  {SPORT_LABELS[sport as SportType] ?? sport}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  cardContent: { flex: 1 },
  cardImage: { width: '100%', height: '100%', backgroundColor: colors.bg.elevated },
  cardImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  cardInitial: { color: colors.bg.primary, fontSize: 120, fontWeight: '800' },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
  },
  cardName: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.xs },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  cardLocation: { color: colors.text.primary, fontSize: 14 },
  cardBio: { color: colors.text.secondary, fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  sportsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(197,241,53,0.15)',
    borderRadius: 9999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.accent.lime,
  },
  sportPillEmoji: { fontSize: 12 },
  sportPillText: { color: colors.accent.lime, fontSize: 11, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.base,
  },
  logo: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: 2 },
  filterBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  filterDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.accent.lime,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterDotText: { color: colors.bg.primary, fontSize: 9, fontWeight: '700' },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: CARD_HEIGHT,
    backgroundColor: colors.bg.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  nextCard: {
    top: 8,
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
    zIndex: 0,
  },
  likeBadge: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderWidth: 4,
    borderColor: colors.accent.lime,
    borderRadius: 12,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    transform: [{ rotate: '20deg' }],
  },
  likeText: { color: colors.accent.lime, fontSize: 28, fontWeight: '800' },
  nopeBadge: {
    position: 'absolute',
    top: 60,
    left: 30,
    borderWidth: 4,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    transform: [{ rotate: '-20deg' }],
  },
  nopeText: { color: colors.danger, fontSize: 28, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing['5xl'],
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderWidth: 2,
  },
  skipBtn: { borderColor: colors.danger },
  infoBtn: { borderColor: colors.border.default, width: 48, height: 48, borderRadius: 24 },
  connectBtn: { borderColor: colors.accent.lime },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingTop: spacing['2xl'] },
  emptyTitle: { ...typography.h2, color: colors.text.primary, marginTop: spacing.base, textAlign: 'center' },
  emptyHint: { color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginTop: spacing.sm },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  refreshText: { color: colors.bg.primary, fontSize: 15, fontWeight: '700' },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: spacing['3xl'],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.base,
  },
  modalTitle: { ...typography.h2, color: colors.text.primary },
  modalContent: { paddingHorizontal: spacing.xl, paddingVertical: spacing.base },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  chipActive: { backgroundColor: 'rgba(197,241,53,0.15)', borderColor: colors.accent.lime },
  chipEmoji: { fontSize: 14 },
  chipText: { color: colors.text.secondary, fontSize: 13 },
  chipTextActive: { color: colors.accent.lime, fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  clearText: { color: colors.text.primary, fontSize: 15, fontWeight: '600' },
  applyButton: {
    flex: 1,
    backgroundColor: colors.accent.lime,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyText: { color: colors.bg.primary, fontSize: 15, fontWeight: '700' },
});
