import { GoogleGenAI, Type } from "@google/genai";
import { FactResult, Language, ExamInfoResult } from '../types';

/**
 * Extracts a JSON string from text that might be wrapped in markdown code fences.
 * @param text The string to process.
 * @returns The extracted JSON string, or the original text if no fences are found.
 */
function extractJsonFromMarkdown(text: string): string {
    const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    return text.trim();
}

/**
 * Handles errors from the Gemini API and returns a user-friendly message.
 * @param error The error object.
 * @param context A string describing the operation that failed.
 * @returns An instance of Error with a user-friendly message.
 */
function handleAiError(error: any, context: string): Error {
    console.error(`Error ${context}:`, error);

    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        
        // Specific API key issues
        if (lowerCaseMessage.includes('api key not valid') || lowerCaseMessage.includes('api_key')) {
            return new Error("API Key is invalid or missing. Please check your configuration.");
        }
        
        // Content blocking issues from Gemini
        if (lowerCaseMessage.includes('blocked') && lowerCaseMessage.includes('safety')) {
            return new Error(`Your request for ${context} was blocked due to safety settings. Please try a different topic or wording.`);
        }
        if (lowerCaseMessage.includes('recitation')) {
             return new Error(`Your request for ${context} was blocked to prevent recitation of copyrighted material. Please try a different topic.`);
        }

        // Network/Server issues
        if (lowerCaseMessage.includes('400')) {
            return new Error(`The request for ${context} was invalid. Please check your input.`);
        }
        if (lowerCaseMessage.includes('500') || lowerCaseMessage.includes('503')) {
            return new Error(`The AI service is temporarily unavailable. Please try again later.`);
        }
        
        // Response parsing issues
        if (error instanceof SyntaxError) {
             return new Error(`The AI returned an invalid response format for ${context}. Please try again.`);
        }
    }
    
    // Generic fallback for other errors (e.g., network issues)
    return new Error(`Failed to complete ${context}. Please check your connection and try again.`);
}


const factGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    facts: {
      type: Type.ARRAY,
      description: "An array of at least 5 interesting and verifiable facts about the topic.",
      items: { type: Type.STRING }
    },
    related_topics: {
      type: Type.ARRAY,
      description: "An array of 3 to 5 related topics for further exploration.",
      items: { type: Type.STRING }
    }
  },
  required: ['facts', 'related_topics']
};

const examInfoSchema = {
    type: Type.OBJECT,
    properties: {
        description: { 
            type: Type.STRING,
            description: "A brief, informative description of the exam."
        },
        apply_start_date: { 
            type: Type.STRING,
            description: "The start date for applications. State if it's tentative or past."
        },
        apply_end_date: { 
            type: Type.STRING,
            description: "The end date for applications. State if it's tentative or past."
        },
        exam_pattern: { 
            type: Type.STRING,
            description: "A detailed breakdown of the exam pattern, including stages, subjects, marks, and duration. Use newlines for formatting."
        },
        syllabus: { 
            type: Type.STRING,
            description: "A comprehensive overview of the syllabus for all subjects/stages. Use newlines for formatting."
        },
    },
    required: ['description', 'apply_start_date', 'apply_end_date', 'exam_pattern', 'syllabus']
};

export const generateFactsForTopic = async (topic: string, language: Language): Promise<FactResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langInstruction = language === 'hi' ? 'Hindi' : 'English';
    const prompt = `In ${langInstruction}, for the topic "${topic}", provide a JSON object with two keys: "facts" (an array of at least 5 interesting facts) and "related_topics" (an array of 3-5 related topics).`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: factGenerationSchema,
      },
    });

    const sanitizedJson = extractJsonFromMarkdown(response.text);
    const result = JSON.parse(sanitizedJson);
    return result as FactResult;
  } catch (error) {
    throw handleAiError(error, "generating facts");
  }
};

export const summarizeText = async (text: string, language: Language): Promise<string> => {
  if (!text.trim()) {
    throw new Error("Cannot summarize empty text.");
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langInstruction = language === 'hi' ? 'Hindi' : 'English';
    const prompt = `Summarize the following text in a clear, concise, and easy-to-understand way in ${langInstruction}. Focus on the key points and main ideas. Text: """${text}"""`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    throw handleAiError(error, "summarizing text");
  }
};

export const getFactOfTheDay = async (language: Language): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langInstruction = language === 'hi' ? 'Hindi' : 'English';
    const prompt = `Provide one interesting and surprising science or technology fact of the day, in ${langInstruction}. The fact should be concise, easy to understand, and engaging.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    throw handleAiError(error, "getting fact of the day");
  }
};

export const generateCurrentAffairs = async (language: Language): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langInstruction = language === 'hi' ? 'Hindi' : 'English';
    const prompt = `Generate a list of 5 to 7 of the most important and recent current affairs and general knowledge points for today. Present them as a list of bullet points. The topics should be relevant for competitive exams in India and general global awareness. The response must be in ${langInstruction}.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = response.text;
    const facts = text.split('\n').map(fact => fact.replace(/^[*-]\s*/, '')).filter(fact => fact.trim() !== '');
    return facts;
  } catch (error) {
    throw handleAiError(error, "generating current affairs");
  }
};

export const generateExamInfo = async (examName: string, language: Language): Promise<ExamInfoResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const langInstruction = language === 'hi' ? 'Hindi' : 'English';
        const prompt = `Provide a detailed breakdown for the exam named "${examName}" in ${langInstruction}. Respond with a JSON object containing: "description", "apply_start_date", "apply_end_date", "exam_pattern", and "syllabus". For dates, mention if they are tentative or past.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: examInfoSchema,
            },
        });

        const sanitizedJson = extractJsonFromMarkdown(response.text);
        return JSON.parse(sanitizedJson) as ExamInfoResult;
    } catch (error) {
        throw handleAiError(error, "generating exam information");
    }
};