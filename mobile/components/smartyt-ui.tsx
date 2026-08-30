import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export type IconName = React.ComponentProps<typeof Feather>['name'];

export function Entrance({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 460 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 520 }));
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, 14);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop }}>{children}</View>
    </View>
  );
}

export function TopBar({
  title,
  eyebrow,
  onBack,
  rightIcon,
  onRightPress,
}: {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.topBar}>
      {onBack ? (
        <IconButton icon="arrow-left" label="Go back" onPress={onBack} />
      ) : (
        <View style={styles.wordmark}>
          <View style={[styles.wordmarkMark, { backgroundColor: colors.primary }]}>
            <Feather name="play" size={12} color={colors.primaryForeground} />
          </View>
          <Text style={[styles.wordmarkText, { color: colors.foreground }]}>smartyt</Text>
        </View>
      )}
      <View style={styles.topBarTitle}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>{eyebrow}</Text> : null}
        <Text style={[styles.topBarTitleText, { color: colors.foreground }]}>{title}</Text>
      </View>
      {rightIcon ? <IconButton icon={rightIcon} label="Open action" onPress={onRightPress} /> : <View style={styles.iconButtonPlaceholder} />}
    </View>
  );
}

export function IconButton({ icon, label, onPress, tint }: { icon: IconName; label: string; onPress?: () => void; tint?: string }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityLabel={label}
      testID={`icon-${icon}`}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Feather name={icon} size={20} color={tint ?? colors.foreground} />
    </Pressable>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'coral' | 'teal' | 'amber' }) {
  const colors = useColors();
  const palette = {
    neutral: { backgroundColor: colors.muted, color: colors.mutedForeground },
    coral: { backgroundColor: colors.primary, color: colors.primaryForeground },
    teal: { backgroundColor: colors.accent, color: colors.accentForeground },
    amber: { backgroundColor: colors.amber, color: colors.navy },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.pillText, { color: palette.color }]}>{children}</Text>
    </View>
  );
}

export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({ label, icon, onPress, compact = false }: { label: string; icon?: IconName; onPress?: () => void; compact?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      testID={`button-${label.toLowerCase().replaceAll(' ', '-')}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        compact && styles.primaryButtonCompact,
        { backgroundColor: colors.primary },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{label}</Text>
      {icon ? <Feather name={icon} size={16} color={colors.primaryForeground} /> : null}
    </Pressable>
  );
}

export function StatCard({ label, value, delta, icon, tint }: { label: string; value: string; delta: string; icon: IconName; tint: 'coral' | 'teal' | 'amber' }) {
  const colors = useColors();
  const tintColor = tint === 'coral' ? colors.primary : tint === 'teal' ? colors.teal : colors.amber;
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
          <Feather name={icon} size={15} color={tintColor} />
        </View>
        <Text style={[styles.statDelta, { color: colors.success }]}>{delta}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export function ActionTile({ icon, title, caption, onPress, tint }: { icon: IconName; title: string; caption: string; onPress?: () => void; tint: 'coral' | 'teal' | 'amber' }) {
  const colors = useColors();
  const tintColor = tint === 'coral' ? colors.primary : tint === 'teal' ? colors.teal : colors.amber;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionTile, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={18} color={tintColor} />
      </View>
      <Text style={[styles.actionTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.actionCaption, { color: colors.mutedForeground }]}>{caption}</Text>
      <Feather name="arrow-up-right" size={15} color={colors.mutedForeground} style={styles.actionArrow} />
    </Pressable>
  );
}

export function EmptyState({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.muted }]}>
      <Feather name={icon} size={24} color={colors.mutedForeground} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

export function BottomNav({ active, onChange, unread }: { active: string; onChange: (value: 'home' | 'create' | 'calendar' | 'analytics' | 'profile') => void; unread: number }) {
  const colors = useColors();
  const items: { id: 'home' | 'create' | 'calendar' | 'analytics' | 'profile'; label: string; icon: IconName }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'create', label: 'Create', icon: 'plus-circle' },
    { id: 'calendar', label: 'Plan', icon: 'calendar' },
    { id: 'analytics', label: 'Grow', icon: 'bar-chart-2' },
    { id: 'profile', label: 'You', icon: 'user' },
  ];
  return (
    <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {items.map((item) => {
        const selected = active === item.id;
        return (
          <Pressable key={item.id} onPress={() => onChange(item.id)} style={styles.navItem} testID={`tab-${item.id}`}>
            <View style={[styles.navIconWrap, selected && { backgroundColor: colors.secondary }]}>
              <Feather name={item.icon} size={19} color={selected ? colors.primary : colors.mutedForeground} />
              {item.id === 'home' && unread > 0 ? <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} /> : null}
            </View>
            <Text style={[styles.navLabel, { color: selected ? colors.primary : colors.mutedForeground }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 124 },
  topSpacing: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { minHeight: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  wordmarkMark: { width: 25, height: 25, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  wordmarkText: { fontSize: 16, fontWeight: '700', letterSpacing: -0.4 },
  topBarTitle: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  topBarTitleText: { fontSize: 15, fontWeight: '600', marginTop: 1 },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  iconButtonPlaceholder: { width: 38 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.98 }] },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '700', letterSpacing: -0.45 },
  sectionAction: { fontSize: 13, fontWeight: '700' },
  primaryButton: { minHeight: 48, borderRadius: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonCompact: { minHeight: 40, borderRadius: 12, paddingHorizontal: 14 },
  primaryButtonText: { fontSize: 13, fontWeight: '700' },
  statCard: { flex: 1, minHeight: 112, borderRadius: 16, borderWidth: 1, padding: 13 },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statIcon: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statDelta: { fontSize: 10, fontWeight: '700' },
  statValue: { fontSize: 25, fontWeight: '700', marginTop: 10, letterSpacing: -0.8 },
  statLabel: { fontSize: 11, marginTop: 2 },
  actionTile: { width: 154, minHeight: 136, borderRadius: 17, borderWidth: 1, padding: 14, marginRight: 10 },
  actionIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 14, fontWeight: '700' },
  actionCaption: { fontSize: 11, lineHeight: 16, marginTop: 4, paddingRight: 6 },
  actionArrow: { position: 'absolute', top: 14, right: 13 },
  emptyState: { borderRadius: 18, alignItems: 'center', padding: 28 },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptyBody: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5, maxWidth: 250 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 82, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 8 },
  navItem: { alignItems: 'center', width: 68, gap: 4 },
  navIconWrap: { width: 38, height: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: '600' },
  notificationDot: { width: 6, height: 6, borderRadius: 3, position: 'absolute', right: 7, top: 3 },
});