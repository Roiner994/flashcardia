import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Deck } from '../types';

interface DeckCardProps {
  deck: Deck;
}

export const DeckCard = ({ deck }: DeckCardProps) => {
  // Mock progress
  const progress = Math.floor(Math.random() * 100); 
  const color = progress > 70 ? 'text-green-500' : progress > 30 ? 'text-yellow-500' : 'text-blue-500';
  const ringColor = progress > 70 ? 'border-green-500' : progress > 30 ? 'border-yellow-500' : 'border-blue-500';

  return (
    <Link href={`/deck/${deck.id}`} asChild>
      <TouchableOpacity className="bg-white dark:bg-gray-800 p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
        <View className="flex-1">
            <Text className="text-xs font-bold text-green-600 uppercase mb-1 tracking-wider">75% Complete</Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">{deck.title}</Text>
            
            <View className="flex-row items-center">
                 <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                     <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">12 cards due</Text>
                 </View>
            </View>

             <TouchableOpacity className="mt-4 bg-indigo-600 self-start px-4 py-2 rounded-xl flex-row items-center shadow-indigo-200 shadow-lg">
                <Text className="text-white font-semibold text-sm mr-2">Study Now</Text>
                <Ionicons name="arrow-forward" size={14} color="white" />
             </TouchableOpacity>
        </View>

        {/* Progress Ring Mockup */}
        <View className={`w-16 h-16 rounded-full border-4 ${ringColor} items-center justify-center ml-4`}>
             <Text className="font-bold text-gray-700 dark:text-gray-300">{progress}%</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};
