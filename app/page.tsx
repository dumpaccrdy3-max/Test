"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";

type ContextMenuState = {
  visible: boolean;
  x: number;
  y: number;
  selectionText: string;
};

async function callCogniTextAPI(payload: unknown): Promise<string> {
  const response = await fetch("/api/cognitext", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      (data as { error?: string }).error ?? "Gagal memanggil layanan AI.";
    throw new Error(message);
  }

  const json = (await response.json()) as { text?: string };
  return (json.text ?? "").trim();
}

export default function CogniTextPage() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastRangeRef = useRef<Range | null>(null);
  const selectionRangeForEditRef = useRef<Range | null>(null);
  const docContentRef = useRef<string>("");

  const [docTitle, setDocTitle] = useState("Dokumen Tanpa Judul");
  const [summary, setSummary] = useState<string>("");
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    selectionText: ""
  });

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editInstruction, setEditInstruction] = useState("");

  const [isSummarizing, setIsSummarizing] = useState(false);

  const hideContextMenu = () =>
    setContextMenu(prev =>
      prev.visible ? { ...prev, visible: false } : prev
    );

  const updateDocContentRef = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const text = editor.innerText || "";
    docContentRef.current = text;

    const isEmpty = text.trim().length === 0;
    editor.setAttribute("data-empty", isEmpty ? "true" : "false");
  };

  const captureCurrentSelection = () => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    lastRangeRef.current = range.cloneRange();

    if (!selection.isCollapsed) {
      selectionRangeForEditRef.current = range.cloneRange();
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleInput = () => {
      updateDocContentRef();
    };

    const handleMouseUp = () => {
      captureCurrentSelection();
    };

    const handleKeyUp = () => {
      captureCurrentSelection();
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        contextMenu.visible &&
        target &&
        !target.closest(".cognitext-context-menu")
      ) {
        hideContextMenu();
      }
    };

    const handleEditorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const action = target.dataset.action;
      if (!action) return;

      const changeEl = target.closest("[data-change-id]") as HTMLElement | null;
      if (!changeEl) return;

      const delEl = changeEl.querySelector("del");
      const insEl = changeEl.querySelector("ins");

      if (action === "accept") {
        const newText = insEl?.textContent ?? "";
        const textNode = document.createTextNode(newText);
        changeEl.replaceWith(textNode);
      } else if (action === "reject") {
        const originalText = delEl?.textContent ?? "";
        const textNode = document.createTextNode(originalText);
        changeEl.replaceWith(textNode);
      }

      updateDocContentRef();
    };

    editor.addEventListener("input", handleInput);
    editor.addEventListener("mouseup", handleMouseUp);
    editor.addEventListener("keyup", handleKeyUp);
    editor.addEventListener("click", handleEditorClick);
    document.addEventListener("click", handleClickOutside);

    updateDocContentRef();

    return () => {
      editor.removeEventListener("input", handleInput);
      editor.removeEventListener("mouseup", handleMouseUp);
      editor.removeEventListener("keyup", handleKeyUp);
      editor.removeEventListener("click", handleEditorClick);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu.visible]);

  const getDocumentText = () => docContentRef.current;

  const getContextAroundSelection = (selectionText: string) => {
    const docText = getDocumentText();
    const trimmedSelection = selectionText.trim();
    if (!docText || !trimmedSelection) {
      return { before: "", after: "", selectionText: trimmedSelection };
    }

    const index = docText.indexOf(trimmedSelection);
    if (index === -1) {
      return {
        before: docText.slice(Math.max(0, docText.length - 1000)),
        after: "",
        selectionText: trimmedSelection
      };
    }

    const beforeStart = Math.max(0, index - 1000);
    const before = docText.slice(beforeStart, index);
    const after = docText.slice(
      index + trimmedSelection.length,
      index + trimmedSelection.length + 1000
    );

    return { before, after, selectionText: trimmedSelection };
  };

  const insertAtCurrentRange = (text: string) => {
    const editor = editorRef.current;
    if (!editor || !text) return;

    const selection = window.getSelection();
    let range: Range | null =
      selection && selection.rangeCount > 0
        ? selection.getRangeAt(0)
        : null;

    if (!range && lastRangeRef.current) {
      range = lastRangeRef.current;
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);

    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    lastRangeRef.current = range.cloneRange();
    updateDocContentRef();
  };

  const handleGenerateClick = () => {
    captureCurrentSelection();
    setGeneratePrompt("");
    setShowGenerateModal(true);
    hideContextMenu();
  };

  const handleEditClick = () => {
    const selectionText =
      selectionRangeForEditRef.current?.toString().trim() || "";
    if (!selectionText) {
      setStatus("Pilih teks terlebih dahulu untuk diedit oleh AI.");
      setTimeout(() => setStatus(null), 2500);
      return;
    }
    setEditInstruction("");
    setShowEditModal(true);
    hideContextMenu();
  };

  const handleSummarizeClick = async () => {
    const documentText = getDocumentText().trim();
    if (!documentText) {
      setStatus("Dokumen masih kosong, tulis sesuatu terlebih dahulu.");
      setTimeout(() => setStatus(null), 2500);
      return;
    }

    try {
      setIsSummarizing(true);
      setStatus("Meringkas dokumen dengan AI...");
      const text = await callCogniTextAPI({
        mode: "summarize",
        document: documentText
      });
      setSummary(text);
      setStatus(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal meringkas dokumen.";
      setStatus(message);
      setTimeout(() => setStatus(null), 3500);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateSubmit = async () => {
    if (!generatePrompt.trim()) {
      setStatus("Masukkan prompt singkat untuk generate teks.");
      setTimeout(() => setStatus(null), 2500);
      return;
    }

    try {
      setIsBusy(true);
      setStatus("Menghasilkan teks dengan AI...");
      const documentText = getDocumentText();

      const aiText = await callCogniTextAPI({
        mode: "generate",
        prompt: generatePrompt.trim(),
        document: documentText
      });

      insertAtCurrentRange(aiText);
      setShowGenerateModal(false);
      setGeneratePrompt("");
      setStatus(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal generate teks.";
      setStatus(message);
      setTimeout(() => setStatus(null), 3500);
    } finally {
      setIsBusy(false);
    }
  };

  const applyInlineEditSuggestion = (original: string, edited: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const range = selectionRangeForEditRef.current;
    if (!range) {
      insertAtCurrentRange(edited);
      return;
    }

    range.deleteContents();

    const wrapper = document.createElement("span");
    const changeId = `change-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
    wrapper.className = "ai-change";
    wrapper.setAttribute("data-change-id", changeId);

    const delEl = document.createElement("del");
    delEl.textContent = original;

    const insEl = document.createElement("ins");
    insEl.textContent = edited;

    const actionsContainer = document.createElement("span");
    actionsContainer.className = "ai-change-actions";

    const acceptBtn = document.createElement("button");
    acceptBtn.textContent = "Accept";
    acceptBtn.setAttribute("type", "button");
    acceptBtn.dataset.action = "accept";

    const rejectBtn = document.createElement("button");
    rejectBtn.textContent = "Reject";
    rejectBtn.setAttribute("type", "button");
    rejectBtn.dataset.action = "reject";

    actionsContainer.appendChild(acceptBtn);
    actionsContainer.appendChild(rejectBtn);

    wrapper.appendChild(delEl);
    wrapper.appendChild(insEl);
    wrapper.appendChild(actionsContainer);

    range.insertNode(wrapper);

    if (typeof window !== "undefined") {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const afterRange = document.createRange();
        afterRange.setStartAfter(wrapper);
        afterRange.setEndAfter(wrapper);
        selection.addRange(afterRange);
        lastRangeRef.current = afterRange.cloneRange();
      }
    }

    updateDocContentRef();
  };

  const handleEditSubmit = async () => {
    const selectionText =
      selectionRangeForEditRef.current?.toString().trim() || "";
    if (!selectionText) {
      setStatus("Pilih teks terlebih dahulu untuk diedit oleh AI.");
      setTimeout(() => setStatus(null), 2500);
      return;
    }

    if (!editInstruction.trim()) {
      setStatus("Tambahkan instruksi edit (misalnya: buat lebih ringkas).");
      setTimeout(() => setStatus(null), 2500);
      return;
    }

    const documentText = getDocumentText();
    const { before, after, selectionText: cleanSelection } =
      getContextAroundSelection(selectionText);

    try {
      setIsBusy(true);
      setStatus("Mengedit pilihan dengan AI...");
      const editedText = await callCogniTextAPI({
        mode: "edit",
        selection: cleanSelection,
        instruction: editInstruction.trim(),
        document: documentText,
        contextBefore: before,
        contextAfter: after
      });

      applyInlineEditSuggestion(cleanSelection, editedText);
      setShowEditModal(false);
      setEditInstruction("");
      setStatus(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengedit teks.";
      setStatus(message);
      setTimeout(() => setStatus(null), 3500);
    } finally {
      setIsBusy(false);
    }
  };

  const handleEditorContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";

    if (!text) return;

    event.preventDefault();
    captureCurrentSelection();

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      selectionText: text
    });
  };

  const wordCount = (() => {
    const text = getDocumentText().trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  })();

  const charCount = getDocumentText().length;

  return (
    <div className="cognitext-shell">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <span className="text-emerald-300 text-xs font-semibold">
                CT
              </span>
            </div>
            <div>
              <h1 className="text-sm md:text-base font-semibold text-slate-50">
                CogniText
              </h1>
              <p className="text-[11px] md:text-xs text-slate-400">
                Workspace kolaboratif + IDE untuk penulis, didukung AI generatif.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              {wordCount} kata · {charCount} karakter
            </span>
            <span className="hidden md:inline-block text-[10px] px-2 py-1 rounded-full border border-slate-700 text-slate-300">
              AI: Generate • Edit • Summarize
            </span>
          </div>
        </div>
      </header>

      <main className="cognitext-main pt-4 md:pt-6">
        <section className="flex-1 flex flex-col space-y-3 md:space-y-4">
          <div className="flex flex-col gap-2">
            <input
              className="bg-transparent border-none text-lg md:text-xl font-semibold outline-none text-slate-50 placeholder:text-slate-500"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="Judul dokumen"
            />
            <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-slate-400">
              <span>Mode: Dokumen + IDE Teks</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Context-aware AI</span>
            </div>
          </div>

          <div className="cognitext-panel flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-slate-800 px-3 md:px-4 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs">
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-slate-50 hover:bg-emerald-500 text-[11px] md:text-xs"
                  disabled={isBusy}
                >
                  <span>Generate Text</span>
                </button>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700 text-[11px] md:text-xs"
                  disabled={isBusy}
                >
                  <span>Edit Selection</span>
                </button>
                <button
                  type="button"
                  onClick={handleSummarizeClick}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700 text-[11px] md:text-xs"
                  disabled={isSummarizing}
                >
                  <span>Summarize Document</span>
                </button>
              </div>
              <div className="text-[10px] md:text-xs text-slate-500">
                Tip: Seleksi teks lalu klik kanan untuk akses cepat AI.
              </div>
            </div>

            <div className="flex-1 overflow-auto px-3 md:px-4 py-3 md:py-4">
              <div
                ref={editorRef}
                className="cognitext-editor whitespace-pre-wrap"
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Mulai menulis di sini. Gunakan AI untuk generate, mengedit, dan meringkas konten secara kontekstual..."
                data-empty="true"
                onContextMenu={handleEditorContextMenu}
              />
            </div>
          </div>

          {status && (
            <div className="text-[11px] md:text-xs text-slate-400">
              {status}
            </div>
          )}
        </section>

        <aside className="w-full md:w-80 lg:w-96 flex flex-col gap-3 md:gap-4">
          <div className="cognitext-panel p-4 flex flex-col gap-2 md:gap-3">
            <h2 className="text-xs font-semibold text-slate-100 flex items-center justify-between">
              Ringkasan Dokumen
              <button
                type="button"
                onClick={handleSummarizeClick}
                className="text-[10px] px-2 py-0.5 rounded-full border border-slate-600 text-slate-200 hover:bg-slate-800"
                disabled={isSummarizing}
              >
                {isSummarizing ? "Memproses..." : "Update"}
              </button>
            </h2>
            <div className="text-[11px] md:text-xs text-slate-300 max-h-64 md:max-h-[360px] overflow-auto">
              {summary ? (
                <p>{summary}</p>
              ) : (
                <p className="text-slate-500">
                  Belum ada ringkasan. Klik{" "}
                  <span className="font-medium">Summarize Document</span> untuk
                  menghasilkan ringkasan dari isi editor.
                </p>
              )}
            </div>
          </div>

          <div className="cognitext-panel p-4 space-y-2 text-[11px] md:text-xs text-slate-300">
            <h2 className="text-xs font-semibold text-slate-100">
              Activity &amp; Context
            </h2>
            <p>
              CogniText mengirimkan beberapa paragraf sebelum dan sesudah teks
              yang dipilih sebagai konteks ke model AI, sehingga saran tetap
              konsisten dengan keseluruhan dokumen.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                <span className="text-slate-200 font-medium">Generate</span>:
                Tambahkan paragraf baru berdasarkan prompt.
              </li>
              <li>
                <span className="text-slate-200 font-medium">Edit</span>:
                Inline suggestion dengan <code>&lt;del&gt;</code> dan{" "}
                <code>&lt;ins&gt;</code> + tombol Accept/Reject.
              </li>
              <li>
                <span className="text-slate-200 font-medium">
                  Summarize
                </span>
                : Ringkasan cepat untuk overview dokumen.
              </li>
            </ul>
          </div>
        </aside>

        {contextMenu.visible && (
          <div
            className="cognitext-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button type="button" onClick={handleGenerateClick}>
              Generate text di posisi kursor
            </button>
            <button type="button" onClick={handleEditClick}>
              Edit selection dengan AI
            </button>
            <button type="button" onClick={handleSummarizeClick}>
              Summarize seluruh dokumen
            </button>
          </div>
        )}

        {showGenerateModal && (
          <div className="cognitext-modal-backdrop">
            <div className="cognitext-modal">
              <h2 className="text-sm font-semibold text-slate-50 mb-2">
                Generate Text dengan AI
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                Beri instruksi singkat, misalnya:{" "}
                <em>
                  &quot;buat paragraf pembuka tentang dampak AI pada
                  jurnalisme&quot;
                </em>
                . Teks akan dimasukkan di posisi kursor.
              </p>
              <textarea
                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                value={generatePrompt}
                onChange={e => setGeneratePrompt(e.target.value)}
                placeholder="Tulis prompt di sini..."
              />
              <div className="mt-3 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={isBusy}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-md bg-emerald-600 text-slate-50 hover:bg-emerald-500 disabled:opacity-60"
                  onClick={handleGenerateSubmit}
                  disabled={isBusy}
                >
                  {isBusy ? "Memproses..." : "Generate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="cognitext-modal-backdrop">
            <div className="cognitext-modal">
              <h2 className="text-sm font-semibold text-slate-50 mb-2">
                Edit Selection dengan AI
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                Instruksi contoh:{" "}
                <em>
                  &quot;buat lebih ringkas&quot;, &quot;ubah nadanya menjadi
                  lebih formal&quot;, &quot;perbaiki tata bahasa&quot;
                </em>
                . AI akan memberi usulan inline dengan opsi Accept/Reject.
              </p>
              <textarea
                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                value={editInstruction}
                onChange={e => setEditInstruction(e.target.value)}
                placeholder="Tulis instruksi edit di sini..."
              />
              <div className="mt-3 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800"
                  onClick={() => setShowEditModal(false)}
                  disabled={isBusy}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-md bg-emerald-600 text-slate-50 hover:bg-emerald-500 disabled:opacity-60"
                  onClick={handleEditSubmit}
                  disabled={isBusy}
                >
                  {isBusy ? "Memproses..." : "Edit dengan AI"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}