"use client";

import React from "react";
import { AlertTriangle, HelpCircle, AlertCircle, X } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = "Konfirmasi Tindakan",
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "warning",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";
  const isWarning = variant === "warning";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDanger
                ? "bg-red-100 text-red-600 border border-red-200"
                : isWarning
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-blue-100 text-blue-600 border border-blue-200"
            }`}
          >
            {isDanger ? (
              <AlertCircle className="w-5 h-5" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <HelpCircle className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-stone-900">{title}</h3>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="text-stone-400 hover:text-stone-600 -mr-1 -mt-1 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : isWarning
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
