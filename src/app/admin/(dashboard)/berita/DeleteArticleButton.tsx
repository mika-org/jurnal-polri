"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { hapusArtikel } from "@/app/actions/berita";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface DeleteArticleButtonProps {
  id: string;
  judul: string;
}

export default function DeleteArticleButton({ id, judul }: DeleteArticleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await hapusArtikel(id);
      window.location.reload();
    } catch {
      alert("Gagal menghapus artikel");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        disabled={loading}
        className="p-1.5 rounded bg-red-950/60 text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
        title="Hapus Artikel"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus Naskah Berita"
        message={`Pindahkan artikel "${judul}" ke kotak sampah?`}
        confirmText="Ya, Pindahkan"
        variant="danger"
        isLoading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
