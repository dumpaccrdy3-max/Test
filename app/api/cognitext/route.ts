import { NextResponse } from "next/server";
import { getAiCompletion } from "../../../lib/ai";

type CogniTextMode = "generate" | "edit" | "summarize";

type CogniTextRequestBody = {
  mode: CogniTextMode;
  prompt?: string;
  selection?: string;
  instruction?: string;
  document?: string;
  contextBefore?: string;
  contextAfter?: string;
};

export async function POST(request: Request) {
  let body: CogniTextRequestBody;

  try {
    body = (await request.json()) as CogniTextRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!process.env.MEGALLM_API_KEY) {
    return NextResponse.json(
      { error: "MEGALLM_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const mode = body.mode;

  if (!mode) {
    return NextResponse.json(
      { error: "Missing 'mode' field in request body." },
      { status: 400 }
    );
  }

  const document =
    (body.document ?? "").toString().slice(0, 8000); // limit context length a bit
  const selection = (body.selection ?? "").toString();
  const instruction = (body.instruction ?? "").toString();
  const contextBefore = (body.contextBefore ?? "").toString();
  const contextAfter = (body.contextAfter ?? "").toString();

  let userContent: string;

  switch (mode) {
    case "generate": {
      const prompt = (body.prompt ?? "").toString();

      if (!prompt) {
        return NextResponse.json(
          { error: "Missing 'prompt' for generate mode." },
          { status: 400 }
        );
      }

      userContent = [
        "You are an AI writing assistant integrated into a collaborative editor called CogniText.",
        "Your job is to generate text that fits naturally into the document.",
        "",
        "Document context:",
        document || "(empty document)",
        "",
        "User prompt / task:",
        prompt,
        "",
        "Return only the text that should be inserted at the cursor, without any additional explanations or formatting."
      ].join("\n");
      break;
    }

    case "edit": {
      if (!selection) {
        return NextResponse.json(
          { error: "Missing 'selection' for edit mode." },
          { status: 400 }
        );
      }

      if (!instruction) {
        return NextResponse.json(
          { error: "Missing 'instruction' for edit mode." },
          { status: 400 }
        );
      }

      userContent = [
        "You are an AI editor inside a collaborative text editor called CogniText.",
        "The user selected part of a document and wants you to transform it.",
        "",
        "Context BEFORE selection:",
        contextBefore || "(no additional context before)",
        "",
        "Original selection:",
        selection,
        "",
        "Context AFTER selection:",
        contextAfter || "(no additional context after)",
        "",
        "User instruction for editing the selection:",
        instruction,
        "",
        "Return only the edited version of the selection.",
        "Do not include the original text, explanations, or markdown—only the improved text."
      ].join("\n");
      break;
    }

    case "summarize": {
      if (!document) {
        return NextResponse.json(
          { error: "Missing 'document' for summarize mode." },
          { status: 400 }
        );
      }

      userContent = [
        "You are an AI assistant summarizing a document for a writer using CogniText.",
        "",
        "Document content:",
        document,
        "",
        "Task:",
        "Buat ringkasan yang jelas dan padat dalam bahasa Indonesia.",
        "Gunakan 3-6 kalimat, fokus pada ide utama dan poin penting.",
        "Jangan menambahkan opini baru atau detail yang tidak ada di teks asal."
      ].join("\n");
      break;
    }

    default:
      return NextResponse.json(
        { error: `Unsupported mode: ${mode}` },
        { status: 400 }
      );
  }

  try {
    const text = await getAiCompletion(userContent);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("CogniText AI call failed:", error);
    return NextResponse.json(
      { error: "Failed to get AI response." },
      { status: 500 }
    );
  }
}