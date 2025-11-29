import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://ai.megallm.io/v1",
  apiKey: process.env.MEGALLM_API_KEY
});

export async function getAiCompletion(userContent: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "user",
        content: userContent
      }
    ]
  });

  const content = response.choices[0]?.message?.content ?? "";
  return content.trim();
}