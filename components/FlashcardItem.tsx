import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../types';

interface FlashcardItemProps {
  card: Card;
  onPress: () => void;
}

export const FlashcardItem = ({ card, onPress }: FlashcardItemProps) => {
  const getStatusColor = (status: Card['status']) => {
    switch (status) {
      case 'mastered': return 'bg-green-100 text-green-700';
      case 'learning': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const statusStyle = getStatusColor(card.status || 'new'); // Fallback if undefined

  return (
    <TouchableOpacity onPress={onPress} className="bg-gray-800 p-4 rounded-xl mb-3 flex-row items-center justify-between border border-gray-700">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-4">
            <Ionicons name="text" size={20} color="#e5e7eb" />
        </View>
        <View className="flex-1">
            <View className="flex-row items-center mb-1">
                <Text className="text-white font-bold text-lg mr-2">{card.front_word}</Text>
                 <View className={`px-2 py-0.5 rounded ${statusStyle.split(' ')[0]}`}>
                    <Text className={`text-xs font-bold uppercase ${statusStyle.split(' ')[1]}`}>{card.status || 'NEW'}</Text>
                </View>
            </View>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>{card.definition}</Text>
        </View>
      </View>
      <Ionicons name="pencil" size={16} color="#6b7280" />
    </TouchableOpacity>
  );
};
