
import { DataService } from '@/services/DataService';
import { Card } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Menu State
  const [menuVisible, setMenuVisible] = useState(false);

  // Animation values
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCards();
  }, [id]);

  async function loadCards() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await DataService.getCards(id);
      setCards(data);
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  }

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Calculate stats for Anki-style progress (Remaining unique cards in session)
  const remainingInQueue = cards.slice(currentIndex);
  
  // Get unique cards from current point forward to avoid double-counting re-queued items in the total
  const uniqueRemaining = remainingInQueue.filter((card, index, self) =>
    index === self.findIndex((c) => c.id === card.id)
  );

  const newCount = uniqueRemaining.filter(c => c.status === 'new').length;
  const learningCount = uniqueRemaining.filter(c => c.status === 'learning').length;
  const reviewCount = uniqueRemaining.filter(c => c.status === 'mastered').length;

  const handleRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    let newStatus: Card['status'] = 'learning';
    if (rating === 'good' || rating === 'easy') {
      newStatus = 'mastered';
    }

    // Create updated cards array
    const updatedCards = [...cards];
    updatedCards[currentIndex] = { ...currentCard, status: newStatus };

    // Re-queue if Again or Hard
    if (rating === 'again' || rating === 'hard') {
      updatedCards.push({ ...currentCard, status: 'learning' });
    }

    setCards(updatedCards);

    // Persist status change
    try {
      await DataService.updateCardStatus(currentCard.id, newStatus);
    } catch (e) {
      console.error("Failed to update card status:", e);
    }

    // Move to next card
    if (currentIndex < updatedCards.length - 1) {
       setIsFlipped(false);
       animatedValue.setValue(0);
       setCurrentIndex(prev => prev + 1);
    } else {
      Alert.alert("Session Complete", "You've reviewed all cards!", [
        { text: "Back to Deck", onPress: () => router.back() }
      ]);
    }
  };

  const handleDeleteCard = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setMenuVisible(false);
      
      const cardToDelete = cards[currentIndex];
      if (!cardToDelete) return;

      Alert.alert(
          "Delete Card",
          "Are you sure you want to delete this card?",
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: "Delete", 
                  style: "destructive", 
                  onPress: async () => {
                      try {
                          await DataService.deleteCard(cardToDelete.id);
                          
                          // Remove from queue
                          const updatedCards = [...cards];
                          updatedCards.splice(currentIndex, 1);
                          setCards(updatedCards);
                          
                          // Reset flip state for next card
                          if (isFlipped) {
                              animatedValue.setValue(0);
                              setIsFlipped(false);
                          }
                          
                          // Handle end of deck
                          if (updatedCards.length === 0) {
                              Alert.alert("Deck Empty", "No more cards in this deck.", [
                                  { text: "Back", onPress: () => router.back() }
                              ]);
                          } else if (currentIndex >= updatedCards.length) {
                              setCurrentIndex(updatedCards.length - 1);
                          }
                          // If we deleted the last card but there are others before it (weird edge case in study mode)
                          // currentIndex stays same effectively pointing to next card (which slid into this slot)
                      } catch (e) {
                          console.error("Failed to delete card", e);
                          Alert.alert("Error", "Could not delete card.");
                      }
                  }
              }
          ]
      );
  };

  const speak = () => {
    const thingToSay = cards[currentIndex]?.front_word;
    if (thingToSay) {
      console.log('Review Speaking:', thingToSay);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Speech.stop();
      Speech.speak(thingToSay, { 
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0]
  });
  
  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1]
  });

  if (loading) return (
    <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  if (cards.length === 0) return (
      <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No cards to review.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
              <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
      </View>
  );

  const currentCard = cards[currentIndex];

  if (!currentCard && !loading) return (
      <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading card...</Text>
      </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        {/* Header Progress - Anki Style */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
               <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            
            <View style={styles.statsContainer}>
                {/* New (Blue) */}
                <Text style={[styles.statCount, { color: '#3b82f6' }]}>{newCount}</Text>
                {/* Learning (Red) */}
                <Text style={[styles.statCount, { color: '#ef4444' }]}>{learningCount}</Text>
                {/* Review (Green) */}
                <Text style={[styles.statCount, { color: '#10b981' }]}>{reviewCount}</Text>
            </View>

            <TouchableOpacity style={styles.optionsButton} onPress={() => setMenuVisible(true)}>
               <Ionicons name="options" size={24} color="#374151" />
            </TouchableOpacity>
        </View>

        {/* Card Area */}
        <View style={styles.cardContainer}>
            <TouchableOpacity activeOpacity={1} onPress={flipCard}>
                <View>
                    {/* Front Side */}
                    <Animated.View 
                        pointerEvents={isFlipped ? 'none' : 'auto'}
                        style={[
                            styles.card, 
                            styles.cardFront,
                            { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity }
                        ]}
                    >
                        <View style={styles.pillLabelContainer}>
                            <Text style={styles.pillLabelText}>CONCEPT</Text>
                        </View>
                        <Text style={styles.frontWord}>
                            {currentCard.front_word}
                        </Text>
                        
                        <View style={styles.tapToFlipContainer}>
                             <Ionicons name="finger-print" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                             <Text style={styles.tapToFlipText}>TAP TO FLIP</Text>
                        </View>
                    </Animated.View>

                    {/* Back Side */}
                     <Animated.View 
                        pointerEvents={isFlipped ? 'auto' : 'none'}
                        style={[
                            styles.card, 
                            styles.cardBack,
                            { transform: [{ rotateY: backInterpolate }], opacity: backOpacity, position: 'absolute', top:0 }
                        ]}
                    >
                        <View style={styles.cardBackContent}>
                            <View style={styles.pillLabelContainerBack}>
                                <Text style={styles.pillLabelTextBack}>DEFINITION</Text>
                            </View>
                            <ScrollView contentContainerStyle={styles.cardBackScroll}>
                                <Text style={styles.definitionText}>
                                    {currentCard.definition}
                                </Text>
                                <View style={styles.divider} />
                                {currentCard.examples && currentCard.examples.length > 0 && (
                                     <View style={styles.exampleContainer}>
                                        <Text style={styles.exampleText}>"{currentCard.examples[0]}"</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        <TouchableOpacity 
                            onPress={(e) => { e.stopPropagation(); speak(); }} 
                            style={styles.audioButton}
                        >
                             <Ionicons name="volume-high" size={24} color="#10b981" />
                             <Text style={styles.audioButtonText}>Play Audio</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        </View>

        {/* Controls - ONLY show when flipped */}
        <View style={styles.controlsContainer}>
            {isFlipped ? (
                <View style={styles.controlsRow}>
                    <TouchableOpacity onPress={() => handleRating('again')} style={[styles.ratingButton, styles.ratingAgain]}>
                        <Text style={[styles.ratingLabel, styles.textRed]}>Again</Text>
                        <Text style={[styles.ratingSub, styles.textRedDim]}>1m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRating('hard')} style={[styles.ratingButton, styles.ratingHard]}>
                         <Text style={[styles.ratingLabel, styles.textOrange]}>Hard</Text>
                         <Text style={[styles.ratingSub, styles.textOrangeDim]}>10m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRating('good')} style={[styles.ratingButton, styles.ratingGood]}>
                         <Text style={[styles.ratingLabel, styles.textGreen]}>Good</Text>
                         <Text style={[styles.ratingSub, styles.textGreenDim]}>1d</Text>
                    </TouchableOpacity>
                     <TouchableOpacity onPress={() => handleRating('easy')} style={[styles.ratingButton, styles.ratingEasy]}>
                         <Text style={[styles.ratingLabel, styles.textBlue]}>Easy</Text>
                         <Text style={[styles.ratingSub, styles.textBlueDim]}>4d</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.tapHintContainer}>
                   <Text style={styles.tapHintText}>Tap card to see answer</Text>
                </View>
            )}
        </View>

        {/* Options Modal */}
        <Modal
            visible={menuVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
        >
            <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setMenuVisible(false)}
            >
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleDeleteCard}>
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        <Text style={[styles.menuText, { color: '#ef4444' }]}>Delete Card</Text>
                    </TouchableOpacity>
                     {/* Placeholder for future options */}
                     {/* <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                        <Ionicons name="pencil-outline" size={20} color="#374151" />
                        <Text style={styles.menuText}>Edit Card</Text>
                    </TouchableOpacity> */}
                </View>
            </TouchableOpacity>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // LIGHT MODE: gray-50
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#6b7280',
        fontSize: 16,
    },
    goBackButton: {
        backgroundColor: '#10b981', // green-500
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    goBackButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    closeButton: {
        padding: 4,
    },
    optionsButton: {
        padding: 4,
    },
    headerLabel: {
        color: '#9ca3af', // gray-400
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    statCount: {
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 20,
        textAlign: 'center',
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: width * 0.85,
        height: 480,
        borderRadius: 40,
        backfaceVisibility: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1, // Softer shadow for light mode
        shadowRadius: 20,
        elevation: 10,
    },
    cardFront: {
        backgroundColor: 'white', // LIGHT CARD
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        borderWidth: 1,
        borderColor: '#e5e7eb', // gray-200
    },
    cardBack: {
        backgroundColor: 'white', // LIGHT CARD
        padding: 32,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e5e7eb', // gray-200
    },
    pillLabelContainer: {
        backgroundColor: '#f3f4f6', // gray-100
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
        marginBottom: 32,
    },
    pillLabelText: {
        color: '#6b7280', // gray-500
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    frontWord: {
        fontSize: 42,
        fontWeight: '800',
        color: '#111827', // gray-900
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 50,
    },
    tapToFlipContainer: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tapToFlipText: {
        color: '#9ca3af', // gray-400
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    cardBackContent: {
        alignItems: 'center',
        flex: 1,
    },
    pillLabelContainerBack: {
        backgroundColor: '#ecfdf5', // green-50
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
        marginBottom: 24,
    },
    pillLabelTextBack: {
        color: '#059669', // green-600
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardBackScroll: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    definitionText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1f2937', // gray-800
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 24,
    },
    divider: {
        width: 40,
        height: 2,
        backgroundColor: '#f3f4f6', // gray-100
        marginBottom: 24,
    },
    exampleContainer: {
        backgroundColor: '#f9fafb', // gray-50
        padding: 16,
        borderRadius: 16,
        width: '100%',
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    exampleText: {
        color: '#4b5563', // gray-600
        textAlign: 'center',
        fontStyle: 'italic',
        fontSize: 16,
        lineHeight: 24,
    },
    audioButton: {
        backgroundColor: '#f3f4f6', // gray-100
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    audioButtonText: {
        color: '#374151', // gray-700
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    controlsContainer: {
        height: 128,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    ratingButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    ratingAgain: {
        borderColor: '#fee2e2', // red-100
    },
    ratingHard: {
        borderColor: '#ffedd5', // orange-100
    },
    ratingGood: {
        borderColor: '#dcfce7', // green-100
    },
    ratingEasy: {
        borderColor: '#dbeafe', // blue-100
    },
    ratingLabel: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    ratingSub: {
        fontSize: 12,
        color: '#9ca3af',
    },
    textRed: { color: '#ef4444' },
    textRedDim: { color: '#fca5a5' },
    textOrange: { color: '#f97316' },
    textOrangeDim: { color: '#fdba74' },
    textGreen: { color: '#10b981' },
    textGreenDim: { color: '#86efac' },
    textBlue: { color: '#3b82f6' },
    textBlueDim: { color: '#93c5fd' },
    tapHintContainer: {
        alignItems: 'center',
    },
    tapHintText: {
        color: '#9ca3af', // gray-400
        fontWeight: '600',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Menu Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)', // Lighter overlay
    },
    menuContainer: {
        position: 'absolute',
        top: 60, // Position below header
        right: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        width: 180,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuText: {
        fontSize: 14,
        marginLeft: 12,
        fontWeight: '500',
    },
});
