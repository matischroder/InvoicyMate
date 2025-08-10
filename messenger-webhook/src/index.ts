import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { Invoice, User } from "../types";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Initialize Telegram Bot
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || "", {
  polling: true,
});

// Basic route
app.get("/", (_req: Request, res: Response) => {
  res.send("Webhook server is running.");
});

// Telegram bot event handlers
telegramBot.on("message", async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (text.toLowerCase().includes("invoice")) {
    await handleInvoiceRequest(chatId, text);
  } else {
    telegramBot.sendMessage(
      chatId,
      'Welcome! You can create an invoice by sending me a message like "Create invoice for $100"'
    );
  }
});

// Invoice handling function
async function handleInvoiceRequest(
  chatId: number,
  text: string
): Promise<void> {
  try {
    // TODO: Implement invoice creation logic
    await telegramBot.sendMessage(
      chatId,
      "Creating your invoice... (Implementation pending)"
    );
  } catch (error) {
    console.error("Error handling invoice request:", error);
    await telegramBot.sendMessage(
      chatId,
      "Sorry, there was an error processing your request."
    );
  }
}

// Facebook Messenger webhook (kept for future use)
app.post("/webhook", (req: Request, res: Response) => {
  // TODO: Implement Facebook Messenger webhook handling
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
