// import axios from 'axios';
// import { AIResponse } from '../types';

// Remove trailing slashes and ensure proper URL format
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

interface ChatResponse {
    model: string;
    response: string;
    error?: string;
}

export async function sendChatRequest(prompt: string, file?: File | null): Promise<ChatResponse[]> {
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        if (file) {
            formData.append('file', file);
        }

        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return [
            { model: 'ChatGPT', response: data.chatgpt || '', error: data.errors?.chatgpt },
            { model: 'Gemini', response: data.gemini || '', error: data.errors?.gemini },
            { model: 'Claude', response: data.claude || '', error: data.errors?.claude }
        ];
    } catch (error) {
        console.error('Error sending chat request:', error);
        throw error;
    }
} 