export type ClaudeMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export interface ChatGPTImageContent {
    type: 'image_url';
    image_url: {
        url: string;
    };
}

export interface ClaudeImageContent {
    type: 'image';
    source: {
        type: 'base64';
        media_type: ClaudeMediaType;
        data: string;
    };
}

export interface AIServiceResponse {
    chatgpt: string | null;
    gemini: string | null;
    claude: string | null;
    errors: Record<string, string>;
} 