interface Config {
    openaiKey: string;
    geminiKey: string;
    anthropicKey: string;
}

export const config: Config = {
    openaiKey: process.env.OPENAI_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    anthropicKey: process.env.ANTHROPIC_API_KEY || ''
};