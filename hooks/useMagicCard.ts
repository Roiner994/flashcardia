import { MagicCardResult, MagicGenerator } from '@services/MagicGenerator';
import { DataService } from '@services/DataService';
import { useStore } from '@store/useStore';
import { CardDraft } from '@types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

const createDraftFromResult = (word: string, result: MagicCardResult): CardDraft => ({
    front_word: word,
    definition: result.definition,
    spanish_meaning: result.spanish_meaning,
    phonetic: result.phonetic || '',
    examples: result.examples?.length ? result.examples : [''],
    image_url: null,
    audio_url: null,
    audio_source: 'tts',
});

export function useMagicCard(deckId: string) {
    const { t } = useTranslation();
    const { addCard } = useStore();

    const [magicWord, setMagicWord] = useState('');
    const [creationStep, setCreationStep] = useState<'input' | 'preview'>('input');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftCard, setDraftCard] = useState<CardDraft | null>(null);

    const resetCreation = () => {
        setMagicWord('');
        setDraftCard(null);
        setCreationStep('input');
    };

    const generateCard = async () => {
        if (!magicWord.trim()) return;
        setIsGenerating(true);
        try {
            const result = await MagicGenerator.generateCard(magicWord);
            setDraftCard(createDraftFromResult(magicWord.trim(), result));
            setCreationStep('preview');
            return true;
        } catch (error) {
            Alert.alert(t('magic.errorTitle'), t('magic.errorBody'));
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    const updateDraftField = <K extends keyof CardDraft>(field: K, value: CardDraft[K]) => {
        setDraftCard((current) => (current ? { ...current, [field]: value } : current));
    };

    const updateExample = (index: number, value: string) => {
        setDraftCard((current) => {
            if (!current) return current;
            const examples = [...current.examples];
            examples[index] = value;
            return { ...current, examples };
        });
    };

    const addExample = () => {
        setDraftCard((current) => (current ? { ...current, examples: [...current.examples, ''] } : current));
    };

    const removeExample = (index: number) => {
        setDraftCard((current) => {
            if (!current) return current;
            const nextExamples = current.examples.filter((_, itemIndex) => itemIndex !== index);
            return { ...current, examples: nextExamples.length ? nextExamples : [''] };
        });
    };

    const saveCard = async () => {
        if (!draftCard?.front_word.trim()) return;

        try {
            setIsSaving(true);
            const imageUrl = draftCard.image_url
                ? await DataService.uploadCardMedia(draftCard.image_url, deckId, 'image')
                : null;
            const audioUrl =
                draftCard.audio_source === 'recorded' && draftCard.audio_url
                    ? await DataService.uploadCardMedia(draftCard.audio_url, deckId, 'audio')
                    : null;

            await addCard({
                deck_id: deckId,
                front_word: draftCard.front_word.trim(),
                definition: draftCard.definition.trim(),
                spanish_meaning: draftCard.spanish_meaning.trim(),
                phonetic: draftCard.phonetic.trim() || null,
                examples: draftCard.examples.map((example) => example.trim()).filter(Boolean),
                image_url: imageUrl,
                audio_url: audioUrl,
                audio_source: audioUrl ? 'recorded' : 'tts',
                status: 'new',
                next_review_at: null,
                interval: 0,
                ease_factor: 2.5,
            });
            return true;
        } catch (error) {
            console.error('Failed to save card:', error);
            Alert.alert('Error', 'Failed to save card.');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        magicWord,
        setMagicWord,
        creationStep,
        setCreationStep,
        isGenerating,
        isSaving,
        draftCard,
        setDraftCard,
        updateDraftField,
        updateExample,
        addExample,
        removeExample,
        generateCard,
        saveCard,
        resetCreation,
    };
}
