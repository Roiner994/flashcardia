import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Header = () => {
  return (
    <View className="flex-row justify-between items-center mb-6">
      <View className="flex-row items-center gap-3">
        {/* Placeholder Avatar - in real app, fetch from auth */}
        <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center border border-purple-200">
           <Image 
            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }}
            className="w-10 h-10 rounded-full"
           />
        </View>
        
      </View>
      <TouchableOpacity className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
        <Ionicons name="settings-outline" size={20} color="#374151" />
      </TouchableOpacity>
    </View>
  );
};
