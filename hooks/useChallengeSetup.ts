import { CARD_STATUS, CardStatus, CHALLENGE_DIFFICULTY, ChallengeDifficulty, ROUTES } from "@constants/AppConstants";
import { Deck } from "@store/types";
import { useStore } from "@store/useStore";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

export function useChallengeSetup(deck: Deck, onClose?: () => void) {
    const router = useRouter();
    const { allCards } = useStore();
    const deckCards = allCards.filter((c) => c.deck_id === deck.id);

    const [difficulty, setDifficulty] = useState<ChallengeDifficulty>(CHALLENGE_DIFFICULTY.EASY);
    const [selectedStatuses, setSelectedStatuses] = useState<CardStatus[]>([
        CARD_STATUS.LEARNING,
        CARD_STATUS.REVIEW,
    ]);
    const [cardLimit, setCardLimit] = useState(10);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState("");

    const toggleStatus = (status: CardStatus) => {
        setSelectedStatuses((prev) => {
            if (prev.includes(status)) {
                if (prev.length === 1) return prev;
                return prev.filter((s) => s !== status);
            } else {
                return [...prev, status];
            }
        });
    };

    const filteredCardsCount = useMemo(() => {
        return deckCards.filter((card) => {
            if (card.status === CARD_STATUS.NEW && selectedStatuses.includes(CARD_STATUS.NEW))
                return true;
            if (card.status === CARD_STATUS.MASTERED && selectedStatuses.includes(CARD_STATUS.REVIEW))
                return true;
            if (
                (card.status === CARD_STATUS.LEARNING || card.status === CARD_STATUS.REVIEW) &&
                selectedStatuses.includes(CARD_STATUS.LEARNING)
            )
                return true;
            return false;
        }).length;
    }, [deckCards, selectedStatuses]);

    const handleStart = () => {
        if (onClose) onClose();
        // Small delay to allow sheet to close animation
        setTimeout(() => {
            router.push({
                pathname: ROUTES.CHALLENGE_ACTIVE as any,
                params: {
                    deckId: deck.id,
                    difficulty,
                    statuses: JSON.stringify(selectedStatuses),
                    limit: cardLimit.toString(),
                },
            });
        }, 300);
    };

    return {
        difficulty,
        setDifficulty,
        selectedStatuses,
        toggleStatus,
        cardLimit,
        setCardLimit,
        isCustomMode,
        setIsCustomMode,
        customValue,
        setCustomValue,
        filteredCardsCount,
        handleStart,
    };
}
