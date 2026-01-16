
export interface MagicCardResult {
  definition: string;
  spanish_meaning: string;
  phonetic: string;
  examples: string[];
}

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const MagicGenerator = {
  async generateCard(word: string): Promise<MagicCardResult> {
    if (!word) throw new Error('Word is required');

    // MOCK MODE if no key provided
    if (!OPENAI_API_KEY) {
      console.log('MagicGenerator: No API Key, returning mock data.');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network
      return {
        definition: `Occurrence and development of events by chance in a happy or beneficial way.`,
        spanish_meaning: `Serendipia (Hallazgo afortunado)`,
        phonetic: `/ˌser.ənˈdɪp.ə.ti/`,
        examples: [
          `It was pure serendipity that we met at the coffee shop right before the rain started.`,
          `Many scientific discoveries are a result of serendipity rather than planning.`,
          `Finding this rare book was a moment of happy serendipity for the collector.`
        ]
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Use a better model for translations if possible
          messages: [
            {
              role: "system",
              content: "You are a language learning assistant. Return only strict JSON."
            },
            {
              role: "user",
              content: `For the word or phrase "${word}", generate:
              1. "definition": A short English description (Concept).
              2. "spanish_meaning": The Spanish translation (Meaning).
              3. "phonetic": The IPA pronunciation.
              4. "examples": A list of 3 natural usage examples in English.
              Return as JSON object.`
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) throw new Error('No content from AI');
      
      try {
        const result = JSON.parse(content);
        return {
           definition: result.definition || "No definition found",
           spanish_meaning: result.spanish_meaning || "",
           phonetic: result.phonetic || "",
           examples: Array.isArray(result.examples) ? result.examples : [result.example].filter(Boolean)
        };
      } catch (e) {
         console.error("Failed to parse AI response", content);
         throw new Error("Invalid response format");
      }

    } catch (error) {
      console.error('Magic generation failed', error);
      throw error;
    }
  }
};
