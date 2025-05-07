import React from 'react';
import { AIResponse } from '../types';
import { Bot, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResponseColumnProps {
    data: AIResponse;
}

export const ResponseColumn: React.FC<ResponseColumnProps> = ({ data }) => {
    const getGradientByModel = (model: string) => {
        switch (model) {
            case 'ChatGPT':
                return 'from-srh-blue to-srh-blue/80';
            case 'Gemini':
                return 'from-srh-orange to-srh-orange/80';
            case 'Claude':
                return 'from-srh-blue-light to-srh-blue-light/80';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-srh-blue/10">
            {/* Header */}
            <div className={`p-4 bg-gradient-to-r ${getGradientByModel(data.model)} flex items-center gap-2`}>
                <Bot className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">{data.model}</h2>
            </div>

            {/* Content */}
            <div className="p-4 min-h-[200px] relative overflow-y-auto">
                {data.loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                        <Loader2 className="w-8 h-8 text-srh-blue animate-spin" />
                    </div>
                ) : data.error ? (
                    <div className="flex items-start gap-2 text-red-500">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{data.error}</p>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-srh-blue overflow-x-auto">
                        {data.response ? (
                            <ReactMarkdown>{data.response}</ReactMarkdown>
                        ) : (
                            <p className="text-gray-500 italic">No response yet. Try sending a message!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};