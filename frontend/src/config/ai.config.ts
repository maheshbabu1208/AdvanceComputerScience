import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// Get environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// Validate required API keys
if (!OPENAI_API_KEY || !GEMINI_API_KEY || !ANTHROPIC_API_KEY) {
    throw new Error('Missing required API keys in environment variables. Please check your .env file.');
}

// Initialize AI clients
export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
export const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Export configuration
export const config = {
    openaiKey: OPENAI_API_KEY,
    geminiKey: GEMINI_API_KEY,
    anthropicKey: ANTHROPIC_API_KEY
} as const; 