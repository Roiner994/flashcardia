
export interface MagicCardResult {
  definition: string;
  spanish_meaning: string;
  phonetic: string;
  examples: string[];
}

const CUSTOM_API_URL = 'https://flashcard-api-three.vercel.app/api/generate';

export const MagicGenerator = {
  async generateCard(word: string): Promise<MagicCardResult> {
    if (!word) throw new Error('Word is required');

    try {
      console.log(`Generating card for "${word}" using custom API...`);

      const response = await fetch(CUSTOM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      
      console.log('Custom API Response:', JSON.stringify(data, null, 2));

      // Map the custom API response to our app's MagicCardResult interface
      return {
        definition: data.definition || "No definition found",
        spanish_meaning: data.spanish_meaning || "",
        phonetic: data.phonetic || "",
        examples: Array.isArray(data.examples) ? data.examples : []
      };

    } catch (error) {
      console.error('Magic generation failed', error);
      throw error;
    }
  }
};
