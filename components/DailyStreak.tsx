import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export const DailyStreak = () => {
  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
      <View className="flex-row justify-between items-start mb-3">
        <View>
           <Text className="text-gray-900 dark:text-white font-bold text-lg">Daily Streak</Text>
           <Text className="text-gray-500 text-sm">You're 57% through today's goal!</Text>
        </View>
        <View className="flex-row items-center bg-orange-100 px-2 py-1 rounded-lg">
           <Ionicons name="flame" size={16} color="#f97316" />
           <Text className="text-orange-600 font-bold ml-1">12 Days</Text>
        </View>
      </View>
      
      {/* Week Days Visual */}
      <View className="flex-row justify-between mt-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
            const isActive = index < 3; // Mock active state
            const isToday = index === 3;
            
            return (
                <View key={index} className={`items-center justify-center w-8 h-8 rounded-full ${isActive ? 'bg-purple-600' : isToday ? 'bg-purple-100 border-2 border-purple-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Text className={`font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>{day}</Text>
                </View>
            )
        })}
      </View>
    </View>
  );
};
