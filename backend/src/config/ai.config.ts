import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

dotenv.config();

const client = new SecretManagerServiceClient();

// Dynamic project ID support
async function getSecret(secretName: string): Promise<string> {
    try {
        const projectId = process.env.GCP_PROJECT_ID || await client.getProjectId();
        const [version] = await client.accessSecretVersion({
            name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
        });
        const payload = version.payload?.data?.toString().trim();
        if (!payload) {
            throw new Error(`Secret ${secretName} has empty payload`);
        }
        console.log(`🔐 Fetched secret: ${secretName}`);
        return payload;
    } catch (error) {
        console.error(`❌ Failed to access secret "${secretName}":`, error);
        throw new Error(`Failed to access secret: ${secretName}`);
    }
}

// Old logic using local .env (commented out)
/*
const openaiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
*/

let openai: OpenAI;
let genAI: GoogleGenerativeAI;
let anthropic: Anthropic;

export async function initializeAIClients() {
    console.log("🔄 Initializing AI clients from GCP Secret Manager...");

    try {
        const [openaiKey, geminiKey, anthropicKey] = await Promise.all([
            getSecret('openai-api-key'),
            getSecret('google-api-key'),
            getSecret('anthropic-api-key')
        ]);

        openai = new OpenAI({ apiKey: openaiKey });
        console.log("✅ OpenAI client initialized");

        genAI = new GoogleGenerativeAI(geminiKey);
        console.log("✅ Gemini client initialized");

        anthropic = new Anthropic({ apiKey: anthropicKey });
        console.log("✅ Anthropic client initialized");

        console.log("🎉 All AI clients initialized successfully.");
    } catch (error) {
        console.error("❌ Failed to initialize AI clients:", error);
        throw error;
    }
}

export { openai, genAI, anthropic };
