import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';
import fs from 'fs';
import { Readable } from 'stream';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: 'uploads/' });

// Initialize AI clients with error safety
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const streamToString = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('base64');
};

app.post('/api/chat', upload.single('mediaFile'), async (req, res) => {
  const { prompt } = req.body;
  const mediaFile = req.file;

  let chatGPTImageContent = null;
  let geminiParts = [];
  let claudeImageContent = null;

  try {
    if (!prompt && !mediaFile) {
      return res.status(400).json({ error: 'Missing prompt or media file' });
    }

    // Prepare Gemini model
    const geminiModel = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

    if (mediaFile) {
      const base64Image = fs.readFileSync(mediaFile.path, { encoding: 'base64' });

      // ChatGPT vision format
      chatGPTImageContent = [
        { type: 'image_url', image_url: { url: `data:${mediaFile.mimetype};base64,${base64Image}` } }
      ];

      // Gemini format
      geminiParts = [
        { text: prompt },
        {
          inlineData: {
            mimeType: mediaFile.mimetype,
            data: base64Image
          }
        }
      ];

      // Claude format
      const base64ClaudeImage = await streamToString(Readable.from(fs.readFileSync(mediaFile.path)));
      claudeImageContent = {
        source: {
          type: 'base64',
          media_type: mediaFile.mimetype,
          data: base64ClaudeImage
        }
      };

      fs.unlinkSync(mediaFile.path); // cleanup
    } else {
      // No image: just use text
      geminiParts = [{ text: prompt }];
    }

    const [chatGPTResponse, geminiResponse /*, claudeResponse*/] = await Promise.all([
      openai?.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              ...(prompt ? [{ type: 'text', text: prompt }] : []),
              ...(chatGPTImageContent ?? [])
            ]
          }
        ]
      }),
      geminiModel?.generateContent(geminiParts)
      // Claude (if re-enabled)
    ]);

    res.json({
      chatgpt: chatGPTResponse?.choices?.[0]?.message?.content || null,
      gemini: geminiResponse?.text() || null,
      // claude: claudeResponse?.content?.[0]?.text || null
    });
  } catch (error) {
    console.error('❌ Error handling /api/chat:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
