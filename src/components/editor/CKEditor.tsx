"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  Table,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react";

interface CKEditorProps {
  name: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function CKEditor({
  name,
  initialValue = "",
  onChange,
  placeholder = "Tulis isi berita atau naskah lengkap di sini...",
}: CKEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [value, setValue] = useState(initialValue);
  const [headingValue, setHeadingValue] = useState("P");

  // Set initial HTML on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue || "";
    }
    setValue(initialValue || "");
  }, []);

  // Sync external initialValue changes (e.g. switching static pages)
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== (initialValue || "")) {
      editorRef.current.innerHTML = initialValue || "";
      setValue(initialValue || "");
    }
  }, [initialValue]);

  const emitChange = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    isInternalChange.current = true;
    setValue(html);
    if (onChange) onChange(html);
  };

  const exec = (command: string, arg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = e.target.value;
    setHeadingValue(tag);
    exec("formatBlock", `<${tag}>`);
  };

  const handleInsertLink = () => {
    const url = window.prompt("Masukkan alamat URL tautan:", "https://");
    if (url && url.trim() && url !== "https://") {
      exec("createLink", url.trim());
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin:12px 0;">
        <thead>
          <tr>
            <th style="border:1px solid #cbd5e1; padding:8px; background:#f8fafc; text-align:left;">Kolom 1</th>
            <th style="border:1px solid #cbd5e1; padding:8px; background:#f8fafc; text-align:left;">Kolom 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px;">Isi data 1</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Isi data 2</td>
          </tr>
        </tbody>
      </table>
      <p><br/></p>
    `;
    exec("insertHTML", tableHtml);
  };

  return (
    <div className="space-y-1 relative">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Editor Box */}
      <div className="visual-editor-wrapper rounded-lg overflow-hidden border border-stone-200 bg-white focus-within:border-[#E50914] focus-within:ring-1 focus-within:ring-[#E50914] transition-all shadow-xs">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700 select-none">
          <select
            value={headingValue}
            onChange={handleHeadingChange}
            aria-label="Pilih gaya teks"
            className="text-xs font-semibold bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#E50914] cursor-pointer"
          >
            <option value="P">Paragraf Biasa</option>
            <option value="H2">Judul Bagian (H2)</option>
            <option value="H3">Sub-judul (H3)</option>
            <option value="H4">Sub-judul Kecil (H4)</option>
          </select>

          <span className="h-4 w-px bg-slate-200 mx-0.5" />

          <button
            type="button"
            onClick={() => exec("bold")}
            title="Tebal (Bold)"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("italic")}
            title="Miring (Italic)"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("underline")}
            title="Garis Bawah (Underline)"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInsertLink}
            title="Sisipkan Tautan"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-px bg-slate-200 mx-0.5" />

          <button
            type="button"
            onClick={() => exec("insertUnorderedList")}
            title="Daftar Poin (Bullet List)"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("insertOrderedList")}
            title="Daftar Nomor (Numbered List)"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("outdent")}
            title="Kurangi Indentasi"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Outdent className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("indent")}
            title="Tambah Indentasi"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Indent className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-px bg-slate-200 mx-0.5" />

          <button
            type="button"
            onClick={() => exec("formatBlock", "<BLOCKQUOTE>")}
            title="Kutipan (Blockquote)"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInsertTable}
            title="Sisipkan Tabel"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("removeFormat")}
            title="Bersihkan Format"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-px bg-slate-200 mx-0.5" />

          <button
            type="button"
            onClick={() => exec("undo")}
            title="Urungkan (Undo)"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("redo")}
            title="Ulangi (Redo)"
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editable Area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          data-placeholder={placeholder}
          className="visual-editor-content min-h-[260px] max-h-[550px] overflow-y-auto p-4 sm:p-5 text-sm text-stone-900 leading-relaxed focus:outline-none"
        />
      </div>

      <style jsx global>{`
        .visual-editor-content:empty:before {
          content: attr(data-placeholder);
          color: #a8a29e;
          pointer-events: none;
          display: block;
        }
        .visual-editor-content h2 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #1c1917;
        }
        .visual-editor-content h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-top: 0.85rem;
          margin-bottom: 0.4rem;
          color: #1c1917;
        }
        .visual-editor-content h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-top: 0.75rem;
          margin-bottom: 0.35rem;
          color: #1c1917;
        }
        .visual-editor-content p {
          margin-bottom: 0.75rem;
        }
        .visual-editor-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .visual-editor-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .visual-editor-content blockquote {
          border-left: 4px solid #e50914;
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: #57534e;
          font-style: italic;
        }
        .visual-editor-content a {
          color: #e50914;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
