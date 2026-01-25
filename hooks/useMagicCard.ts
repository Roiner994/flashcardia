import { MagicCardResult, MagicGenerator } from '@/services/MagicGenerator';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export function useMagicCard(deckId: string) {
    const { t } = useTranslation();
    const { addCard, loadCards } = useStore();

    const [magicWord, setMagicWord] = useState('');
    const [creationStep, setCreationStep] = useState<'input' | 'preview'>('input');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<MagicCardResult | null>(null);

    const resetCreation = () => {
        setMagicWord('');
        setGeneratedResult(null);
        setCreationStep('input');
    };

    const generateCard = async () => {
        if (!magicWord.trim()) return;
        setIsGenerating(true);
        try {
            const result = await MagicGenerator.generateCard(magicWord);
            setGeneratedResult(result);
            setCreationStep('preview');
            return true;
        } catch (error) {
            Alert.alert(t('magic.errorTitle'), t('magic.errorBody'));
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    const saveCard = async () => {
        if (!generatedResult) return;

        try {
            await addCard({
                deck_id: deckId,
                front_word: magicWord,
                definition: generatedResult.definition,
                spanish_meaning: generatedResult.spanish_meaning,
                phonetic: generatedResult.phonetic || null,
                examples: generatedResult.examples,
                status: 'new',
                next_review_at: null,
                interval: 0,
                ease_factor: 2.5,
            });
            resetCreation();
            // Reload cards to refresh the list in the UI
            await loadCards(deckId);
            return true;
        } catch (error) {
            console.error('Failed to save card:', error);
            Alert.alert('Error', 'Failed to save card.');
            return false;
        }
    };

    return {
        magicWord,
        setMagicWord,
        creationStep,
        setCreationStep,
        isGenerating,
        generatedResult,
        generateCard,
        saveCard,
        resetCreation,
    };
}
