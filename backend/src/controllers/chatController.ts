import { Request, Response } from 'express';
import { openai, genAI, anthropic } from '../config/ai.config';
import { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import fs from 'fs';
import multer from 'multer';
// import sharp from 'sharp';

interface ChatRequest extends Request {
    file?: Express.Multer.File;
}

type ClaudeMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const isValidClaudeMediaType = (mediaType: string): mediaType is ClaudeMediaType => {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mediaType);
};

const storage = multer.diskStorage({
    destination: function(_req, _file, cb) {
        cb(null,'/tmp/');
    },
    filename: function(_req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

// async function resizeImage(imagePath: string): Promise<Buffer> {
//     return await sharp(imagePath)
//         .resize({ width: 512 })  // Resize width to 80px while keeping aspect ratio
//         .jpeg({ quality: 80 })   // Convert to JPEG with 80% quality
//         .toBuffer();
// }

export const upload = multer({ storage: storage });

export const handleChat = async (req: ChatRequest, res: Response): Promise<void> => {
    const { prompt } = req.body;
    const mediaFile = req.file;
    const errors: Record<string, string> = {};
    let chatgptResponse = '';
    let geminiResponse = '';
    let claudeResponse = '';

    try {
        // Process requests in parallel
        await Promise.all([
            // ChatGPT
            (async () => {
                try {
                    const messages: ChatCompletionMessageParam[] = [];
                    
                    if (mediaFile) {
                        const imageData = fs.readFileSync(mediaFile.path, { encoding: 'base64' });
                        messages.push({
                            role: 'user',
                            content: [
                                { type: 'text', text: prompt },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:${mediaFile.mimetype};base64,${imageData}`
                                    }
                                }
                            ] as ChatCompletionContentPart[]
                        });
                    } else {
                        messages.push({ role: 'user', content: prompt });
                    }

                    const completion = await openai.chat.completions.create({
                        model: mediaFile ? 'gpt-4o' : 'gpt-4o',
                        messages,
                        max_tokens: 4096
                    });

                    chatgptResponse = completion.choices[0]?.message?.content || '';
                } catch (error) {
                    console.error('ChatGPT Error:', error);
                    errors.chatgpt = error instanceof Error ? error.message : 'Unknown error';
                }
            })(),

            // Gemini
            (async () => {
                try {
                    const model = genAI.getGenerativeModel({ model: mediaFile ? 'gemini-1.5-flash' : 'gemini-1.5-flash' });
                    
                    let result;
                    if (mediaFile) {
                        const imageData = fs.readFileSync(mediaFile.path, { encoding: 'base64' });
                        // const resizedImage = await resizeImage(mediaFile.path);
                        // const imageData = resizedImage.toString('base64');
                        result = await model.generateContent([prompt, {
                            inlineData: {
                                data: imageData,
                                mimeType: mediaFile.mimetype
                            }
                        }]);
                    } else {
                        result = await model.generateContent(prompt);
                    }

                    const response = await result.response;
                    geminiResponse = response.text();
                } catch (error) {
                    console.error('Gemini Error:', error);
                    errors.gemini = error instanceof Error ? error.message : 'Unknown error';
                }
            })(),

            // Claude
            (async () => {
                try {
                    const messages: MessageParam[] = [];
                    
                    if (mediaFile) {
                        if (!isValidClaudeMediaType(mediaFile.mimetype)) {
                            throw new Error('Invalid image format. Supported formats are: JPEG, PNG, GIF, and WebP');
                        }

                        const base64Image = fs.readFileSync(mediaFile.path, { encoding: 'base64' });
                        messages.push({
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: prompt
                                },
                                {
                                    type: 'image',
                                    source: {
                                        type: 'base64',
                                        media_type: mediaFile.mimetype as ClaudeMediaType,
                                        data: base64Image
                                    }
                                }
                            ]
                        });
                    } else {
                        messages.push({
                            role: 'user',
                            content: prompt
                        });
                    }

                    const response = await anthropic.messages.create({
                        model: 'claude-3-5-sonnet-20240620',
                        max_tokens: 4096,
                        messages
                    });

                    claudeResponse = response.content[0].text;
                } catch (error) {
                    console.error('Claude Error:', error);
                    errors.claude = error instanceof Error ? error.message : 'Unknown error';
                }
            })(),
        ]);

        // Clean up the uploaded file
        if (mediaFile) {
            const tempFilePath = `/tmp/${mediaFile.filename}`;
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }

        res.json({
            chatgpt: chatgptResponse,
            gemini: geminiResponse,
            claude: claudeResponse,
            errors: Object.keys(errors).length > 0 ? errors : undefined
        });
    } catch (error) {
        // Clean up the uploaded file in case of error
        if (mediaFile && fs.existsSync(mediaFile.path)) {
            fs.unlinkSync(mediaFile.path);
        }
        console.error('General Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 