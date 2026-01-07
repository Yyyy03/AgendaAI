import { GoogleGenAI, Type, Schema, Part } from "@google/genai";
import { AnalysisResult, AgendaItem, Stakeholder } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview for fast analysis of documents as per guidelines for basic text tasks
const ANALYSIS_MODEL = "gemini-3-flash-preview"; 
// Using gemini-3-pro-preview for high-quality chat reasoning as requested
const CHAT_MODEL = "gemini-3-pro-preview";

export const generateAgendaFromDoc = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const agendaSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Proposed title for the meeting" },
        summary: { type: Type.STRING, description: "Brief summary of the meeting goals" },
        date: { type: Type.STRING, description: "Suggested date or relative time (e.g. 'Next Monday')" },
        stakeholders: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              relevance: { type: Type.STRING, description: "Why they should be there" },
            }
          }
        },
        agenda: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING },
              durationMinutes: { type: Type.INTEGER, description: "Estimated time in minutes" },
              description: { type: Type.STRING, description: "Details about this agenda item" },
              speaker: { type: Type.STRING, description: "Suggested speaker for this item" },
            }
          }
        }
      },
      required: ["title", "summary", "stakeholders", "agenda"]
    };

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this document and generate a structured meeting agenda. 
            Identify key stakeholders who should attend, the topics to cover, and estimate the time to spend on each topic.
            Create a logical flow for the meeting.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: agendaSchema,
        temperature: 0.3,
      }
    });

    if (!response.text) {
      throw new Error("No response generated");
    }

    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Error generating agenda:", error);
    throw error;
  }
};

export const createChatSession = (base64Data: string, mimeType: string, analysisContext?: AnalysisResult) => {
    // We pass the document context in the system instruction or first message
    const systemPrompt = `You are a helpful AI meeting assistant. 
    The user has uploaded a document which has been analyzed into a meeting agenda.
    
    Meeting Context:
    Title: ${analysisContext?.title || 'Unknown'}
    Summary: ${analysisContext?.summary || 'N/A'}
    
    Answer questions based on the uploaded document content and the generated agenda.
    Be concise, professional, and helpful.`;

    // Initialize chat
    const chat = ai.chats.create({
        model: CHAT_MODEL,
        config: {
            systemInstruction: systemPrompt,
        }
    });

    return {
        sendMessage: async (message: string, isFirstMessage: boolean = false) => {
             // For the very first message interaction (or a setup step), we need to make sure the model 'sees' the file.
             // We can send the file in the first user message.
             const parts: Part[] = [{ text: message }];
             
             if (isFirstMessage) {
                 parts.unshift({
                     inlineData: {
                         mimeType: mimeType,
                         data: base64Data
                     }
                 });
             }

             const result = await chat.sendMessage({
                 message: { parts }
             });
             
             return result.text;
        }
    };
};