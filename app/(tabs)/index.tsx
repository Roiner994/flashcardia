import { useStore } from '@/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../../global.css';

export default function HomeScreen() {
  const router = useRouter();
  const { decks, allCards, loadDecks, loadAllCards, isLoading } = useStore();

  useEffect(() => {
    loadDecks();
    loadAllCards();
  }, []);

  const dueToday = allCards.filter(c => c.status === 'new' || c.status === 'learning').length;
  const learnedWords = allCards.filter(c => c.status === 'mastered').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Ionicons name="sparkles" size={24} color="#10b981" />
                <Text style={styles.headerTitle}>MagicDeck</Text>
            </View>
            <View style={styles.avatar}>
                <Image 
                    source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} 
                    style={styles.avatarImage}
                />
            </View>
        </View>

        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Stats Dashboard */}
              <View style={styles.statsDashboard}>
                  <View style={styles.statBox}>
                      <View style={styles.statHeader}>
                          <Ionicons name="time-outline" size={20} color="#ef4444" />
                          <Text style={styles.statLabel}>Due Today</Text>
                      </View>
                      <Text style={styles.statValue}>{dueToday} Cards</Text>
                  </View>

                  <View style={styles.statBox}>
                      <View style={styles.statHeader}>
                          <Ionicons name="trending-up-outline" size={20} color="#10b981" />
                          <Text style={styles.statLabel}>Learned</Text>
                      </View>
                      <Text style={styles.statValue}>{learnedWords} Words</Text>
                  </View>
              </View>


              <Text style={styles.sectionTitle}>Your Decks</Text>
            </>
          }
          renderItem={({ item, index }) => {
              const deckCards = allCards.filter(c => c.deck_id === item.id);
              const newCards = deckCards.filter(c => c.status === 'new').length;
              const learningCards = deckCards.filter(c => c.status === 'learning').length;
              const masteredCards = deckCards.filter(c => c.status === 'mastered').length;
              const totalCards = deckCards.length;

              const iconBgColors = ['#dcfce7', '#ffedd5', '#dbeafe', '#f3e8ff'];
              const iconColors = ['#16a34a', '#ea580c', '#2563eb', '#9333ea'];

              const colorIndex = index % iconBgColors.length;

              return (
                <TouchableOpacity 
                   onPress={() => router.push(`/deck/${item.id}`)}
                   style={styles.deckItem}
                >
                    <View style={[styles.deckIcon, { backgroundColor: iconBgColors[colorIndex] }]}>
                        <Ionicons name="language" size={24} color={iconColors[colorIndex]} />
                    </View>
                    
                    <View style={styles.deckInfo}>
                        <Text style={styles.deckTitle}>{item.title}</Text>
                        <Text style={styles.deckSubtitle}>Total: {totalCards} cards</Text>
                    </View>
                    
                    <View style={styles.badges}>
                        <View style={[styles.badge, styles.badgeBlue]}><Text style={styles.badgeTextBlue}>{newCards}</Text></View>
                        <View style={[styles.badge, styles.badgeRed]}><Text style={styles.badgeTextRed}>{learningCards}</Text></View>
                        <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeTextGreen}>{masteredCards}</Text></View>
                    </View>
                </TouchableOpacity>
              );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
               <Text style={styles.emptyText}>No decks found.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshing={isLoading}
          onRefresh={loadDecks}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  statsDashboard: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
    marginBottom: 16,
  },
  deckItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  deckIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  deckSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    width: 32,
    alignItems: 'center',
  },
  badgeBlue: {
    backgroundColor: '#dbeafe',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
  },
  badgeTextBlue: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 12,
  },
  badgeTextRed: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 12,
  },
  badgeTextGreen: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    color: '#9ca3af',
  },
});
