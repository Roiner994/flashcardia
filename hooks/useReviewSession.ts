import { DataService } from '@/services/DataService';
import { useStore } from '@/store/useStore';
import { Card } from '@/types';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useReviewSession(deckId: string | undefined) {
    const { currentCards, loadCards, updateCardSRS } = useStore();
    const [cards, setCards] = useState<Card[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initCards() {
            if (!deckId) return;
            setLoading(true);
            try {
                await loadCards(deckId);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        initCards();
    }, [deckId]);

    useEffect(() => {
        if (cards.length === 0 && currentCards.length > 0) {
            setCards(currentCards);
        }
    }, [currentCards]);

    // Stats Logic
    const remainingInQueue = cards.slice(currentIndex);
    const uniqueRemaining = remainingInQueue.filter(
        (card, index, self) => index === self.findIndex((c) => c.id === card.id)
    );

    const stats = {
        new: uniqueRemaining.filter((c) => c.status === 'new').length,
        learning: uniqueRemaining.filter((c) => c.status === 'learning').length,
        review: uniqueRemaining.filter((c) => c.status === 'review' || c.status === 'mastered').length,
    };

    const handleRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const currentCard = cards[currentIndex];
        if (!currentCard) return;

        // 1. Prepare updated cards array (Local session state)
        const updatedCards = [...cards];
        const nextStatus =
            rating === 'again' || rating === 'hard'
                ? 'learning'
                : rating === 'easy'
                    ? 'mastered'
                    : 'review';

        // Update the current instance in the history
        updatedCards[currentIndex] = { ...currentCard, status: nextStatus };

        // Re-queue if Again or Hard (Immediate session feedback)
        if (rating === 'again' || rating === 'hard') {
            updatedCards.push({ ...currentCard, status: 'learning' });
        }

        // 2. Persist status change via Store (SM-2 Logic)
        try {
            updateCardSRS(currentCard.id, rating); // No await to prevent UI blocking
        } catch (e) {
            console.error('Failed to update card status:', e);
        }

        // 3. Move to next card
        if (currentIndex < updatedCards.length - 1) {
            // Return values to let UI handle animation reset
            setCards(updatedCards);
            setCurrentIndex((prev) => prev + 1);
            return { isComplete: false };
        } else {
            setCards(updatedCards);
            return { isComplete: true };
        }
    };

    const handleDeleteCurrentCard = async () => {
        const cardToDelete = cards[currentIndex];
        if (!cardToDelete) return;

        try {
            await DataService.deleteCard(cardToDelete.id);

            const updatedCards = [...cards];
            updatedCards.splice(currentIndex, 1);
            setCards(updatedCards);

            // Handle end of deck / index adjustment
            const isDeckEmpty = updatedCards.length === 0;
            if (isDeckEmpty) {
                Alert.alert("Deck Empty", "No more cards in this deck.", [
                    { text: "Back", onPress: () => router.back() }
                ]);
            } else if (currentIndex >= updatedCards.length) {
                setCurrentIndex(updatedCards.length - 1);
            }

            return { success: true, isDeckEmpty };
        } catch (e) {
            console.error("Failed to delete card", e);
            Alert.alert("Error", "Could not delete card.");
            return { success: false };
        }
    };

    return {
        cards,
        currentIndex,
        loading,
        stats,
        handleRating,
        handleDeleteCurrentCard,
        currentCard: cards[currentIndex]
    };
}
