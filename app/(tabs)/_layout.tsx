import { useStore } from '@/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import '../../global.css';

export default function TabLayout() {
  const router = useRouter();
  const { createDeck } = useStore();
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [newDeckTitle, setNewDeckTitle] = React.useState('');

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) return;
    await createDeck(newDeckTitle);
    setNewDeckTitle('');
    setModalVisible(false);
  };

  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 0,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
        },
        tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Decks',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "layers" : "layers-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />,
        }}
      />
    </Tabs>

    {/* Floating Add Button */}
    <View style={styles.fabContainer}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={styles.fab}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>

     {/* Create Deck Modal */}
     <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>New Collection</Text> 
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={28} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Deck Title</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="e.g. Spanish Basics"
                        placeholderTextColor="#9ca3af"
                        value={newDeckTitle}
                        onChangeText={setNewDeckTitle}
                        autoFocus
                    />
                </View>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateDeck}
                >
                    <Text style={styles.createButtonText}>Create Deck</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  fab: {
    backgroundColor: '#10b981',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  inputContainer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  inputLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
