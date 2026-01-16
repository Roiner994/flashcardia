import { useStore } from '@/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../../global.css';

export default function HomeScreen() {
  const router = useRouter();
  const { decks, loadDecks, isLoading } = useStore();
  const [magicWord, setMagicWord] = useState('');
  
  useEffect(() => {
    loadDecks();
  }, []);

  const handleMagicGenerate = () => {
    if (!magicWord.trim()) return;
    if (decks.length > 0) {
        router.push({
            pathname: '/deck/[id]',
            params: { id: decks[0].id, initialMagicWord: magicWord }
        });
    }
    setMagicWord('');
  };

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
              {/* Daily Review Card */}
              <View style={styles.dailyCard}>
                  <Text style={styles.dailyLabel}>Daily Review</Text>
                  <Text style={styles.dailyCount}>42</Text>
                  <Text style={styles.dailySubtext}>cards ready to learn</Text>
                  
                  <TouchableOpacity style={styles.startButton}>
                      <Ionicons name="play-circle-outline" size={24} color="white" />
                      <Text style={styles.startButtonText}>Start Session</Text>
                  </TouchableOpacity>
              </View>

              {/* Quick Create Section */}
              <View style={styles.quickCreateSection}>
                  <View style={styles.quickCreateHeader}>
                      <Text style={styles.sectionTitle}>Quick Create</Text>
                      <Ionicons name="flash" size={18} color="#0ea5e9" />
                  </View>
                  
                  <View style={styles.quickCreateCard}>
                      <View style={styles.addToRow}>
                          <Text style={styles.addToLabel}>Add to:</Text>
                          <TouchableOpacity style={styles.deckSelector}>
                              <Text style={styles.deckSelectorText}>
                                  {decks.length > 0 ? decks[0].title : 'Select Deck'}
                              </Text>
                              <Ionicons name="caret-down" size={12} color="#166534" />
                          </TouchableOpacity>
                      </View>
                      
                      <View style={styles.inputRow}>
                          <Ionicons name="pencil" size={20} color="#9ca3af" />
                          <TextInput 
                              placeholder="Ephemeral"
                              placeholderTextColor="#374151" 
                              style={styles.magicInput}
                              value={magicWord}
                              onChangeText={setMagicWord}
                          />
                      </View>
                      
                      <TouchableOpacity style={styles.magicButton} onPress={handleMagicGenerate}>
                          <Ionicons name="sparkles-outline" size={20} color="white" />
                          <Text style={styles.magicButtonText}>Magic Generate</Text>
                      </TouchableOpacity>
                  </View>
              </View>

              <Text style={styles.sectionTitle}>Your Decks</Text>
            </>
          }
          renderItem={({ item, index }) => {
              const newCards = 12;
              const learningCards = 5;
              const masteredCards = 25;
              const icons: Array<keyof typeof Ionicons.glyphMap> = ['text', 'code-slash', 'flask', 'bulb'];
              const iconBgColors = ['#dcfce7', '#ffedd5', '#dbeafe', '#f3e8ff'];
              const iconColors = ['#16a34a', '#ea580c', '#2563eb', '#9333ea'];

              const iconIndex = index % icons.length;

              return (
                <TouchableOpacity 
                   onPress={() => router.push(`/deck/${item.id}`)}
                   style={styles.deckItem}
                >
                    <View style={[styles.deckIcon, { backgroundColor: iconBgColors[iconIndex] }]}>
                        <Ionicons name={icons[iconIndex]} size={24} color={iconColors[iconIndex]} />
                    </View>
                    
                    <View style={styles.deckInfo}>
                        <Text style={styles.deckTitle}>{item.title}</Text>
                        <Text style={styles.deckSubtitle}>Total: {newCards + learningCards + masteredCards} cards</Text>
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
  dailyCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  dailyLabel: {
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 8,
  },
  dailyCount: {
    fontSize: 64,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  dailySubtext: {
    color: '#9ca3af',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#10b981',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  quickCreateSection: {
    marginBottom: 32,
  },
  quickCreateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
    marginBottom: 16,
  },
  quickCreateCard: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  addToRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addToLabel: {
    color: '#6b7280',
    fontWeight: '500',
  },
  deckSelector: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deckSelectorText: {
    color: '#166534',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 4,
  },
  inputRow: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  magicInput: {
    flex: 1,
    fontWeight: '600',
    fontSize: 18,
    color: '#111827',
    marginLeft: 12,
  },
  magicButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  magicButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
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
