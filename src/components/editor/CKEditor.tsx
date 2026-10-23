"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";

interface CKEditorProps {
  name: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    ClassicEditor: {
      create: (
        element: HTMLElement,
        config?: Record<string, unknown>
      ) => Promise<{
        getData: () => string;
        setData: (data: string) => void;
        destroy: () => Promise<void>;
        model: {
          document: {
            on: (event: string, callback: () => void) => void;
          };
        };
      }>;
    };
  }
}

export default function CKEditor({
  name,
  initialValue = "",
  onChange,
  placeholder = "Tulis isi berita atau naskah lengkap di sini...",
}: CKEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<{
    getData: () => string;
    setData: (data: string) => void;
    destroy: () => Promise<void>;
  } | null>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [value, setValue] = useState(initialValue);

  // Initialize editor when script is loaded and container is available
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || editorInstanceRef.current) return;

    if (typeof window !== "undefined" && window.ClassicEditor) {
      window.ClassicEditor.create(containerRef.current, {
        placeholder,
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "outdent",
          "indent",
          "|",
          "blockQuote",
          "insertTable",
          "undo",
          "redo",
        ],
        heading: {
          options: [
            { model: "paragraph", title: "Paragraf Biasa", class: "ck-heading_paragraph" },
            {
              model: "heading2",
              view: "h2",
              title: "Judul Bagian (H2)",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Sub-judul (H3)",
              class: "ck-heading_heading3",
            },
          ],
        },
      })
        .then((editor) => {
          editorInstanceRef.current = editor;
          if (initialValue) {
            editor.setData(initialValue);
          }

          editor.model.document.on("change:data", () => {
            const data = editor.getData();
            setValue(data);
            if (onChange) onChange(data);
          });

          setEditorReady(true);
        })
        .catch((error) => {
          console.error("Gagal menginisialisasi CKEditor 5:", error);
        });
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(() => {});
        editorInstanceRef.current = null;
      }
    };
  }, [scriptLoaded, placeholder]);

  // Keep editor content in sync if initialValue changes externally
  useEffect(() => {
    if (editorInstanceRef.current && initialValue !== undefined) {
      const currentData = editorInstanceRef.current.getData();
      if (currentData !== initialValue) {
        editorInstanceRef.current.setData(initialValue);
        setValue(initialValue);
      }
    }
  }, [initialValue]);

  return (
    <div className="space-y-1 relative">
      <Script
        src="https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
        }}
      />

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Editor Box */}
      <div className="ckeditor-wrapper rounded-lg overflow-hidden border border-stone-200 bg-white focus-within:border-[#E50914] transition-colors shadow-xs">
        {!editorReady && (
          <div className="min-h-[260px] flex flex-col items-center justify-center gap-2 p-6 text-stone-500 bg-stone-50">
            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            <span className="text-xs">Memuat Formatter Visual (CKEditor 5)...</span>
          </div>
        )}

        <div
          ref={containerRef}
          className={`${editorReady ? "block" : "hidden"} min-h-[260px]`}
        />
      </div>

      <style jsx global>{`
        .ckeditor-wrapper .ck-editor__editable_inline {
          min-height: 260px !important;
          max-height: 550px !important;
          overflow-y: auto !important;
          background-color: #ffffff !important;
          color: #1c1917 !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          line-height: 1.625 !important;
          padding: 1rem 1.25rem !important;
        }
        .ckeditor-wrapper .ck.ck-toolbar {
          background-color: #f8fafc !important;
          border-color: #e2e8f0 !important;
          border-top-left-radius: 0.5rem !important;
          border-top-right-radius: 0.5rem !important;
        }
        .ckeditor-wrapper .ck.ck-button {
          color: #475569 !important;
          cursor: pointer !important;
        }
        .ckeditor-wrapper .ck.ck-button:hover {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .ckeditor-wrapper .ck.ck-button.ck-on {
          background-color: #fee2e2 !important;
          color: #b91c1c !important;
        }
        .ckeditor-wrapper .ck.ck-dropdown__panel {
          background-color: #ffffff !important;
          border-color: #e2e8f0 !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        }
        .ckeditor-wrapper .ck.ck-list__item .ck-button {
          color: #334155 !important;
        }
        .ckeditor-wrapper .ck.ck-list__item .ck-button:hover {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }
      `}</style>
    </div>
  );
}
