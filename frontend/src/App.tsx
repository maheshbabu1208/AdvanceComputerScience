import { useState } from 'react';
import { Header } from './components/Header';
import { ChatForm } from './components/ChatForm';
import { ResponseColumn } from './components/ResponseColumn';
import { AIResponse } from './types';
import { sendChatRequest } from './services/api';
import { isAxiosError } from 'axios';

type AIResponseExtended = AIResponse & { error?: string };

export default function App() {
    const [responses, setResponses] = useState<AIResponseExtended[]>([
        { model: 'ChatGPT', response: '', loading: false },
        { model: 'Gemini', response: '', loading: false },
        { model: 'Claude', response: '', loading: false },
    ]);

    const handleSubmit = async (prompt: string, image: File | null) => {
        setResponses(prev => prev.map(r => ({ ...r, loading: true, error: undefined })));

        try {
            const apiResponses = await sendChatRequest(prompt, image);
            setResponses(apiResponses.map(r => ({
                model: r.model,
                response: r.response,
                error: r.error,
                loading: false
            })));
        } catch (error) {
            if (isAxiosError(error)) {
                setResponses(prev => prev.map(r => ({
                    ...r,
                    loading: false,
                    error: error.message || 'An error occurred',
                })));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Header />
            <main className="max-w-9xl mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto mb-8">
                    <ChatForm onSubmit={handleSubmit} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {responses.map((response, index) => (
                        <ResponseColumn 
                            key={`${response.model}-${index}`} 
                            data={response} 
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}