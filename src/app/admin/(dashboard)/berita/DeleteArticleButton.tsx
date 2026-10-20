"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { hapusArtikel } from "@/app/actions/berita";

interface DeleteArticleButtonProps {
  id: string;
  judul: string;
}

export default function DeleteArticleButton({ id, judul }: DeleteArticleButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Yakin ingin menghapus artikel: "${judul}"?`)) {
      setLoading(true);
      try {
        await hapusArtikel(id);
      } catch (err) {
        alert("Gagal menghapus artikel");
        setLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded bg-red-950/60 text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
      title="Hapus Artikel"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
