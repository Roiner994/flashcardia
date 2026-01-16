import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';

export const SearchBar = () => {
  return (
    <View className="flex-row items-center bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6 shadow-sm">
      <Ionicons name="search" size={20} color="#9ca3af" className="mr-3" />
      <TextInput 
        placeholder="Search your flashcards..." 
        placeholderTextColor="#9ca3af"
        className="flex-1 text-base text-gray-900 dark:text-gray-100 font-medium"
      />
    </View>
  );
};
