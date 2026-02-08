export interface ChallengeResult {
    score: number;
    feedback: string;
    improved_phrase?: string;
}

const CHALLENGE_API_URL = `${process.env.EXPO_PUBLIC_FLASHCARD_API_URL}/api/challenge`;

export const ChallengeService = {
    async evaluateSentence(word: string, phrase: string): Promise<ChallengeResult> {
        if (!word || !phrase) throw new Error('Word and phrase are required');

        try {
            const response = await fetch(CHALLENGE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word, phrase }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
            }

            const data = await response.json();

            return {
                score: typeof data.score === 'number' ? data.score : 0,
                feedback: data.feedback || "No feedback provided",
                improved_phrase: data.improved_phrase
            };

        } catch (error) {
            console.error('Challenge evaluation failed', error);
            throw error;
        }
    }
};
