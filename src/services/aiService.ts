import axios from 'axios';

const AI_API_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_API_KEY = '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';

export interface AIRecommendation {
  enhancedQuery: string;
  recommendations: string[];
  searchTerms: string[];
}

// Helper function to extract and parse JSON from markdown code blocks
const extractJsonFromResponse = (content: string): any => {
  // Remove markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1] : content;
  
  // Clean up the string and parse
  return JSON.parse(jsonString.trim());
};

export const getAIRecommendations = async (query: string): Promise<AIRecommendation> => {
  try {
    const response = await axios.post(
      AI_API_BASE_URL,
      {
        model: 'moonshotai/kimi-k2:free',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate and knowledgeable librarian assistant with deep understanding of literature and human emotions. Given a user's search query, you should:

1. ALWAYS provide meaningful book recommendations, especially for emotional or descriptive queries
2. If the user expresses feelings (sad, happy, confused, lost, etc.), recommend books that address those emotions or provide comfort
3. For vague or emotional queries, suggest specific book titles and authors that match the mood or situation
4. Enhance the search query to find relevant books in digital libraries
5. Provide alternative search terms for better results

IMPORTANT: Even if the query is vague like "feeling sad", "don't know what to read", "need inspiration", you MUST provide specific book recommendations with titles and authors.

For emotional queries, consider recommending:
- Self-help and personal development books
- Fiction that deals with similar emotions
- Inspirational memoirs and biographies
- Philosophy and wisdom literature
- Poetry collections
- Classic literature that explores human condition

Respond ONLY with valid JSON (no markdown code blocks) in this exact format:
{
  "enhancedQuery": "improved search query for digital libraries",
  "recommendations": ["Specific Book Title by Author Name", "Another Book Title by Author Name", "Third Book Title by Author Name"],
  "searchTerms": ["alternative search term 1", "alternative search term 2", "alternative search term 3"]
}`
          },
          {
            role: 'user',
            content: `I'm looking for books and I feel/want: "${query}". Please recommend specific books with titles and authors that would help with this situation or mood, and also provide search terms to find similar books in digital libraries.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (content) {
      try {
        // Use the helper function to handle both plain JSON and markdown-wrapped JSON
        return extractJsonFromResponse(content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.log('Raw response content:', content);
      }
    }
  } catch (error) {
    console.error('AI recommendation error:', error);
  }

  // Fallback response
  return {
    enhancedQuery: query,
    recommendations: [],
    searchTerms: [query]
  };
};