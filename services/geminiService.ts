import { GoogleGenAI, Type } from "@google/genai";
import { FactResult, Language, ExamInfoResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const langInstruction = language === 'hi' ? 'Hindi' : 'English';
    const prompt = `In ${langInstruction}, for the topic "${topic}", provide two things: 1. A list of at least 5 interesting facts. 2. A list of 3-5 related topics.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: factGenerationSchema,
      },
    });

    const jsonText = response.text.trim();
    // It is possible Gemini returns markdown ```json ... ``` wrapper
    const sanitizedJson = jsonText.startsWith('```json') 
      ? jsonText.substring(7, jsonText.length - 3).trim()
      : jsonText;
      
    const result = JSON.parse(sanitizedJson);
    return result as FactResult;
  } catch (error) {
    console.error("Error generating facts:", error);
    throw new Error("Failed to generate facts from AI. Please try again.");
  }
};

export const summarizeText = async (text: string, language: Language): Promise<string> => {
  if (!text.trim()) {
    throw new Error("Cannot summarize empty text.");
  }
  try {
    const langInstruction = language === 'hi' ? 'Hindi' : 'English';
    const prompt = `Summarize the following text in a clear, concise, and easy-to-understand way in ${langInstruction}. Focus on the key points and main ideas. Text: """${text}"""`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to summarize text. The file might be too large or in an unsupported format.");
  }
};

export const getFactOfTheDay = async (language: Language): Promise<string> => {
  try {
    const langInstruction = language === 'hi' ? 'Hindi' : 'English';
    const prompt = `Provide one interesting and surprising science or technology fact of the day, in ${langInstruction}. The fact should be concise, easy to understand, and engaging.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting fact of the day:", error);
    return "Could not fetch the fact of the day. Please check your connection and try again.";
  }
};

export const generateCurrentAffairs = async (language: Language): Promise<string[]> => {
  try {
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
    console.error("Error generating current affairs:", error);
    throw new Error("Failed to generate current affairs from AI. Please try again.");
  }
};

export const generateExamInfo = async (examName: string, language: Language): Promise<ExamInfoResult> => {
    try {
        const langInstruction = language === 'hi' ? 'Hindi' : 'English';
        const prompt = `Provide a detailed breakdown for the exam named "${examName}" in ${langInstruction}. Give me the description, application start and end dates (mention if they are tentative or past), the full exam pattern, and a detailed syllabus.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: examInfoSchema,
            },
        });

        const jsonText = response.text.trim();
        const sanitizedJson = jsonText.startsWith('```json')
            ? jsonText.substring(7, jsonText.length - 3).trim()
            : jsonText;

        return JSON.parse(sanitizedJson) as ExamInfoResult;
    } catch (error) {
        console.error("Error generating exam info:", error);
        throw new Error("Failed to generate exam information from AI. Please check the exam name and try again.");
    }
};