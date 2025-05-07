import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import { initializeAIClients } from './config/ai.config';

dotenv.config();

const app: Application = express();

// CORS setup: allow both Firebase and local dev frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://directed-radius-456412-b0.web.app'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', chatRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("🔄 Initializing AI clients...");
    await initializeAIClients();
    console.log("✅ AI clients initialized. Starting server...");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize AI clients:", error);
    process.exit(1);
  }
}

startServer();
