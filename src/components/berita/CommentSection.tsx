"use client";

import React, { useState, useTransition } from "react";
import { MessageSquare, Send, CornerDownRight, User, Shield, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { tambahKomentar, type KomentarItem } from "@/app/actions/komentar";

interface CommentSectionProps {
  artikelId: string;
  initialComments: KomentarItem[];
  totalComments: number;
}

function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} hari lalu`;

  return past.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CommentSection({
  artikelId,
  initialComments,
  totalComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<KomentarItem[]>(initialComments);
  const [total, setTotal] = useState<number>(totalComments);

  // Main Form State
  const [nama, setNama] = useState("");
  const [isi, setIsi] = useState("");
  const [isAnonim, setIsAnonim] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reply Form State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyNama, setReplyNama] = useState("");
  const [replyIsi, setReplyIsi] = useState("");
  const [replyIsAnonim, setReplyIsAnonim] = useState(false);
  const [replyError, setReplyError] = useState("");

  const [isPending, startTransition] = useTransition();

  // Submit Main Comment
  const handleSubmitMain = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedIsi = isi.trim();
    if (!trimmedIsi) {
      setErrorMessage("Silakan tulis isi komentar Anda.");
      return;
    }

    const finalNama = isAnonim ? "Anonim" : nama.trim() || "Anonim";

    startTransition(async () => {
      try {
        const res = await tambahKomentar({
          artikelId,
          isi: trimmedIsi,
          nama: finalNama,
        });

        if (res.success && res.komentar) {
          const newComment: KomentarItem = {
            id: res.komentar.id,
            artikel_id: res.komentar.artikel_id,
            nama: res.komentar.nama,
            isi: res.komentar.isi,
            parent_id: null,
            created_at: new Date(res.komentar.created_at),
            updated_at: new Date(res.komentar.updated_at),
            balasan: [],
          };

          setComments((prev) => [newComment, ...prev]);
          setTotal((prev) => prev + 1);
          setIsi("");
          setSuccessMessage("Komentar Anda berhasil dikirim!");
          setTimeout(() => setSuccessMessage(""), 4000);
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Gagal mengirim komentar.");
      }
    });
  };

  // Submit Reply
  const handleSubmitReply = (parentId: string, parentName: string) => {
    setReplyError("");
    const trimmedIsi = replyIsi.trim();
    if (!trimmedIsi) {
      setReplyError("Silakan tulis balasan komentar Anda.");
      return;
    }

    const finalNama = replyIsAnonim ? "Anonim" : replyNama.trim() || "Anonim";

    startTransition(async () => {
      try {
        const res = await tambahKomentar({
          artikelId,
          isi: trimmedIsi,
          nama: finalNama,
          parentId,
        });

        if (res.success && res.komentar) {
          const newReply: KomentarItem = {
            id: res.komentar.id,
            artikel_id: res.komentar.artikel_id,
            nama: res.komentar.nama,
            isi: res.komentar.isi,
            parent_id: parentId,
            created_at: new Date(res.komentar.created_at),
            updated_at: new Date(res.komentar.updated_at),
          };

          setComments((prev) =>
            prev.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  balasan: [...(c.balasan || []), newReply],
                };
              }
              return c;
            })
          );
          setTotal((prev) => prev + 1);
          setReplyingToId(null);
          setReplyIsi("");
          setReplyNama("");
          setSuccessMessage(`Balasan untuk ${parentName} berhasil dikirim!`);
          setTimeout(() => setSuccessMessage(""), 4000);
        }
      } catch (err: unknown) {
        setReplyError(err instanceof Error ? err.message : "Gagal mengirim balasan.");
      }
    });
  };

  return (
    <section className="pt-8 border-t border-stone-200 dark:border-stone-800 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#E50914]" />
          <span>Komentar &amp; Tanggapan</span>
          <span className="text-xs bg-[#7F0000] text-white font-mono px-2 py-0.5 rounded-full ml-1 font-bold">
            {total}
          </span>
        </h2>
        <span className="text-xs text-stone-500">Terbuka untuk Umum</span>
      </div>

      {/* Success / Error Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs border border-emerald-200 dark:border-emerald-800 transition-all animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-lg text-xs border border-red-200 dark:border-red-800 transition-all">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Comment Box */}
      <form
        onSubmit={handleSubmitMain}
        className="bg-stone-50 dark:bg-[#1A0E0E] p-4 sm:p-5 rounded-xl border border-stone-200 dark:border-[#2C1414] shadow-xs space-y-3.5"
      >
        <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
          Tinggalkan Komentar:
        </p>

        {/* Name input & Anonymous Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5 items-center">
          <div className="relative">
            <input
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                if (isAnonim) setIsAnonim(false);
              }}
              disabled={isAnonim || isPending}
              placeholder={isAnonim ? "Berkomentar sebagai Anonim" : "Nama Anda (kosongkan jika ingin Anonim)"}
              className={`w-full text-xs px-3.5 py-2.5 rounded-lg border bg-white dark:bg-[#120808] transition-colors ${
                isAnonim
                  ? "border-stone-300 dark:border-stone-700 text-stone-400 italic bg-stone-100 dark:bg-stone-900 cursor-not-allowed"
                  : "border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-red-500"
              }`}
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none bg-white dark:bg-[#120808] px-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-red-500/50 transition-colors">
            <input
              type="checkbox"
              checked={isAnonim}
              onChange={(e) => {
                setIsAnonim(e.target.checked);
                if (e.target.checked) setNama("");
              }}
              className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <Shield className="w-3.5 h-3.5 text-stone-500" />
            <span>Kirim Anonim</span>
          </label>
        </div>

        {/* Comment Textarea */}
        <textarea
          rows={3}
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          disabled={isPending}
          placeholder="Tuliskan pandangan, tanggapan, atau kritik yang membangun..."
          className="w-full text-xs p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#120808] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors resize-y min-h-[75px]"
          required
        />

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-stone-500">
            Harap berkomentar secara bijak dan sopan santun.
          </span>
          <button
            type="submit"
            disabled={isPending || !isi.trim()}
            className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] disabled:bg-stone-300 dark:disabled:bg-stone-800 disabled:text-stone-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Komentar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 dark:bg-[#160B0B] rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-stone-400 stroke-1" />
            <p className="text-xs font-medium">Belum ada komentar pada berita ini.</p>
            <p className="text-[11px] text-stone-400">Jadilah yang pertama menyampaikan tanggapan!</p>
          </div>
        ) : (
          comments.map((komentar) => {
            const isAnon = komentar.nama === "Anonim" || !komentar.nama;
            const isReplying = replyingToId === komentar.id;

            return (
              <div
                key={komentar.id}
                className="bg-white dark:bg-[#160B0B] border border-stone-200 dark:border-[#2C1414] rounded-xl p-4 sm:p-5 space-y-3 transition-colors"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        isAnon
                          ? "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                          : "bg-red-100 dark:bg-red-950/80 text-[#7F0000] dark:text-red-300 border border-red-200 dark:border-red-900"
                      }`}
                    >
                      {isAnon ? <Shield className="w-4 h-4" /> : komentar.nama?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          {komentar.nama || "Anonim"}
                        </span>
                        {isAnon && (
                          <span className="text-[9px] bg-stone-100 dark:bg-stone-800 text-stone-500 font-medium px-1.5 py-0.2 rounded">
                            Anonim
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 block font-mono">
                        {timeAgo(komentar.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Reply Button Trigger */}
                  <button
                    onClick={() => {
                      if (isReplying) {
                        setReplyingToId(null);
                      } else {
                        setReplyingToId(komentar.id);
                        setReplyError("");
                        setReplyIsi("");
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#7F0000] dark:text-red-400 hover:text-red-600 font-semibold cursor-pointer px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>{isReplying ? "Batal" : "Balas"}</span>
                  </button>
                </div>

                {/* Comment Content */}
                <p className="text-xs sm:text-[13px] text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap pl-10">
                  {komentar.isi}
                </p>

                {/* Inline Reply Form */}
                {isReplying && (
                  <div className="mt-3 ml-6 sm:ml-10 p-3.5 bg-stone-50 dark:bg-[#1F1010] border border-stone-200 dark:border-[#3A1818] rounded-lg space-y-2.5 animate-fade-in">
                    <p className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <CornerDownRight className="w-3 h-3 text-red-500" />
                      <span>Balas ke <strong>{komentar.nama || "Anonim"}</strong>:</span>
                    </p>

                    {replyError && (
                      <p className="text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{replyError}</span>
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                      <input
                        type="text"
                        value={replyNama}
                        onChange={(e) => {
                          setReplyNama(e.target.value);
                          if (replyIsAnonim) setReplyIsAnonim(false);
                        }}
                        disabled={replyIsAnonim || isPending}
                        placeholder={replyIsAnonim ? "Balas sebagai Anonim" : "Nama Anda (kosongkan untuk Anonim)"}
                        className={`text-xs px-3 py-1.5 rounded border bg-white dark:bg-[#120808] ${
                          replyIsAnonim
                            ? "text-stone-400 italic bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-700"
                            : "border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                        }`}
                      />
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-300 cursor-pointer select-none px-2 py-1.5 bg-white dark:bg-[#120808] rounded border border-stone-200 dark:border-stone-800">
                        <input
                          type="checkbox"
                          checked={replyIsAnonim}
                          onChange={(e) => {
                            setReplyIsAnonim(e.target.checked);
                            if (e.target.checked) setReplyNama("");
                          }}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <span>Anonim</span>
                      </label>
                    </div>

                    <textarea
                      rows={2}
                      value={replyIsi}
                      onChange={(e) => setReplyIsi(e.target.value)}
                      disabled={isPending}
                      placeholder={`Tulis balasan Anda...`}
                      className="w-full text-xs p-2.5 rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#120808] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-red-500 resize-y"
                    />

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 px-3 py-1.5 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmitReply(komentar.id, komentar.nama || "Anonim")}
                        disabled={isPending || !replyIsi.trim()}
                        className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B91C1C] disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white text-xs font-bold px-3.5 py-1.5 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>Kirim Balasan</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies */}
                {komentar.balasan && komentar.balasan.length > 0 && (
                  <div className="mt-3 ml-4 sm:ml-8 pl-3 sm:pl-4 border-l-2 border-red-200 dark:border-red-950/80 space-y-3 pt-1">
                    {komentar.balasan.map((balas) => {
                      const isBalasAnon = balas.nama === "Anonim" || !balas.nama;
                      return (
                        <div
                          key={balas.id}
                          className="bg-stone-50/70 dark:bg-[#120707] p-3 rounded-lg border border-stone-100 dark:border-[#241010] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] uppercase shrink-0 ${
                                  isBalasAnon
                                    ? "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                                    : "bg-red-100 dark:bg-red-950 text-[#7F0000] dark:text-red-300"
                                }`}
                              >
                                {isBalasAnon ? <Shield className="w-3 h-3" /> : balas.nama?.charAt(0) || <User className="w-3 h-3" />}
                              </div>
                              <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                                {balas.nama || "Anonim"}
                              </span>
                              {isBalasAnon && (
                                <span className="text-[8px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-1 py-0.2 rounded font-medium">
                                  Anonim
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-stone-400 font-mono">
                              {timeAgo(balas.created_at)}
                            </span>
                          </div>

                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap pl-8">
                            {balas.isi}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
