import React, { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ActionTile, BottomNav, EmptyState, Entrance, IconButton, Pill, PrimaryButton, Screen, SectionHeading, StatCard, TopBar, uiStyles } from '@/components/smartyt-ui';
import { useColors } from '@/hooks/useColors';
import { useSmartyt, type CreatorProfile, type Idea } from '@/state/smartyt';

type MainScreen = 'home' | 'create' | 'calendar' | 'analytics' | 'profile';
type OverlayScreen = 'ideas' | 'seo' | 'notifications' | null;
type CreateMode = 'Idea' | 'Script' | 'Title' | 'SEO';

export default function AppIndex() {
  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [overlay, setOverlay] = useState<OverlayScreen>(null);
  const { notifications } = useSmartyt();
  const unread = notifications.filter((item) => !item.read).length;

  const goTo = (screen: MainScreen) => {
    Haptics.selectionAsync().catch(() => undefined);
    setOverlay(null);
    setMainScreen(screen);
  };

  if (overlay === 'ideas') return <IdeasScreen onBack={() => setOverlay(null)} onCreate={() => { setOverlay(null); setMainScreen('create'); }} />;
  if (overlay === 'seo') return <SeoScreen onBack={() => setOverlay(null)} />;
  if (overlay === 'notifications') return <NotificationsScreen onBack={() => setOverlay(null)} />;

  return (
    <Screen>
      {mainScreen === 'home' ? <HomeScreen onNavigate={goTo} onIdeas={() => setOverlay('ideas')} onNotifications={() => setOverlay('notifications')} onSeo={() => setOverlay('seo')} /> : null}
      {mainScreen === 'create' ? <CreateScreen onBack={() => goTo('home')} /> : null}
      {mainScreen === 'calendar' ? <CalendarScreen onBack={() => goTo('home')} /> : null}
      {mainScreen === 'analytics' ? <AnalyticsScreen onBack={() => goTo('home')} /> : null}
      {mainScreen === 'profile' ? <ProfileScreen onBack={() => goTo('home')} /> : null}
      {mainScreen !== 'create' && mainScreen !== 'calendar' && mainScreen !== 'analytics' && mainScreen !== 'profile' ? (
        <BottomNav active={mainScreen} onChange={goTo} unread={unread} />
      ) : (
        <BottomNav active={mainScreen} onChange={goTo} unread={unread} />
      )}
    </Screen>
  );
}

function HomeScreen({ onNavigate, onIdeas, onNotifications, onSeo }: { onNavigate: (screen: MainScreen) => void; onIdeas: () => void; onNotifications: () => void; onSeo: () => void }) {
  const colors = useColors();
  const { profile, ideas } = useSmartyt();
  const firstName = profile.creatorName.split(' ')[0] || 'Creator';
  const savedIdeas = ideas.filter((idea) => idea.saved).length;
  return (
    <View style={styles.fullHeight}>
      <TopBar title={`Good morning, ${firstName}`} eyebrow="Sunday · Aug 30" rightIcon="bell" onRightPress={onNotifications} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={uiStyles.scrollContent}>
        <Entrance delay={80}><LinearGradient colors={[colors.navy, colors.navyElevated]} style={styles.heroCard}>
          <View style={[styles.heroGlow, { backgroundColor: colors.navyElevated }]} />
          <View style={styles.heroTopRow}>
            <Pill tone="teal">Creator signal</Pill>
            <Text style={[styles.heroMeta, { color: colors.onDarkSoft ?? colors.mutedForeground }]}>This week</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.onDark ?? colors.background }]}>Make the next{"\n"}video count.</Text>
          <Text style={[styles.heroBody, { color: colors.onDarkSoft ?? colors.mutedForeground }]}>Your audience is leaning into practical AI workflows. Turn that signal into your next upload.</Text>
          <View style={styles.heroFooter}>
            <PrimaryButton label="Create with AI" icon="arrow-up-right" onPress={() => onNavigate('create')} />
            <View style={styles.signalScore}>
              <Text style={[styles.signalScoreValue, { color: colors.amber }]}>84</Text>
              <Text style={[styles.signalScoreLabel, { color: colors.onDarkSoft ?? colors.mutedForeground }]}>signal score</Text>
            </View>
          </View>
        </LinearGradient></Entrance>

        <Entrance delay={170}><View style={styles.sectionBlock}>
          <SectionHeading title="Your momentum" action="View analytics" onAction={() => onNavigate('analytics')} />
          <View style={styles.statRow}>
            <StatCard label="Views this week" value="24.8K" delta="+18%" icon="eye" tint="coral" />
            <StatCard label="Avg. retention" value="61%" delta="+6%" icon="activity" tint="teal" />
            <StatCard label="Ideas saved" value={String(savedIdeas).padStart(2, '0')} delta="+3" icon="bookmark" tint="amber" />
          </View>
        </View></Entrance>

        <Entrance delay={250}><View style={styles.sectionBlock}>
          <SectionHeading title="Build momentum" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tilesRow}>
            <ActionTile icon="zap" title="Idea lab" caption="Find your next strong angle" tint="coral" onPress={onIdeas} />
            <ActionTile icon="edit-3" title="Write a script" caption="Go from spark to structure" tint="teal" onPress={() => onNavigate('create')} />
            <ActionTile icon="search" title="SEO check" caption="Sharpen your packaging" tint="amber" onPress={onSeo} />
          </ScrollView>
        </View></Entrance>

        <Entrance delay={330}><View style={styles.sectionBlock}>
          <SectionHeading title="Studio pulse" action="Open calendar" onAction={() => onNavigate('calendar')} />
          <View style={[styles.pulseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.pulseHeader}>
              <View style={[styles.pulseIcon, { backgroundColor: colors.secondary }]}><Feather name="trending-up" size={17} color={colors.teal} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pulseTitle, { color: colors.foreground }]}>Your best window is Thursday</Text>
                <Text style={[styles.pulseBody, { color: colors.mutedForeground }]}>Audience activity peaks around 6:00 PM.</Text>
              </View>
              <Text style={[styles.pulsePercent, { color: colors.teal }]}>+32%</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}><View style={[styles.progressFill, { backgroundColor: colors.teal, width: '72%' }]} /></View>
            <View style={styles.pulseLegend}><Text style={[styles.pulseLegendText, { color: colors.mutedForeground }]}>Weekly audience signal</Text><Text style={[styles.pulseLegendText, { color: colors.foreground }]}>Strong</Text></View>
          </View>
        </View></Entrance>

        <Entrance delay={410}><View style={styles.sectionBlock}>
          <SectionHeading title="Recent ideas" action="See all" onAction={onIdeas} />
          {ideas.slice(0, 2).map((idea) => <IdeaRow key={idea.id} idea={idea} compact onPress={onIdeas} />)}
        </View></Entrance>
      </ScrollView>
    </View>
  );
}

function IdeaRow({ idea, compact = false, onPress }: { idea: Idea; compact?: boolean; onPress?: () => void }) {
  const colors = useColors();
  const { toggleIdeaSaved } = useSmartyt();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ideaRow, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
      <View style={[styles.ideaIndex, { backgroundColor: colors.secondary }]}><Text style={[styles.ideaIndexText, { color: colors.primary }]}>0{Math.min(9, idea.score % 10)}</Text></View>
      <View style={styles.ideaCopy}>
        <Text numberOfLines={compact ? 2 : undefined} style={[styles.ideaTitle, { color: colors.foreground }]}>{idea.title}</Text>
        <Text numberOfLines={compact ? 1 : 2} style={[styles.ideaAngle, { color: colors.mutedForeground }]}>{idea.angle}</Text>
        <View style={styles.ideaMeta}><Pill tone={idea.status === 'published' ? 'teal' : idea.status === 'ready' ? 'coral' : 'neutral'}>{idea.status}</Pill><Text style={[styles.ideaScore, { color: colors.mutedForeground }]}>{idea.score}% fit</Text></View>
      </View>
      <IconButton icon={idea.saved ? 'bookmark' : 'bookmark'} label={idea.saved ? 'Remove bookmark' : 'Save idea'} tint={idea.saved ? colors.primary : colors.mutedForeground} onPress={() => toggleIdeaSaved(idea.id)} />
    </Pressable>
  );
}

function CreateScreen({ onBack }: { onBack: () => void }) {
  const colors = useColors();
  const { addIdea, addDraft } = useSmartyt();
  const [mode, setMode] = useState<CreateMode>('Idea');
  const [prompt, setPrompt] = useState('');
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const modes: { label: CreateMode; icon: 'star' | 'file-text' | 'type' | 'search' }[] = [
    { label: 'Idea', icon: 'star' }, { label: 'Script', icon: 'file-text' }, { label: 'Title', icon: 'type' }, { label: 'SEO', icon: 'search' },
  ];
  const generate = () => {
    if (!prompt.trim()) {
      Alert.alert('Add a direction', 'Tell Smartyt what you want to make first.');
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setTimeout(() => {
      setGenerated(true);
      setSaving(false);
      if (mode === 'Idea') addIdea({ title: `A smarter take on ${prompt.trim()}`, angle: 'A clear, useful angle with a strong opening promise and room for a personal story.', score: 88, status: 'ready' });
      if (mode === 'Script') addDraft({ title: prompt.trim(), type: 'Long form', status: 'Draft' });
    }, 420);
  };
  return (
    <View style={styles.fullHeight}>
      <TopBar title="Create studio" eyebrow="Make something useful" onBack={onBack} rightIcon="more-horizontal" />
      <KeyboardAwareScrollViewCompat contentContainerStyle={uiStyles.scrollContent} bottomOffset={80} keyboardShouldPersistTaps="handled">
        <Entrance><Text style={[styles.pageTitle, { color: colors.foreground }]}>Start with a{"\n"}strong direction.</Text></Entrance>
        <Entrance delay={90}><Text style={[styles.pageIntro, { color: colors.mutedForeground }]}>Smartyt turns a rough thought into a clearer angle, better packaging, and a plan you can actually ship.</Text></Entrance>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>
          {modes.map((item) => {
            const selected = item.label === mode;
            return <Pressable key={item.label} onPress={() => { setMode(item.label); setGenerated(false); }} style={[styles.modeChip, { backgroundColor: selected ? colors.navy : colors.card, borderColor: selected ? colors.navy : colors.border }]}><Feather name={item.icon} size={15} color={selected ? colors.background : colors.mutedForeground} /><Text style={[styles.modeChipText, { color: selected ? colors.background : colors.mutedForeground }]}>{item.label}</Text></Pressable>;
          })}
        </ScrollView>
        <Entrance delay={170}><View style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>What are you thinking about?</Text>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            multiline
            placeholder={mode === 'Idea' ? 'e.g. A video about building better habits with AI' : `Describe the ${mode.toLowerCase()} you want to create`}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.promptInput, { color: colors.foreground, borderColor: colors.border }]}
            textAlignVertical="top"
          />
          <View style={styles.promptFooter}><Text style={[styles.promptHint, { color: colors.mutedForeground }]}>{prompt.length}/240</Text><PrimaryButton label={saving ? 'Thinking…' : `Generate ${mode}`} icon="star" onPress={generate} compact /></View>
        </View></Entrance>
        {generated ? (
          <Entrance delay={60}><View style={[styles.resultCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <View style={styles.resultHeader}><Pill tone="teal">Smartyt result</Pill><IconButton icon="copy" label="Copy result" onPress={() => Alert.alert('Copied', 'Your result is ready to paste into your next workflow.')} /></View>
            <Text style={[styles.resultTitle, { color: colors.foreground }]}>{mode === 'Idea' ? `The ${prompt.trim()} workflow nobody explains` : mode === 'Script' ? `Opening script for ${prompt.trim()}` : `A sharper ${mode.toLowerCase()} for ${prompt.trim()}`}</Text>
            <Text style={[styles.resultBody, { color: colors.mutedForeground }]}>Lead with the tension your audience already feels, then give them one repeatable move they can use today. Keep the proof personal and the payoff specific.</Text>
            <View style={styles.resultActions}><Pressable onPress={() => setGenerated(false)}><Text style={[styles.textAction, { color: colors.mutedForeground }]}>Refine</Text></Pressable><PrimaryButton label={mode === 'Idea' ? 'Save idea' : 'Save draft'} icon="arrow-right" compact onPress={() => Alert.alert('Saved', 'Added to your Smartyt workspace.')} /></View>
          </View></Entrance>
        ) : null}
        <View style={styles.tipRow}><Feather name="info" size={15} color={colors.teal} /><Text style={[styles.tipText, { color: colors.mutedForeground }]}>Specific context gives Smartyt a stronger creative signal.</Text></View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function IdeasScreen({ onBack, onCreate }: { onBack: () => void; onCreate: () => void }) {
  const colors = useColors();
  const { ideas } = useSmartyt();
  return (
    <Screen>
      <TopBar title="Idea lab" eyebrow="Find the next angle" onBack={onBack} rightIcon="plus" onRightPress={onCreate} />
      <FlatList data={ideas} keyExtractor={(item) => item.id} renderItem={({ item }) => <IdeaRow idea={item} onPress={() => undefined} />} contentContainerStyle={uiStyles.scrollContent} showsVerticalScrollIndicator={false} ListHeaderComponent={<View><Text style={[styles.pageTitleSmall, { color: colors.foreground }]}>Ideas with{"\n"}a reason to exist.</Text><Text style={[styles.pageIntro, { color: colors.mutedForeground }]}>Each idea is scored against your audience, your topics, and what is moving right now.</Text><View style={styles.filterRow}><Pill tone="coral">For you</Pill><Pill>Saved</Pill><Pill>Highest fit</Pill></View></View>} ListEmptyComponent={<EmptyState icon="inbox" title="Your lab is clear" body="Generate a new idea and Smartyt will keep the strongest angles here." />} />
    </Screen>
  );
}

function SeoScreen({ onBack }: { onBack: () => void }) {
  const colors = useColors();
  const [title, setTitle] = useState('The 5-minute workflow that makes every video sharper');
  const [checked, setChecked] = useState(false);
  const score = checked ? 91 : 68;
  return (
    <Screen>
      <TopBar title="SEO lab" eyebrow="Package the promise" onBack={onBack} />
      <KeyboardAwareScrollViewCompat contentContainerStyle={uiStyles.scrollContent} bottomOffset={60}>
        <View style={[styles.scoreHero, { backgroundColor: colors.navy }]}>
          <View><Text style={[styles.scoreEyebrow, { color: colors.onDarkSoft ?? colors.mutedForeground }]}>Current packaging score</Text><Text style={[styles.scoreNumber, { color: colors.amber }]}>{score}</Text><Text style={[styles.scoreOutOf, { color: colors.onDarkSoft ?? colors.mutedForeground }]}>/ 100</Text></View>
          <View style={[styles.scoreRing, { borderColor: colors.amber }]}><Text style={[styles.scoreRingText, { color: colors.amber }]}>{checked ? 'A' : 'C+'}</Text><Text style={[styles.scoreRingCaption, { color: colors.onDarkSoft }]} >potential</Text></View>
        </View>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>Video title</Text>
        <TextInput value={title} onChangeText={(value) => { setTitle(value); setChecked(false); }} multiline style={[styles.titleInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
        <View style={styles.checkList}>
          {['Clear audience promise', 'Curiosity without clickbait', 'Strong search language'].map((item, index) => <View key={item} style={styles.checkItem}><View style={[styles.checkCircle, { backgroundColor: checked || index < 2 ? colors.success : colors.secondary }]}><Feather name="check" size={12} color={colors.card} /></View><Text style={[styles.checkText, { color: colors.foreground }]}>{item}</Text><Text style={[styles.checkStatus, { color: checked || index < 2 ? colors.success : colors.mutedForeground }]}>{checked || index < 2 ? 'Good' : 'Review'}</Text></View>)}
        </View>
        <PrimaryButton label="Analyze title" icon="trending-up" onPress={() => { setChecked(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined); }} />
        <Text style={[styles.subsectionLabel, { color: colors.mutedForeground }]}>Smartyt suggestion</Text>
        <View style={[styles.suggestionCard, { backgroundColor: colors.secondary }]}><Feather name="edit-3" size={16} color={colors.primary} /><Text style={[styles.suggestionText, { color: colors.foreground }]}>Move “sharper” closer to the benefit and make the five minutes feel more concrete.</Text></View>
      </KeyboardAwareScrollViewCompat>
    </Screen>
  );
}

function CalendarScreen({ onBack }: { onBack: () => void }) {
  const colors = useColors();
  const { drafts } = useSmartyt();
  return (
    <View style={styles.fullHeight}>
      <TopBar title="Content calendar" eyebrow="Keep the promise" onBack={onBack} rightIcon="plus" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={uiStyles.scrollContent}>
        <View style={styles.calendarHeader}><View><Text style={[styles.pageTitleSmall, { color: colors.foreground }]}>September{"\n"}starts strong.</Text><Text style={[styles.pageIntro, { color: colors.mutedForeground }]}>Two pieces ready to move from idea to audience.</Text></View><IconButton icon="filter" label="Filter calendar" /></View>
        <View style={[styles.monthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.monthTop}><Text style={[styles.monthLabel, { color: colors.foreground }]}>AUG 30 — SEP 05</Text><View style={styles.monthArrows}><IconButton icon="chevron-left" label="Previous week" /><IconButton icon="chevron-right" label="Next week" /></View></View>
          <View style={styles.weekRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <View key={`${day}-${index}`} style={styles.dayCell}><Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{day}</Text><View style={[styles.dayNumber, index === 0 && { backgroundColor: colors.primary }]}><Text style={[styles.dayNumberText, { color: index === 0 ? colors.primaryForeground : colors.foreground }]}>{30 + index}</Text></View>{index === 4 ? <View style={[styles.dayDot, { backgroundColor: colors.teal }]} /> : null}</View>)}</View>
        </View>
        <SectionHeading title="Upcoming" action="Add content" />
        {drafts.map((draft) => <View key={draft.id} style={[styles.scheduleRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.scheduleDate, { backgroundColor: colors.secondary }]}><Text style={[styles.scheduleDateDay, { color: colors.primary }]}>{draft.status === 'Scheduled' ? '02' : '04'}</Text><Text style={[styles.scheduleDateMonth, { color: colors.mutedForeground }]}>SEP</Text></View><View style={styles.scheduleCopy}><Text style={[styles.scheduleTitle, { color: colors.foreground }]}>{draft.title}</Text><Text style={[styles.scheduleMeta, { color: colors.mutedForeground }]}>{draft.type} · {draft.status === 'Scheduled' ? '6:00 PM' : 'Needs a final pass'}</Text></View><Pill tone={draft.status === 'Scheduled' ? 'teal' : 'neutral'}>{draft.status}</Pill></View>)}
      </ScrollView>
    </View>
  );
}

function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const colors = useColors();
  const bars = [42, 58, 48, 72, 62, 84, 70];
  return (
    <View style={styles.fullHeight}>
      <TopBar title="Growth signals" eyebrow="Learn what compounds" onBack={onBack} rightIcon="download" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={uiStyles.scrollContent}>
        <Text style={[styles.pageTitleSmall, { color: colors.foreground }]}>The work is{"\n"}starting to compound.</Text>
        <Text style={[styles.pageIntro, { color: colors.mutedForeground }]}>A clearer view of what your audience responds to, beyond a single viral spike.</Text>
        <View style={styles.analyticsStatRow}><View><Text style={[styles.bigMetric, { color: colors.foreground }]}>24,810</Text><Text style={[styles.metricCaption, { color: colors.mutedForeground }]}>views this week</Text></View><Pill tone="teal">+18.4%</Pill></View>
        <View style={[styles.chartCard, { backgroundColor: colors.navy }]}>
          <View style={styles.chartHeader}><Text style={[styles.chartTitle, { color: colors.background }]}>Audience attention</Text><Text style={[styles.chartPeriod, { color: colors.onDarkSoft ?? colors.mutedForeground }]}>Last 7 days</Text></View>
          <View style={styles.chartBars}>{bars.map((height, index) => <View key={index} style={styles.chartBarGroup}><View style={[styles.chartBar, { height, backgroundColor: index === 5 ? colors.primary : colors.teal }]} /><Text style={[styles.chartDay, { color: colors.onDarkSoft ?? colors.mutedForeground }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text></View>)}</View>
          <View style={[styles.chartCallout, { backgroundColor: colors.navyElevated }]}><Feather name="arrow-up-right" size={14} color={colors.amber} /><Text style={[styles.chartCalloutText, { color: colors.background }]}>Your strongest day is Saturday</Text></View>
        </View>
        <SectionHeading title="What is working" />
        {[['Repeatable systems', 'Your practical videos hold attention 22% longer.', 'layers'], ['Direct openings', 'Questions in the first 10 seconds earn more saves.', 'message-circle'], ['Consistent windows', 'Thursday and Saturday are worth protecting.', 'clock']].map(([title, body, icon]) => <View key={title} style={[styles.insightRow, { borderBottomColor: colors.border }]}><View style={[styles.insightIcon, { backgroundColor: colors.secondary }]}><Feather name={icon as 'layers'} size={16} color={colors.primary} /></View><View style={styles.insightCopy}><Text style={[styles.insightTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.insightBody, { color: colors.mutedForeground }]}>{body}</Text></View><Feather name="arrow-up-right" size={15} color={colors.mutedForeground} /></View>)}
      </ScrollView>
    </View>
  );
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const colors = useColors();
  const { notifications, markNotificationRead } = useSmartyt();
  return (
    <Screen>
      <TopBar title="Notifications" eyebrow="Keep your signal close" onBack={onBack} />
      <FlatList data={notifications} keyExtractor={(item) => item.id} contentContainerStyle={uiStyles.scrollContent} showsVerticalScrollIndicator={false} renderItem={({ item }) => <Pressable onPress={() => markNotificationRead(item.id)} style={[styles.notificationRow, { backgroundColor: item.read ? colors.card : colors.secondary, borderColor: colors.border }]}><View style={[styles.notificationIcon, { backgroundColor: item.read ? colors.muted : colors.primary }]}><Feather name={item.title.includes('SEO') ? 'trending-up' : item.title.includes('upload') ? 'calendar' : 'bell'} size={16} color={item.read ? colors.mutedForeground : colors.primaryForeground} /></View><View style={styles.notificationCopy}><View style={styles.notificationTitleRow}><Text style={[styles.notificationTitle, { color: colors.foreground }]}>{item.title}</Text>{!item.read ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}</View><Text style={[styles.notificationBody, { color: colors.mutedForeground }]}>{item.body}</Text><Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>{item.time}</Text></View></Pressable>} ListEmptyComponent={<EmptyState icon="bell-off" title="All quiet" body="You are caught up for now." />} />
    </Screen>
  );
}

function ProfileScreen({ onBack }: { onBack: () => void }) {
  const colors = useColors();
  const { profile, updateProfile } = useSmartyt();
  const [draft, setDraft] = useState<CreatorProfile>(profile);
  const [editing, setEditing] = useState(false);
  const save = () => { updateProfile(draft); setEditing(false); Alert.alert('Profile updated', 'Your creator context is ready for the next suggestion.'); };
  return (
    <View style={styles.fullHeight}>
      <TopBar title="Your creator profile" eyebrow="Content DNA" onBack={onBack} rightIcon={editing ? 'check' : 'edit-3'} onRightPress={editing ? save : () => setEditing(true)} />
      <KeyboardAwareScrollViewCompat contentContainerStyle={uiStyles.scrollContent} bottomOffset={60}>
        <View style={[styles.profileHero, { backgroundColor: colors.navy }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{profile.creatorName.slice(0, 1).toUpperCase()}</Text></View>
          <Text style={[styles.profileName, { color: colors.background }]}>{profile.creatorName}</Text>
          <Text style={[styles.profileHandle, { color: colors.onDarkSoft ?? colors.mutedForeground }]}>{profile.handle}</Text>
          <Pill tone="amber">Free plan</Pill>
        </View>
        <Text style={[styles.subsectionLabel, { color: colors.mutedForeground }]}>Creator details</Text>
        {([['creatorName', 'Creator name'], ['handle', 'Handle'], ['audience', 'Who you make for'], ['language', 'Main language']] as const).map(([key, label]) => <View key={key} style={styles.profileField}><Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{label}</Text><TextInput editable={editing} value={draft[key]} onChangeText={(value) => setDraft((current) => ({ ...current, [key]: value }))} style={[styles.profileInput, { color: colors.foreground, backgroundColor: editing ? colors.card : colors.muted, borderColor: colors.border }]} /></View>)}
        <Text style={[styles.subsectionLabel, { color: colors.mutedForeground }]}>Main topics</Text>
        <View style={styles.topicWrap}>{profile.topics.map((topic) => <Pill key={topic} tone="teal">{topic}</Pill>)}</View>
        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}><View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}><Feather name="shield" size={16} color={colors.teal} /></View><View style={styles.insightCopy}><Text style={[styles.insightTitle, { color: colors.foreground }]}>Your data stays yours</Text><Text style={[styles.insightBody, { color: colors.mutedForeground }]}>Smartyt uses this context to make suggestions that sound like you.</Text></View><Feather name="chevron-right" size={16} color={colors.mutedForeground} /></View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  fullHeight: { flex: 1 },
  heroCard: { minHeight: 284, borderRadius: 24, marginBottom: 26, padding: 21, overflow: 'hidden' },
  heroGlow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -70, top: -70, opacity: 0.7 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroMeta: { fontSize: 11 },
  heroTitle: { fontSize: 34, lineHeight: 37, fontWeight: '700', letterSpacing: -1.3, marginTop: 29 },
  heroBody: { fontSize: 13, lineHeight: 19, maxWidth: 280, marginTop: 13 },
  heroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 },
  signalScore: { alignItems: 'flex-end' },
  signalScoreValue: { fontSize: 29, fontWeight: '700' },
  signalScoreLabel: { fontSize: 10 },
  sectionBlock: { marginBottom: 26 },
  statRow: { flexDirection: 'row', gap: 9 },
  tilesRow: { paddingRight: 20 },
  pulseCard: { borderWidth: 1, borderRadius: 17, padding: 15 },
  pulseHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  pulseIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  pulseTitle: { fontSize: 13, fontWeight: '700' },
  pulseBody: { fontSize: 11, marginTop: 3 },
  pulsePercent: { fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 7, borderRadius: 5, overflow: 'hidden', marginTop: 17 },
  progressFill: { height: '100%', borderRadius: 5 },
  pulseLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  pulseLegendText: { fontSize: 10, fontWeight: '600' },
  ideaRow: { borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 11, marginBottom: 9 },
  ideaIndex: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ideaIndexText: { fontSize: 11, fontWeight: '700' },
  ideaCopy: { flex: 1 },
  ideaTitle: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
  ideaAngle: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  ideaMeta: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 9 },
  ideaScore: { fontSize: 10, fontWeight: '600' },
  pageTitle: { fontSize: 34, lineHeight: 37, letterSpacing: -1.2, fontWeight: '700', marginTop: 12 },
  pageTitleSmall: { fontSize: 28, lineHeight: 31, letterSpacing: -0.9, fontWeight: '700', marginTop: 12 },
  pageIntro: { fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 340 },
  modeRow: { gap: 8, paddingVertical: 23 },
  modeChip: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, height: 39, flexDirection: 'row', alignItems: 'center', gap: 7 },
  modeChipText: { fontSize: 12, fontWeight: '700' },
  promptCard: { borderWidth: 1, borderRadius: 18, padding: 14 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  promptInput: { minHeight: 116, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, lineHeight: 20 },
  promptFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  promptHint: { fontSize: 11 },
  resultCard: { borderWidth: 1, borderRadius: 18, padding: 15, marginTop: 15 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultTitle: { fontSize: 19, lineHeight: 25, fontWeight: '700', marginTop: 16 },
  resultBody: { fontSize: 13, lineHeight: 19, marginTop: 9 },
  resultActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 20, marginTop: 18 },
  textAction: { fontSize: 13, fontWeight: '700' },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 17 },
  tipText: { flex: 1, fontSize: 11, lineHeight: 16 },
  filterRow: { flexDirection: 'row', gap: 8, paddingTop: 18, paddingBottom: 18 },
  scoreHero: { borderRadius: 21, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  scoreEyebrow: { fontSize: 11 },
  scoreNumber: { fontSize: 55, fontWeight: '700', lineHeight: 62 },
  scoreOutOf: { position: 'absolute', left: 78, bottom: 22, fontSize: 12 },
  scoreRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreRingText: { fontSize: 28, fontWeight: '700' },
  scoreRingCaption: { fontSize: 10, marginTop: 1 },
  titleInput: { borderWidth: 1, borderRadius: 14, padding: 13, fontSize: 15, lineHeight: 21, minHeight: 72 },
  checkList: { marginVertical: 16 },
  checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 9 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  checkText: { flex: 1, fontSize: 13, fontWeight: '600' },
  checkStatus: { fontSize: 11, fontWeight: '700' },
  subsectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 10 },
  suggestionCard: { borderRadius: 15, padding: 14, flexDirection: 'row', gap: 10 },
  suggestionText: { flex: 1, fontSize: 13, lineHeight: 19 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 19 },
  monthCard: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 24 },
  monthTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.7 },
  monthArrows: { flexDirection: 'row', gap: 1 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  dayCell: { alignItems: 'center', width: 34 },
  dayLabel: { fontSize: 10, fontWeight: '600' },
  dayNumber: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  dayNumberText: { fontSize: 12, fontWeight: '700' },
  dayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 6 },
  scheduleRow: { borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 9 },
  scheduleDate: { width: 42, height: 47, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scheduleDateDay: { fontSize: 18, fontWeight: '700' },
  scheduleDateMonth: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  scheduleCopy: { flex: 1 },
  scheduleTitle: { fontSize: 12, fontWeight: '700', lineHeight: 17 },
  scheduleMeta: { fontSize: 10, marginTop: 3 },
  analyticsStatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },
  bigMetric: { fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  metricCaption: { fontSize: 11, marginTop: 1 },
  chartCard: { borderRadius: 20, padding: 17, minHeight: 248 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  chartTitle: { fontSize: 13, fontWeight: '700' },
  chartPeriod: { fontSize: 10 },
  chartBars: { height: 125, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: 24 },
  chartBarGroup: { alignItems: 'center', gap: 8 },
  chartBar: { width: 21, borderRadius: 7 },
  chartDay: { fontSize: 10 },
  chartCallout: { alignSelf: 'flex-start', borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 8, marginTop: 16 },
  chartCalloutText: { fontSize: 10, fontWeight: '600' },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 14, borderBottomWidth: 1 },
  insightIcon: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  insightCopy: { flex: 1 },
  insightTitle: { fontSize: 13, fontWeight: '700' },
  insightBody: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  notificationRow: { borderWidth: 1, borderRadius: 17, padding: 14, flexDirection: 'row', gap: 11, marginBottom: 10 },
  notificationIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  notificationCopy: { flex: 1 },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  notificationTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4 },
  notificationBody: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  notificationTime: { fontSize: 10, marginTop: 8 },
  profileHero: { borderRadius: 22, padding: 22, alignItems: 'center', marginBottom: 5 },
  avatar: { width: 62, height: 62, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 27, fontWeight: '700' },
  profileName: { fontSize: 22, fontWeight: '700' },
  profileHandle: { fontSize: 12, marginTop: 3, marginBottom: 14 },
  profileField: { marginBottom: 13 },
  profileInput: { height: 47, borderWidth: 1, borderRadius: 13, paddingHorizontal: 12, fontSize: 13 },
  topicWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  settingRow: { borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 17, marginTop: 23 },
  settingIcon: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
});