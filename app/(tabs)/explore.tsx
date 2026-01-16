import { useStore } from '@/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DecksScreen() {
  const router = useRouter();
  const { decks, loadDecks, isLoading } = useStore();

  useEffect(() => {
    loadDecks();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>All Decks</Text>
          <Text style={styles.subtitle}>{decks.length} collections</Text>
        </View>
        
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
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
                  <Text style={styles.deckSubtitle}>Tap to view cards</Text>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="library-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No Decks Yet</Text>
              <Text style={styles.emptyText}>
                Create your first deck using the + button below!
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
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
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
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
    elevation: 2,
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
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
