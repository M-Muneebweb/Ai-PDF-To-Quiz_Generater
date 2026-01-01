import { QuizQuestion, QuizSettings } from '../types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/auth/key`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const fetchModels = async (apiKey: string): Promise<string[]> => {
    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        return data.data.map((m: any) => m.id);
    } catch (e) {
        console.warn('Could not fetch model list, using defaults');
        return [];
    }
};

export const generateQuiz = async (
  apiKey: string,
  modelId: string,
  pdfText: string,
  settings: QuizSettings
): Promise<QuizQuestion[]> => {
  
  // Truncate text if it's too long (approx 15k chars to be safe for most models context)
  const truncatedText = pdfText.slice(0, 15000);

  const prompt = `
    You are a professional quiz generator.
    Generate a quiz based on the following text content.
    
    Configuration:
    - Difficulty: ${settings.difficulty}
    - Number of questions: ${settings.questionCount}
    - The output MUST be a valid JSON array.
    - No markdown formatting (like \`\`\`json), just the raw JSON array string.
    
    JSON Schema per question:
    {
      "id": number (sequence starting from 1),
      "text": "The question string",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": number (0-3),
      "timeLimitSeconds": number (suggested time between 10-60 seconds based on difficulty)
    }

    Content Source:
    ${truncatedText}
  `;

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin, // Dynamic origin
        'X-Title': 'PDF Quiz Generator'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates quizzes in strict JSON format.' },
          { role: 'user', content: prompt }
        ],
        // Note: Not all OpenRouter models support response_format. 
        // We omit it to be safe across generic models and rely on the system prompt.
        // response_format: { type: 'json_object' } 
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.statusText}`);
    }

    // Fix for "Cannot read properties of undefined (reading '0')"
    if (!data.choices || data.choices.length === 0) {
        console.error('Unexpected API Response:', data);
        throw new Error('The AI model returned an empty response. Please try a different model or reduce the PDF size.');
    }

    const content = data.choices[0].message?.content;
    
    if (!content) {
        throw new Error('The AI model returned an empty message content.');
    }

    // Clean up potential markdown blocks if the model ignores instruction
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsed;
    try {
        parsed = JSON.parse(cleanContent);
        // Handle case where model returns { "questions": [...] } instead of array
        if (!Array.isArray(parsed) && parsed.questions && Array.isArray(parsed.questions)) {
            parsed = parsed.questions;
        } else if (!Array.isArray(parsed) && parsed.quiz && Array.isArray(parsed.quiz)) {
            parsed = parsed.quiz;
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Content:", cleanContent);
        throw new Error("Failed to parse AI response as JSON. The model might be outputting invalid format.");
    }

    if (!Array.isArray(parsed)) {
        throw new Error("AI did not return an array of questions. Try a different model.");
    }

    // Validate structure of first item
    if (parsed.length > 0 && (!parsed[0].options || typeof parsed[0].correctAnswerIndex !== 'number')) {
         throw new Error("The generated quiz data is missing required fields (options or correct answer).");
    }

    return parsed as QuizQuestion[];

  } catch (error: any) {
    console.error('Quiz Generation Error:', error);
    throw new Error(error.message || 'Unknown error generating quiz');
  }
};