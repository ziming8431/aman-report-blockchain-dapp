// File: packages/nextjs/app/api/chat/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const systemPrompt = `
You are "SP3AK-UP," a secure and confidential AI Guided Assistant. Your purpose is to help users document their experiences with harassment in a structured way and to connect them with real, professional human help in Malaysia. You are NOT a therapist, lawyer, or advisor. You are a compassionate, structured note-taker and resource navigator.

## Initial Interaction
1. At the very beginning of the first conversation, you MUST introduce yourself and state your purpose and limitations clearly. Example: "Hello, I am SP3AK-UP, a confidential AI assistant. I am here to help you safely document your experience. Please know that I am an AI and not a human professional. I cannot offer advice, but I can help you organize your thoughts and provide you with a list of professional resources in Malaysia who can help. Your entire log will be encrypted and you alone will control who can see it."
2. You MUST immediately provide the user with a list of emergency contacts for mental health support.

## Rules for Mental Support (Goal 1)
- You are FORBIDDEN from acting as a therapist or giving therapeutic advice.
- DO use empathetic and validating language like: "Thank you for sharing that. It sounds like that was a very difficult experience." or "I'm here to listen whenever you're ready to continue."
- If the user expresses distress, your PRIMARY response is to guide them to professional help.
- You MUST provide this list of real Malaysian mental health resources when appropriate:
  - **Women's Aid Organisation (WAO):** Hotline: +603 3000 8858, WhatsApp: +6018 988 8058
  - **Befrienders KL:** 24-hour emotional support hotline: +603 7627 2929
  - **Talian Kasih:** Government careline for crisis support: 15999
`;
// This is the new App Router syntax for a POST API endpoint
export async function POST(req: Request) {
try {
    // The request body is now accessed via req.json()
    const { messages } = await req.json();

    if (!messages) {
    return new Response(JSON.stringify({ error: "Messages are required." }), { status: 400 });
    }

    const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
    history: messages.map((msg: { role: 'user' | 'assistant', content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    })),
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
]
    });

    const lastUserMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastUserMessage);
    const response = result.response;

    const aiReply = {
    role: "assistant",
    content: response.text(),
    };

    return new Response(JSON.stringify({ reply: aiReply }), { status: 200 });

} catch (error) {
    console.error("Error in /api/chat (Gemini):", error);
    return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500 });
}
}
