import { MagicCardResult, MagicGenerator } from '@/services/MagicGenerator';
import { useStore } from '@/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeckDetailScreen() {
  const { id, initialMagicWord } = useLocalSearchParams<{ id: string, initialMagicWord?: string }>();
  const router = useRouter();
  const { decks, currentCards, loadCards, addCard, updateDeck, isLoading } = useStore();
  
  // Settings/Menu State
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [creationStep, setCreationStep] = useState<'input' | 'preview'>('input');
  const [magicWord, setMagicWord] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<MagicCardResult | null>(null);

  const deck = decks.find(d => d.id === id);

  useEffect(() => {
    if (id) {
      loadCards(id);
    }
  }, [id]);

  useEffect(() => {
    if (initialMagicWord) {
        setMagicWord(initialMagicWord);
        setModalVisible(true);
        setCreationStep('input');
    }
  }, [initialMagicWord]);

  if (!deck) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Deck not found</Text>
      </View>
    );
  }

  // Stats
  const getCount = (status: string) => currentCards.filter(c => (c.status || 'new') === status).length;
  const newCount = getCount('new');
  const learningCount = getCount('learning');
  const reviewCount = currentCards.filter(c => c.status === 'review' || c.status === 'mastered').length;

  // Magic Logic
  async function handleMagicGenerate() {
    if (!magicWord.trim()) return;
    setIsGenerating(true);
    try {
      const result = await MagicGenerator.generateCard(magicWord);
      setGeneratedResult(result);
      setCreationStep('preview');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveCard() {
    if (!generatedResult) return;
    await addCard({
      deck_id: id,
      front_word: magicWord,
      definition: generatedResult.definition,
      spanish_meaning: generatedResult.spanish_meaning,
      phonetic: generatedResult.phonetic || null,
      examples: generatedResult.examples,
      status: 'new',
      next_review_at: null,
      interval: 0,
      ease_factor: 2.5,
    });
    setModalVisible(false);
    resetCreation();
    loadCards(id);
  }

  const resetCreation = () => {
    setMagicWord('');
    setGeneratedResult(null);
    setCreationStep('input');
  };

  const handleStartSession = () => {
    if (currentCards.length === 0) {
      Alert.alert('No Cards', 'Add some cards first to start a study session.');
      return;
    }
    router.push(`/review/${id}`);
  };

  const speak = (text: string) => {
    if (!text) return;
    console.log('Speaking:', text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.stop();
    Speech.speak(text, { 
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Deck Banner */}
        <TouchableOpacity style={styles.bannerCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="language" size={32} color="#10b981" />
          </View>
          <Text style={styles.deckTitle}>{deck.title}</Text>
          <Text style={styles.cardCount}>{currentCards.length} Cards Total</Text>
          
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Ionicons name="play-circle-outline" size={24} color="white" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{newCount}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#ef4444' }]}>{learningCount}</Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10b981' }]}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Review</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionCard} onPress={() => setModalVisible(true)}>
          <View style={styles.actionIcon}>
            <Ionicons name="sparkles" size={20} color="#10b981" />
          </View>
          <Text style={styles.actionText}>Create card with AI...</Text>
          <Ionicons name="arrow-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        {/* Recent Cards */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Cards</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {currentCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No cards yet. Create your first card!</Text>
          </View>
        ) : (
          currentCards.slice(0, 5).map((card) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardFront}>{card.front_word}</Text>
                <Text style={styles.cardBack}>{card.definition}</Text>
              </View>
              <View style={[
                styles.statusDot,
                { backgroundColor: 
                  card.status === 'mastered' ? '#10b981' : 
                  card.status === 'learning' ? '#ef4444' : '#3b82f6' 
                }
              ]} />
            </View>
          ))
        )}
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={isSettingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.inputModalContent}>
            <View style={styles.modalGrabber} />
            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setSettingsVisible(false)}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.inputModalHeader}>
              <Text style={styles.inputModalTitle}>Deck Settings</Text>
              <Text style={styles.inputModalSub}>
                  Customize the learning rules for this specific deck.
              </Text>
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingIconCol}>
                <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Daily New Limit</Text>
                <Text style={styles.settingHint}>How many new cards to see per session</Text>
              </View>
              <View style={styles.limitControls}>
                <TouchableOpacity 
                  onPress={() => updateDeck(deck.id, { daily_new_limit: Math.max(1, (deck.daily_new_limit ?? 10) - 5) })}
                  style={styles.controlButton}
                >
                  <Ionicons name="remove" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.limitValue}>{deck.daily_new_limit ?? 10}</Text>
                <TouchableOpacity 
                  onPress={() => updateDeck(deck.id, { daily_new_limit: Math.min(100, (deck.daily_new_limit ?? 10) + 5) })}
                  style={styles.controlButton}
                >
                  <Ionicons name="add" size={20} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteDeckButton}
              onPress={() => {
                Alert.alert(
                  'Delete Deck',
                  'Are you sure you want to delete this deck and all its cards?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive', 
                      onPress: async () => {
                        await useStore.getState().deleteDeck(deck.id);
                        setSettingsVisible(false);
                        router.back();
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={styles.deleteDeckText}>Delete Deck</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Magic Creation Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={creationStep === 'input'}>
        <View style={creationStep === 'input' ? styles.modalOverlay : styles.previewContainer}>
          {creationStep === 'input' ? (
            <View style={styles.inputModalContent}>
              <View style={styles.modalGrabber} />
              <TouchableOpacity 
                style={styles.closeModalButton} 
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>

              <View style={styles.inputModalHeader}>
                <Text style={styles.inputModalTitle}>Create Magic Card</Text>
                <Text style={styles.inputModalSub}>
                    Type a word or phrase and we'll generate meaning, Spanish translation, examples, and pronunciation.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Word or phrase</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.magicInputMain}
                        placeholder="e.g. Serendipity"
                        placeholderTextColor="#9ca3af"
                        value={magicWord}
                        onChangeText={setMagicWord}
                        autoFocus
                    />
                    <TouchableOpacity style={styles.micButton}>
                        <Ionicons name="mic-outline" size={24} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.inputNote}>You can also paste a short sentence or expression.</Text>
              </View>

              <TouchableOpacity
                style={[styles.mainGenerateButton, (!magicWord.trim() || isGenerating) && styles.buttonDisabled]}
                onPress={handleMagicGenerate}
                disabled={!magicWord.trim() || isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="white" />
                    <Text style={styles.mainGenerateButtonText}>Generate with AI</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <SafeAreaView style={styles.previewSafeArea}>
              <View style={styles.previewHeader}>
                <TouchableOpacity onPress={() => setCreationStep('input')} style={styles.previewBack}>
                  <Ionicons name="arrow-back" size={24} color="#10b981" />
                </TouchableOpacity>
                <Text style={styles.previewHeaderTitle}>Card Preview</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.previewCardBody}>
                  <View style={styles.wordHeroContainer}>
                    <Text style={styles.previewWordMain}>{magicWord}</Text>
                    
                    <TouchableOpacity onPress={() => speak(magicWord)} style={styles.phoneticRow}>
                      <View style={styles.audioButtonPreview}>
                          <Ionicons name="volume-medium" size={18} color="#10b981" />
                      </View>
                      <Text style={styles.phoneticTextPreview}>{generatedResult?.phonetic}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.contentBlock}>
                    <Text style={styles.contentLabel}>CONCEPT</Text>
                    <Text style={styles.contentText}>{generatedResult?.definition}</Text>
                  </View>

                  <View style={styles.contentBlock}>
                    <Text style={styles.contentLabel}>MEANING</Text>
                    <View style={styles.meaningBox}>
                        <Text style={styles.contentText}>{generatedResult?.spanish_meaning}</Text>
                    </View>
                  </View>

                  <View style={styles.contentBlock}>
                    <Text style={styles.contentLabel}>USAGE EXAMPLES</Text>
                    {generatedResult?.examples.map((ex, idx) => (
                        <View key={idx} style={styles.exampleListItem}>
                            <View style={styles.bullet} />
                            <Text style={styles.exampleItemText}>{ex}</Text>
                        </View>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.previewFooter}>
                <TouchableOpacity style={styles.saveToDeckButton} onPress={handleSaveCard}>
                    <Ionicons name="checkmark" size={24} color="white" />
                    <Text style={styles.saveToDeckText}>Save Card to Deck</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteTryAgain} onPress={resetCreation}>
                    <Text style={styles.deleteTryAgainText}>Delete & Try Again</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bannerCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 32,
  },
  deckTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#10b981',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: '#10b981',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    color: '#9ca3af',
  },
  cardItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardFront: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cardBack: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  
  // Modal Input Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  inputModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalGrabber: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeModalButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputModalHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  inputModalSub: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
  },
  magicInputMain: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  micButton: {
    padding: 8,
  },
  inputNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
  },
  mainGenerateButton: {
    backgroundColor: '#10b981',
    height: 64,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainGenerateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Preview Styles
  previewContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  previewSafeArea: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  previewBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  previewScroll: {
    flex: 1,
  },
  previewCardBody: {
    padding: 24,
  },
  previewWordMain: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  wordHeroContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  audioButtonPreview: {
    marginRight: 8,
  },
  phoneticTextPreview: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 24,
  },
  contentBlock: {
    marginBottom: 32,
  },
  contentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  contentText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500',
  },
  meaningBox: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
  },
  exampleListItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginTop: 10,
    marginRight: 12,
  },
  exampleItemText: {
    flex: 1,
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  previewFooter: {
    padding: 24,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: 'white',
  },
  saveToDeckButton: {
    backgroundColor: '#10b981',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveToDeckText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  deleteTryAgain: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deleteTryAgainText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  // Settings Menu Styles
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIconCol: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  limitControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  deleteDeckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  deleteDeckText: {
    color: '#ef4444',
    fontWeight: '700',
    marginLeft: 8,
  },
});
