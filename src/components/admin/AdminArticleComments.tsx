"use client";

import React, { useState, useEffect, useTransition } from "react";
import { MessageSquare, Trash2, Shield, User, CornerDownRight, RefreshCw, AlertCircle, CheckCircle2, X } from "lucide-react";
import { ambilKomentarArtikel, hapusKomentar, type KomentarItem } from "@/app/actions/komentar";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface AdminArticleCommentsProps {
  artikelId: string;
  artikelJudul?: string;
  onClose?: () => void;
  isModal?: boolean;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminArticleComments({
  artikelId,
  artikelJudul,
  onClose,
  isModal = false,
}: AdminArticleCommentsProps) {
  const [comments, setComments] = useState<KomentarItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load comments
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ambilKomentarArtikel(artikelId);
      setComments(res.comments);
      setTotal(res.total);
    } catch (err: unknown) {
      setNotification({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat komentar",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [artikelId]);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: "danger" | "warning";
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    variant: "danger",
    action: async () => {},
  });

  // Handle Delete
  const handleDelete = (id: string, isReply: boolean = false, parentId?: string) => {
    const confirmPrompt = isReply
      ? "Hapus balasan komentar ini secara permanen?"
      : "Hapus komentar ini beserta seluruh balasannya secara permanen?";

    setConfirmDialog({
      isOpen: true,
      title: "Hapus Komentar",
      message: confirmPrompt,
      confirmText: "Ya, Hapus Komentar",
      variant: "danger",
      action: async () => {
        setDeletingId(id);
        try {
          await hapusKomentar(id);

          if (isReply && parentId) {
            setComments((prev) =>
              prev.map((c) => {
                if (c.id === parentId) {
                  return {
                    ...c,
                    balasan: (c.balasan || []).filter((r) => r.id !== id),
                  };
                }
                return c;
              })
            );
            setTotal((prev) => Math.max(0, prev - 1));
          } else {
            const target = comments.find((c) => c.id === id);
            const replyCount = target?.balasan?.length || 0;
            setComments((prev) => prev.filter((c) => c.id !== id));
            setNotification({
              type: "success",
              text: isReply ? "Balasan komentar berhasil dihapus." : "Komentar berhasil dihapus.",
            });
            setTimeout(() => setNotification(null), 3000);
          }
        } catch (err: unknown) {
          setNotification({
            type: "error",
            text: err instanceof Error ? err.message : "Gagal menghapus komentar",
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-50 text-[#E50914] border border-red-200">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span>Komentar &amp; Balasan Berita</span>
              <span className="text-[11px] bg-red-50 text-red-700 font-mono px-2 py-0.5 rounded border border-red-200 font-bold">
                {total} Total
              </span>
            </h3>
            {artikelJudul && (
              <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                {artikelJudul}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors cursor-pointer"
            title="Muat ulang komentar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400">
          <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
          <span className="text-xs">Memuat daftar komentar...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-10 text-center text-stone-500 bg-stone-50 rounded-lg border border-dashed border-stone-200 space-y-1.5">
          <MessageSquare className="w-6 h-6 mx-auto text-stone-400" />
          <p className="text-xs font-semibold text-stone-700">Belum ada komentar pada naskah ini</p>
          <p className="text-[11px] text-stone-400">
            Komentar yang dikirim oleh publik akan muncul di sini dan dapat Anda hapus sewaktu-waktu.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {comments.map((komentar) => {
            const isAnon = komentar.nama === "Anonim" || !komentar.nama;
            const isDeletingThis = deletingId === komentar.id;

            return (
              <div
                key={komentar.id}
                className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-2.5 transition-colors"
              >
                {/* Parent Comment Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        isAnon
                          ? "bg-stone-200 text-stone-600"
                          : "bg-red-100 text-[#7F0000] border border-red-200"
                      }`}
                    >
                      {isAnon ? <Shield className="w-3.5 h-3.5" /> : komentar.nama?.charAt(0) || <User className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-900">
                          {komentar.nama || "Anonim"}
                        </span>
                        {isAnon && (
                          <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-medium">
                            Anonim
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {formatDate(komentar.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Delete Parent Comment Button */}
                  <button
                    onClick={() => handleDelete(komentar.id, false)}
                    disabled={isDeletingThis || isPending}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                    title="Hapus komentar ini beserta seluruh balasannya"
                  >
                    {isDeletingThis ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    <span>Hapus</span>
                  </button>
                </div>

                {/* Parent Comment Body */}
                <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap pl-9">
                  {komentar.isi}
                </p>

                {/* Nested Replies */}
                {komentar.balasan && komentar.balasan.length > 0 && (
                  <div className="mt-3 ml-6 pl-3 border-l-2 border-red-200 space-y-2 pt-1">
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3 text-red-500" />
                      <span>{komentar.balasan.length} Balasan:</span>
                    </p>

                    {komentar.balasan.map((balas) => {
                      const isBalasAnon = balas.nama === "Anonim" || !balas.nama;
                      const isDeletingReply = deletingId === balas.id;

                      return (
                        <div
                          key={balas.id}
                          className="bg-white p-2.5 rounded border border-stone-200 space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] uppercase shrink-0 ${
                                  isBalasAnon
                                    ? "bg-stone-100 text-stone-600"
                                    : "bg-red-50 text-[#7F0000]"
                                }`}
                              >
                                {isBalasAnon ? <Shield className="w-2.5 h-2.5" /> : balas.nama?.charAt(0) || <User className="w-2.5 h-2.5" />}
                              </div>
                              <span className="font-bold text-xs text-stone-900">
                                {balas.nama || "Anonim"}
                              </span>
                              {isBalasAnon && (
                                <span className="text-[8px] bg-stone-100 text-stone-600 px-1 py-0.2 rounded font-medium">
                                  Anonim
                                </span>
                              )}
                              <span className="text-[9px] text-stone-400 font-mono">
                                • {formatDate(balas.created_at)}
                              </span>
                            </div>

                            {/* Delete Reply Button */}
                            <button
                              onClick={() => handleDelete(balas.id, true, komentar.id)}
                              disabled={isDeletingReply || isPending}
                              className="p-1 rounded text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                              title="Hapus balasan ini"
                            >
                              {isDeletingReply ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap pl-7">
                            {balas.isi}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {isModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            {content}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          {content}
        </div>
      )}

      {/* In-App Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
