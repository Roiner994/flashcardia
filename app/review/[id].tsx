import { DataService } from '@/services/DataService';
import { Card } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import '../../global.css';

const { width } = Dimensions.get('window');

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

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
      // Filter for active cards if needed, for now load all
      setCards(data);
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  }

  const flipCard = () => {
    Animated.spring(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    // Logic to update card status (Mock for now, or update local state)
    // In a real SRS, this would calculate next review date.
    
    // Move to next card
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      animatedValue.setValue(0);
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert("Session Complete", "You've reviewed all cards!", [
        { text: "Back to Deck", onPress: () => router.back() }
      ]);
    }
  };

  const speak = () => {
    const thingToSay = cards[currentIndex]?.front_word;
    if (thingToSay) {
      Speech.speak(thingToSay, { language: 'en' });
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

  if (loading) return <View className="flex-1 bg-gray-900 items-center justify-center"><Text className="text-white">Loading...</Text></View>;
  if (cards.length === 0) return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
          <Text className="text-white mb-4">No cards to review.</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-purple-600 px-6 py-3 rounded-xl">
              <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
      </View>
  );

  const currentCard = cards[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
        {/* Header Progress */}
        <View className="flex-row justify-between items-center px-6 py-4">
            <TouchableOpacity onPress={() => router.back()}>
               <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
            <View>
                <Text className="text-gray-400 font-bold text-center text-xs uppercase tracking-wider">Learning</Text>
                <Text className="text-white font-bold text-center">{currentIndex + 1} / {cards.length}</Text>
            </View>
            <TouchableOpacity>
               <Ionicons name="options" size={24} color="#9ca3af" />
            </TouchableOpacity>
        </View>

        {/* Card Area */}
        <View className="flex-1 items-center justify-center">
            <TouchableOpacity activeOpacity={1} onPress={flipCard}>
                <View>
                    {/* Front Side */}
                    <Animated.View 
                        style={[
                            styles.card, 
                            { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity }
                        ]}
                        className="bg-gray-800 rounded-[40px] shadow-2xl items-center justify-center p-8 border border-gray-700"
                    >
                        <View className="bg-gray-700 px-3 py-1 rounded-full mb-8">
                            <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Concept</Text>
                        </View>
                        <Text className="text-5xl font-extrabold text-white text-center mb-10 leading-tight">
                            {currentCard.front_word}
                        </Text>
                        
                        <View className="absolute bottom-10 flex-row items-center">
                             <Ionicons name="finger-print" size={20} color="#6b7280" className="mr-2" />
                             <Text className="text-gray-500 text-sm font-semibold uppercase tracking-widest">Tap to flip</Text>
                        </View>
                    </Animated.View>

                    {/* Back Side */}
                     <Animated.View 
                        style={[
                            styles.card, 
                            { transform: [{ rotateY: backInterpolate }], opacity: backOpacity, position: 'absolute', top:0 }
                        ]}
                        className="bg-indigo-600 rounded-[40px] shadow-2xl p-8 justify-between border border-indigo-400"
                    >
                        <View className="items-center">
                            <View className="bg-indigo-500/50 px-3 py-1 rounded-full mb-6">
                                <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Definition</Text>
                            </View>
                            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
                                <Text className="text-2xl font-semibold text-white text-center leading-8 mb-6">
                                    {currentCard.definition}
                                </Text>
                                {currentCard.example_sentence && (
                                     <View className="bg-indigo-800/50 p-4 rounded-2xl w-full">
                                        <Text className="text-indigo-100 text-center italic leading-6">"{currentCard.example_sentence}"</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        <TouchableOpacity 
                            onPress={(e) => { e.stopPropagation(); speak(); }} 
                            className="bg-white/20 p-4 rounded-2xl flex-row items-center justify-center mt-4"
                        >
                             <Ionicons name="volume-high" size={24} color="white" />
                             <Text className="text-white font-bold ml-2">Play Audio</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        </View>

        {/* Controls - ONLY show when flipped */}
        <View className="h-32 px-6 justify-center">
            {isFlipped ? (
                <View className="flex-row justify-between gap-3">
                    <TouchableOpacity onPress={() => handleRating('again')} className="flex-1 bg-red-900/50 border border-red-500/30 py-4 rounded-2xl items-center">
                        <Text className="text-red-400 font-bold mb-1">Again</Text>
                        <Text className="text-red-500/50 text-xs">1m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRating('hard')} className="flex-1 bg-orange-900/50 border border-orange-500/30 py-4 rounded-2xl items-center">
                         <Text className="text-orange-400 font-bold mb-1">Hard</Text>
                         <Text className="text-orange-500/50 text-xs">10m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRating('good')} className="flex-1 bg-green-900/50 border border-green-500/30 py-4 rounded-2xl items-center">
                         <Text className="text-green-400 font-bold mb-1">Good</Text>
                         <Text className="text-green-500/50 text-xs">1d</Text>
                    </TouchableOpacity>
                     <TouchableOpacity onPress={() => handleRating('easy')} className="flex-1 bg-blue-900/50 border border-blue-500/30 py-4 rounded-2xl items-center">
                         <Text className="text-blue-400 font-bold mb-1">Easy</Text>
                         <Text className="text-blue-500/50 text-xs">4d</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="items-center">
                   <Text className="text-gray-600 font-semibold">Tap card to see answer</Text>
                </View>
            )}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    card: {
        width: width * 0.85,
        height: 480, // Fixed height for consistency
        backfaceVisibility: 'hidden',
    }
});
