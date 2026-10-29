"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  GripVertical,
  Trash2,
  Edit,
  Plus,
  Columns,
  Maximize2,
  Minimize2,
  Star,
  Shield,
  Layers,
  Layout,
  Sparkles,
  ArrowRight,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  type NewspaperBlock,
  type NewspaperPage,
  type MultiPageNewspaperData,
} from "./NewspaperTypes";

interface NewspaperA4CanvasProps {
  data: MultiPageNewspaperData;
  activePageIndex: number;
  isEditorMode: boolean;
  scalePercent: number;
  onUpdateBlock: (pageIndex: number, blockId: string, updates: Partial<NewspaperBlock>) => void;
  onDeleteBlock: (pageIndex: number, blockId: string) => void;
  onReorderBlocks: (pageIndex: number, sourceIndex: number, destinationIndex: number) => void;
  onOpenAddModal: (pageIndex: number, defaultSpan?: number) => void;
  onOpenEditModal: (pageIndex: number, block: NewspaperBlock) => void;
  onOpenHeaderModal?: () => void;
  onAddBlock?: (pageIndex: number, block: NewspaperBlock) => void;
  onUpdatePageHeader?: (pageIndex: number, newHeader: string) => void;
  onUpdateCoverVersion?: (pageIndex: number, version: "v1_lama" | "v2_baru") => void;
}

function getColSpanClass(span: number): string {
  switch (span) {
    case 1:
      return "col-span-1";
    case 2:
      return "col-span-2";
    case 3:
      return "col-span-3";
    case 4:
      return "col-span-4";
    case 5:
      return "col-span-5";
    case 6:
      return "col-span-6";
    case 7:
      return "col-span-7";
    case 8:
      return "col-span-8";
    case 9:
      return "col-span-9";
    case 10:
      return "col-span-10";
    case 11:
      return "col-span-11";
    case 12:
    default:
      return "col-span-12";
  }
}

export default function NewspaperA4Canvas({
  data,
  activePageIndex,
  isEditorMode,
  scalePercent,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  onOpenAddModal,
  onOpenEditModal,
  onOpenHeaderModal,
  onAddBlock,
  onUpdatePageHeader,
  onUpdateCoverVersion,
}: NewspaperA4CanvasProps) {
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Active Mouse Resize State (Section Width, Section Height, Corner Both, Image, or Image Height Only)
  const [resizing, setResizing] = useState<{
    type: "section_width" | "section_height" | "section_both" | "image" | "image_height_only";
    pageIndex: number;
    blockId: string;
    startX: number;
    startY: number;
    startSpan: number;
    startHeight: number;
    startImgW: number;
    startImgH: number;
    colWidthPx: number;
  } | null>(null);

  // Global mouse move and up listeners for interactive resizing
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const scale = scalePercent / 100;
      const deltaX = (e.clientX - resizing.startX) / scale;
      const deltaY = (e.clientY - resizing.startY) / scale;

      if (resizing.type === "section_width") {
        const deltaSpan = Math.round(deltaX / resizing.colWidthPx);
        const newSpan = Math.max(2, Math.min(12, resizing.startSpan + deltaSpan));
        onUpdateBlock(resizing.pageIndex, resizing.blockId, { colSpan: newSpan });
      } else if (resizing.type === "section_height") {
        const newHeight = Math.max(50, Math.round(resizing.startHeight + deltaY));
        onUpdateBlock(resizing.pageIndex, resizing.blockId, { customHeight: newHeight });
      } else if (resizing.type === "section_both") {
        const deltaSpan = Math.round(deltaX / resizing.colWidthPx);
        const newSpan = Math.max(2, Math.min(12, resizing.startSpan + deltaSpan));
        const newHeight = Math.max(50, Math.round(resizing.startHeight + deltaY));
        onUpdateBlock(resizing.pageIndex, resizing.blockId, {
          colSpan: newSpan,
          customHeight: newHeight,
        });
      } else if (resizing.type === "image") {
        const newImgW = Math.max(40, Math.min(400, Math.round(resizing.startImgW + deltaX)));
        const newImgH = Math.max(40, Math.min(400, Math.round(resizing.startImgH + deltaY)));
        onUpdateBlock(resizing.pageIndex, resizing.blockId, {
          imageWidth: newImgW,
          imageHeight: newImgH,
        });
      } else if (resizing.type === "image_height_only") {
        const newImgH = Math.max(35, Math.min(350, Math.round(resizing.startImgH + deltaY)));
        onUpdateBlock(resizing.pageIndex, resizing.blockId, {
          imageHeight: newImgH,
        });
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, scalePercent, onUpdateBlock]);

  // Handlers to initiate resizing with mouse cursor
  const handleStartResizeWidth = (e: React.MouseEvent, pageIdx: number, block: NewspaperBlock) => {
    e.preventDefault();
    e.stopPropagation();
    const targetElement = (e.currentTarget as HTMLElement).closest(".newspaper-a4-page");
    const containerWidth = targetElement ? targetElement.clientWidth - 38 : 750;
    const colWidthPx = containerWidth / 12;

    setResizing({
      type: "section_width",
      pageIndex: pageIdx,
      blockId: block.id,
      startX: e.clientX,
      startY: e.clientY,
      startSpan: block.colSpan,
      startHeight: block.customHeight || 100,
      startImgW: block.imageWidth || 64,
      startImgH: block.imageHeight || 56,
      colWidthPx,
    });
  };

  const handleStartResizeHeight = (e: React.MouseEvent, pageIdx: number, block: NewspaperBlock) => {
    e.preventDefault();
    e.stopPropagation();
    const blockEl = (e.currentTarget as HTMLElement).closest(".newspaper-block-card");
    const currentH = blockEl ? blockEl.clientHeight : block.customHeight || 100;

    setResizing({
      type: "section_height",
      pageIndex: pageIdx,
      blockId: block.id,
      startX: e.clientX,
      startY: e.clientY,
      startSpan: block.colSpan,
      startHeight: currentH,
      startImgW: block.imageWidth || 64,
      startImgH: block.imageHeight || 56,
      colWidthPx: 60,
    });
  };

  const handleStartResizeBoth = (e: React.MouseEvent, pageIdx: number, block: NewspaperBlock) => {
    e.preventDefault();
    e.stopPropagation();
    const targetElement = (e.currentTarget as HTMLElement).closest(".newspaper-a4-page");
    const containerWidth = targetElement ? targetElement.clientWidth - 38 : 750;
    const colWidthPx = containerWidth / 12;
    const blockEl = (e.currentTarget as HTMLElement).closest(".newspaper-block-card");
    const currentH = blockEl ? blockEl.clientHeight : block.customHeight || 100;

    setResizing({
      type: "section_both",
      pageIndex: pageIdx,
      blockId: block.id,
      startX: e.clientX,
      startY: e.clientY,
      startSpan: block.colSpan,
      startHeight: currentH,
      startImgW: block.imageWidth || 64,
      startImgH: block.imageHeight || 56,
      colWidthPx,
    });
  };

  const handleStartResizeImage = (e: React.MouseEvent, pageIdx: number, block: NewspaperBlock) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({
      type: "image",
      pageIndex: pageIdx,
      blockId: block.id,
      startX: e.clientX,
      startY: e.clientY,
      startSpan: block.colSpan,
      startHeight: block.customHeight || 100,
      startImgW: block.imageWidth || 64,
      startImgH: block.imageHeight || 56,
      colWidthPx: 60,
    });
  };

  const handleStartResizeImageHeight = (e: React.MouseEvent, pageIdx: number, block: NewspaperBlock) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({
      type: "image_height_only",
      pageIndex: pageIdx,
      blockId: block.id,
      startX: e.clientX,
      startY: e.clientY,
      startSpan: block.colSpan,
      startHeight: block.customHeight || 100,
      startImgW: block.imageWidth || 64,
      startImgH: block.imageHeight || 85,
      colWidthPx: 60,
    });
  };

  // Cycle image position (left -> top -> right -> bottom -> left)
  const handleCycleImagePosition = (block: NewspaperBlock) => {
    const current = block.imagePosition || "left";
    const nextMap: Record<string, "top" | "left" | "right" | "bottom"> = {
      left: "top",
      top: "right",
      right: "bottom",
      bottom: "left",
    };
    const next = nextMap[current] || "top";
    onUpdateBlock(activePageIndex, block.id, { imagePosition: next });
  };

  const currentPage = data.pages[activePageIndex] || data.pages[0];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedBlockIndex !== null && draggedBlockIndex !== targetIndex) {
      onReorderBlocks(activePageIndex, draggedBlockIndex, targetIndex);
    }
    setDraggedBlockIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedBlockIndex(null);
    setDragOverIndex(null);
  };

  // Quick resize colSpan
  const handleSetSpan = (blockId: string, newSpan: number) => {
    onUpdateBlock(activePageIndex, blockId, { colSpan: newSpan });
  };

  // Quick cycle text columns (1 -> 2 -> 3 -> 4 -> 1)
  const handleCycleColumns = (block: NewspaperBlock) => {
    const current = block.textColumns || 1;
    const next = current >= 4 ? 1 : current + 1;
    onUpdateBlock(activePageIndex, block.id, { textColumns: next });
  };

  // Quick cycle font size (xs -> sm -> base -> xs)
  const handleCycleFontSize = (block: NewspaperBlock) => {
    const current = block.fontSize || "xs";
    const next = current === "xs" ? "sm" : current === "sm" ? "base" : "xs";
    onUpdateBlock(activePageIndex, block.id, { fontSize: next });
  };

  // Step-wise reordering (Move Left / Move Right)
  const handleMoveBlockLeft = (bIdx: number) => {
    if (bIdx > 0) {
      onReorderBlocks(activePageIndex, bIdx, bIdx - 1);
    }
  };

  const handleMoveBlockRight = (bIdx: number, totalBlocks: number) => {
    if (bIdx < totalBlocks - 1) {
      onReorderBlocks(activePageIndex, bIdx, bIdx + 1);
    }
  };

  // Expand block to auto-fill remaining row space
  const handleExpandBlock = (block: NewspaperBlock, remainingSpan: number) => {
    const newSpan = Math.min(12, block.colSpan + remainingSpan);
    onUpdateBlock(activePageIndex, block.id, { colSpan: newSpan });
  };

  // Quick add block to fill empty space
  const handleQuickAddBlock = (pageIdx: number, type: NewspaperBlock["type"], span: number) => {
    if (onAddBlock) {
      const newBlock: NewspaperBlock = {
        id: `block-${Date.now()}`,
        type,
        title:
          type === "text_columns"
            ? "Tajuk Berita Liputan Daerah"
            : type === "photo_story"
            ? "Liputan Dokumentasi Lapangan"
            : "Ucapan Selamat & Sukses",
        content:
          type === "text_columns"
            ? "Tuliskan laporan berita di sini. Tata letak gambar dan kolom teks dapat diatur secara leluasa (di atas, di samping kiri/kanan, atau di bawah)."
            : undefined,
        image:
          type === "photo_story"
            ? "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop",
        colSpan: span,
        textColumns: span >= 6 ? 2 : 1,
        imagePosition: span >= 6 ? "top" : "left",
        fontSize: "xs",
        themeColor: "orange",
      };
      onAddBlock(pageIdx, newBlock);
    } else {
      onOpenAddModal(pageIdx, span);
    }
  };

  // Render Single Page Canvas (Used for live screen and print)
  const renderPageSheet = (page: NewspaperPage, pageIdx: number, isPrintTarget = false) => {
    // Calculate total colSpan used in current row to detect empty void
    let currentRowSpan = 0;
    for (const b of page.blocks) {
      currentRowSpan = (currentRowSpan + b.colSpan) % 12;
    }
    const remainingRowSpan = currentRowSpan > 0 ? 12 - currentRowSpan : 0;
    const isPageGrayscale = Boolean(page.isGrayscale ?? data.isGrayscale);

    return (
      <div
        key={page.id || pageIdx}
        className={`newspaper-a4-page bg-white text-black font-sans relative select-none mx-auto overflow-hidden ${
          isPageGrayscale ? "newspaper-grayscale grayscale contrast-[1.08]" : ""
        } ${
          isPrintTarget ? "print-only-page" : "shadow-2xl mb-8"
        }`}
        style={{
          width: "210mm",
          height: "297mm",
          maxHeight: "297mm",
          boxSizing: "border-box",
          padding: "5mm",
          transform: !isPrintTarget ? `scale(${scalePercent / 100})` : undefined,
          transformOrigin: "top center",
        }}
      >
        {/* Outer Paper Area (Border paper dinonaktifkan/tutup) */}
        <div className="w-full h-full flex flex-col justify-between overflow-hidden p-1.5 bg-white">
          {/* ========================================================= */}
          {/* 1. HEADER SECTION (Cover Masthead OR Running Header) */}
          {/* ========================================================= */}
          {page.showCoverMasthead ? (
            <header className="w-full shrink-0 mb-1 relative group">
              {/* Image-Only Newspaper Header Banner */}
              <div className="relative w-full border border-black overflow-hidden bg-white shadow-2xs">
                <Image
                  src={data.masthead.image || "/images/header-koran-default.webp"}
                  alt="Header Koran Jurnal Polisi"
                  width={1500}
                  height={389}
                  className="w-full h-auto object-cover block"
                  priority
                  unoptimized
                />

                {/* Edit Header Image Overlay (Only visible in Editor Mode on hover) */}
                {isEditorMode && !isPrintTarget && (
                  <div
                    onClick={onOpenHeaderModal}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer backdrop-blur-[1px]"
                  >
                    <button
                      type="button"
                      className="bg-[#E50914] hover:bg-[#B91C1C] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xl flex items-center gap-1.5 cursor-pointer border border-white/60 transition-transform hover:scale-105"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Ubah Gambar Header Koran</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Full Width Edition Badge */}
              {data.masthead.showEditionBar !== false && (
                (() => {
                  const isV1Lama = (page.coverVersion || data.masthead.coverVersion || "v1_lama") === "v1_lama";
                  if (isV1Lama) {
                    return (
                      /* Versi Lama (Gambar 1): Strip Merah Solid dengan Judul Edisi Terpusat Tebal */
                      <div className="w-full bg-[#B71C1C] border-x border-b border-black py-1 px-3 flex items-center justify-between text-white text-xs font-serif shadow-xs group/edbar">
                        <div className="w-20 hidden sm:block">
                          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-red-200">
                            VERSI LAMA
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2 flex-1">
                          <span className="font-serif font-black text-sm tracking-widest uppercase drop-shadow-sm text-center">
                            {data.masthead.editionBadge || "EDISI OKTOBER 2026"}
                          </span>
                          {isEditorMode && !isPrintTarget && onOpenHeaderModal && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenHeaderModal();
                              }}
                              className="opacity-80 hover:opacity-100 bg-black/40 hover:bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-sans font-bold text-white border border-white/40 cursor-pointer flex items-center gap-1 transition-all"
                              title="Klik untuk mengubah Judul Edisi pada Cover"
                            >
                              <Edit className="w-2.5 h-2.5 text-amber-300" />
                              <span>Ubah Edisi</span>
                            </button>
                          )}
                        </div>
                        <div className="w-28 flex justify-end">
                          {isEditorMode && !isPrintTarget && onUpdateCoverVersion && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateCoverVersion(pageIdx, "v2_baru");
                              }}
                              className="bg-black/50 hover:bg-black/80 text-[8.5px] font-sans font-bold px-2 py-0.5 rounded text-amber-300 border border-amber-300/40 cursor-pointer transition-all flex items-center gap-1"
                              title="Ganti Format Cover ke Versi Baru (Modern)"
                            >
                              <span>Versi Baru</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  /* Versi Baru (Existing Modern): Strip Oranye 3 Segmen */
                  return (
                    <div className="w-full bg-[#E65100] border-x border-b border-black py-0.5 px-3 flex items-center justify-between text-white text-xs font-serif shadow-xs group/edbar">
                      <span className="font-bold text-[10px] uppercase">
                        LEMBAR KHUSUS PERS &amp; INFORMASI PUBLIK
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm tracking-widest uppercase drop-shadow-sm">
                          {data.masthead.editionBadge || "EDISI CETAK"}
                        </span>
                        {isEditorMode && !isPrintTarget && onOpenHeaderModal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenHeaderModal();
                            }}
                            className="opacity-75 hover:opacity-100 bg-black/40 hover:bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-sans font-bold text-white border border-white/40 cursor-pointer flex items-center gap-1 transition-all"
                            title="Klik untuk mengubah Judul Edisi pada Cover"
                          >
                            <Edit className="w-2.5 h-2.5 text-amber-300" />
                            <span>Ubah Judul Edisi</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditorMode && !isPrintTarget && onUpdateCoverVersion && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateCoverVersion(pageIdx, "v1_lama");
                            }}
                            className="bg-black/50 hover:bg-black/80 text-[8.5px] font-sans font-bold px-1.5 py-0.5 rounded text-amber-300 border border-amber-300/40 cursor-pointer transition-all flex items-center gap-1"
                            title="Ganti Format Cover ke Versi Lama (Gambar 1)"
                          >
                            <ChevronLeft className="w-2.5 h-2.5" />
                            <span>Versi Lama</span>
                          </button>
                        )}
                        <span className="font-bold text-[10px] uppercase">
                          HALAMAN {page.pageNumber}
                        </span>
                      </div>
                    </div>
                  );
                })()
              )}
            </header>
          ) : (
            /* Sub-Page Running Header (Format Persis Gambar 2 dengan Header Judul yang Bisa Diedit Per Halaman) */
            <header className="w-full shrink-0 border border-black bg-[#E2E8F0] px-3 py-1 mb-1.5 flex items-center justify-between text-black font-serif shadow-xs">
              {/* Left: Page number and Newspaper Title */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-serif font-black text-sm text-black">
                  {page.pageNumber}
                </span>
                <span className="font-serif font-black text-sm uppercase tracking-wider text-black">
                  JURNAL POLISI
                </span>
              </div>

              {/* Center: Customizable Page Title (e.g. JENDELA REDAKSI) */}
              <div className="flex items-center gap-1.5 flex-1 max-w-sm justify-center mx-2">
                {isEditorMode && !isPrintTarget ? (
                  <div className="relative w-full flex items-center justify-center group/hdr">
                    <input
                      type="text"
                      value={page.runningHeader ?? "JENDELA REDAKSI"}
                      onChange={(e) => onUpdatePageHeader?.(pageIdx, e.target.value)}
                      className="w-full max-w-[280px] bg-white hover:bg-amber-50 focus:bg-white border border-stone-400 focus:border-red-600 rounded px-2.5 py-0.5 font-serif font-black text-xs sm:text-sm uppercase tracking-widest text-center text-black focus:outline-none focus:ring-1 focus:ring-red-600 transition-all shadow-inner"
                      placeholder="JUDUL HALAMAN (MISAL: JENDELA REDAKSI)"
                      title="Klik untuk mengedit Judul Header Halaman Ini (misal: JENDELA REDAKSI, BERITA DAERAH, dll)"
                    />
                    <Edit className="w-3 h-3 text-stone-400 absolute right-1 pointer-events-none group-hover/hdr:text-red-600" />
                  </div>
                ) : (
                  <span className="font-serif font-black text-xs sm:text-sm uppercase tracking-widest text-black text-center">
                    {page.runningHeader || "JENDELA REDAKSI"}
                  </span>
                )}
              </div>

              {/* Right: Edition info (e.g. Edisi Oktober 2026) */}
              <div className="text-right shrink-0">
                <span className="font-serif text-[11px] font-semibold text-black tracking-normal">
                  {data.masthead.editionBadge
                    ? data.masthead.editionBadge.replace(/^EDISI\s+/i, "Edisi ")
                    : "Edisi Oktober 2026"}
                </span>
              </div>
            </header>
          )}

          {/* ========================================================= */}
          {/* 2. DYNAMIC BLOCKS GRID (12-Columns Flexible Canvas) */}
          {/* ========================================================= */}
          <main
            className="flex-1 grid grid-cols-12 gap-1.5 overflow-hidden"
            style={{
              alignItems: "start",
              alignContent: "start",
            }}
          >
            {page.blocks.map((block, bIdx) => {
              const isDragging = draggedBlockIndex === bIdx;
              const isOver = dragOverIndex === bIdx;

              // Tailored Tailwind col-span classes
              const colClass = getColSpanClass(block.colSpan);

              return (
                <div
                  key={block.id || bIdx}
                  draggable={isEditorMode && !resizing}
                  onDragStart={(e) => handleDragStart(e, bIdx)}
                  onDragOver={(e) => handleDragOver(e, bIdx)}
                  onDrop={(e) => handleDrop(e, bIdx)}
                  onDragEnd={handleDragEnd}
                  className={`newspaper-block-card ${colClass} relative rounded-xs border border-black overflow-hidden flex flex-col justify-between ${
                    resizing ? "" : "transition-all"
                  } group ${
                    isDragging ? "opacity-30 scale-95" : ""
                  } ${isOver ? "ring-2 ring-red-600 border-red-600 scale-[1.01]" : ""} ${
                    block.themeColor === "dark"
                      ? "bg-stone-900 text-white"
                      : block.themeColor === "orange"
                      ? "bg-[#FFF9F2] text-stone-900"
                      : block.themeColor === "blue"
                      ? "bg-[#D6EEFC] text-stone-950"
                      : block.themeColor === "red"
                      ? "bg-red-50/60 text-stone-950"
                      : "bg-white text-stone-900"
                  }`}
                  style={{
                    alignSelf: "start",
                    height: block.customHeight ? `${block.customHeight}px` : "fit-content",
                    maxHeight: block.customHeight ? `${block.customHeight}px` : undefined,
                    minHeight: block.customHeight
                      ? `${block.customHeight}px`
                      : block.type === "hero_greeting"
                      ? "175px"
                      : block.type === "photo_story"
                      ? "70px"
                      : "85px",
                  }}
                >
                  {/* EDITOR CONTROLS HEADER (Clean docked top bar, never clips or overlaps content) */}
                  {isEditorMode && !isPrintTarget && (
                    <div className="w-full bg-stone-900/95 text-white flex items-center justify-between px-1.5 py-0.5 border-b border-black text-[9px] select-none shrink-0 z-20">
                      {/* Left: Drag Handle, Step Reorder & Span +/- */}
                      <div className="flex items-center gap-1 font-mono">
                        <span
                          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-white/20 rounded"
                          title="Tahan &amp; Geser untuk Drag &amp; Drop posisi kotak"
                        >
                          <GripVertical className="w-3 h-3 text-amber-400" />
                        </span>
                        <div className="flex items-center">
                          <button
                            type="button"
                            disabled={bIdx === 0}
                            onClick={() => handleMoveBlockLeft(bIdx)}
                            className="hover:text-amber-300 disabled:opacity-25 disabled:cursor-not-allowed p-0.5 cursor-pointer"
                            title="Pindah urutan ke kiri/sebelum"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={bIdx === page.blocks.length - 1}
                            onClick={() => handleMoveBlockRight(bIdx, page.blocks.length)}
                            className="hover:text-amber-300 disabled:opacity-25 disabled:cursor-not-allowed p-0.5 cursor-pointer"
                            title="Pindah urutan ke kanan/sesudah"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-0.5 bg-black/60 px-1 py-0.2 rounded text-[8.5px]">
                          <button
                            type="button"
                            onClick={() => handleSetSpan(block.id, Math.max(2, block.colSpan - 1))}
                            className="hover:text-amber-300 px-0.5 font-bold cursor-pointer"
                            title="Perkecil lebar"
                          >
                            -
                          </button>
                          <span className="font-bold text-amber-300">{block.colSpan}/12</span>
                          <button
                            type="button"
                            onClick={() => handleSetSpan(block.id, Math.min(12, block.colSpan + 1))}
                            className="hover:text-amber-300 px-0.5 font-bold cursor-pointer"
                            title="Perbesar lebar"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Auto Fill Row Space button if remainingRowSpan > 0 */}
                        {remainingRowSpan > 0 && bIdx === page.blocks.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleExpandBlock(block, remainingRowSpan)}
                            className="px-1 py-0.5 bg-emerald-600 hover:bg-emerald-500 rounded text-[8px] font-bold text-white whitespace-nowrap leading-none flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title={`Perluas kotak ini +${remainingRowSpan} kolom untuk mengisi penuh ruang kosong di baris ini`}
                          >
                            <Maximize2 className="w-2.5 h-2.5 shrink-0" />
                            <span>+ Isi Baris</span>
                          </button>
                        )}

                        {block.image && block.type === "text_columns" && (
                          <button
                            type="button"
                            onClick={() => handleCycleImagePosition(block)}
                            className="px-1 py-0.5 bg-amber-600 hover:bg-amber-500 rounded text-[8px] font-bold text-white whitespace-nowrap leading-none flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title={`Tata Letak Gambar & Teks: saat ini Foto di ${
                              block.imagePosition === "top"
                                ? "Atas (Full)"
                                : block.imagePosition === "right"
                                ? "Kanan"
                                : block.imagePosition === "bottom"
                                ? "Bawah"
                                : "Kiri"
                            }. Klik untuk memindahkan posisi gambar & teks secara dinamis!`}
                          >
                            <Layout className="w-2.5 h-2.5 shrink-0" />
                            <span>
                              {block.imagePosition === "top"
                                ? "Foto Atas"
                                : block.imagePosition === "right"
                                ? "Foto Kanan"
                                : block.imagePosition === "bottom"
                                ? "Foto Bawah"
                                : "Foto Kiri"}
                            </span>
                          </button>
                        )}

                        {block.type === "text_columns" && (
                          <button
                            type="button"
                            onClick={() => handleCycleColumns(block)}
                            className="px-1 py-0.5 bg-red-700 hover:bg-red-600 rounded text-[8px] font-bold text-white whitespace-nowrap leading-none flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title={`Format Kolom: saat ini ${block.textColumns || 1} Kolom (Klik untuk rotasi 1-4 kolom koran)`}
                          >
                            <Columns className="w-2.5 h-2.5 shrink-0" />
                            <span>{block.textColumns || 1} Kol</span>
                          </button>
                        )}

                        {block.type === "text_columns" && (
                          <button
                            type="button"
                            onClick={() => handleCycleFontSize(block)}
                            className="px-1 py-0.5 bg-stone-700 hover:bg-stone-600 rounded text-[8px] font-bold text-white whitespace-nowrap leading-none flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title={`Ukuran Teks Naskah: ${block.fontSize || "xs"} (Klik untuk mengganti ukuran teks agar mengisi ruang kosong)`}
                          >
                            <span>{block.fontSize === "base" ? "A+" : block.fontSize === "sm" ? "A" : "A-"}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenEditModal(pageIdx, block)}
                          className="p-0.5 hover:bg-white/20 rounded text-amber-300 transition-colors cursor-pointer"
                          title="Sunting Teks &amp; Foto Kotak Ini"
                        >
                          <Edit className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteBlock(pageIdx, block.id)}
                          className="p-0.5 hover:bg-red-700 rounded text-red-300 transition-colors cursor-pointer"
                          title="Hapus Kotak Ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MOUSE RESIZE HANDLES (Tarik dengan Kursor Mouse untuk Resize Section) */}
                  {isEditorMode && !isPrintTarget && (
                    <>
                      {/* Right Edge: Lebar Kolom (col-resize) */}
                      <div
                        onMouseDown={(e) => handleStartResizeWidth(e, pageIdx, block)}
                        className="absolute top-0 right-0 bottom-0 w-2 hover:w-3 cursor-col-resize hover:bg-amber-400/80 transition-all z-20 flex items-center justify-center group/resizeW select-none"
                        title="Tarik ke kanan/kiri dengan kursor mouse untuk mengubah lebar section"
                      >
                        <div className="w-0.5 h-6 bg-stone-400/60 group-hover/resizeW:bg-stone-950 rounded-full" />
                      </div>

                      {/* Bottom Edge: Tinggi Section (row-resize) */}
                      <div
                        onMouseDown={(e) => handleStartResizeHeight(e, pageIdx, block)}
                        className="absolute bottom-0 left-0 right-0 h-2 hover:h-3 cursor-row-resize hover:bg-amber-400/80 transition-all z-20 flex items-center justify-center group/resizeH select-none"
                        title="Tarik ke bawah/atas dengan kursor mouse untuk mengubah tinggi section"
                      >
                        <div className="h-0.5 w-8 bg-stone-400/60 group-hover/resizeH:bg-stone-950 rounded-full" />
                      </div>

                      {/* Corner Handle: Lebar & Tinggi Sekaligus (se-resize) */}
                      <div
                        onMouseDown={(e) => handleStartResizeBoth(e, pageIdx, block)}
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize bg-black/80 hover:bg-amber-500 text-amber-300 hover:text-black border-t border-l border-white/60 rounded-tl-xs z-30 flex items-center justify-center select-none shadow-sm"
                        title="Tarik sudut ini dengan kursor mouse untuk resize lebar &amp; tinggi section"
                      >
                        <Maximize2 className="w-2 h-2" />
                      </div>
                    </>
                  )}

                  {/* ───────────────────────────────────────────────────────── */}
                  {/* BLOCK VARIANT 1: HERO GREETING (Seperti Tokoh Kapolda/Kapolri) */}
                  {/* ───────────────────────────────────────────────────────── */}
                  {block.type === "hero_greeting" && (
                    <div className="relative w-full flex-1 flex flex-col justify-end overflow-hidden p-2.5 min-h-[175px]">
                      {/* Photo Background */}
                      <div className="absolute inset-0">
                        <Image
                          src={block.image || "/images/ads/iklan-bunga.jpeg"}
                          alt={block.name || block.title}
                          fill
                          sizes="500px"
                          className="object-cover object-top"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                      </div>

                      {/* Gold Emblem */}
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <div className="w-7 h-7 rounded-full bg-amber-400 border border-white flex items-center justify-center text-stone-900 shadow-md">
                          <Shield className="w-4 h-4 fill-amber-700 text-amber-900" />
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="relative z-10 text-center space-y-0.5">
                        <p
                          className="font-serif italic text-amber-300 text-xl font-bold tracking-wide drop-shadow-md"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {block.greeting || block.title}
                        </p>
                        <h2 className="font-serif font-extrabold text-xs text-white uppercase tracking-tight leading-snug drop-shadow-md">
                          {block.name || "NAMA PEJABAT / TOKOH"}
                        </h2>
                        <div className="pt-0.5">
                          <span className="text-[8px] text-amber-200 block uppercase font-bold tracking-wider">
                            {block.positionPrefix || "SEBAGAI"}
                          </span>
                          <div className="flex items-center justify-center gap-1 my-0.2">
                            <span className="text-amber-400 text-xs">❦</span>
                            <span className="font-serif font-black text-sm text-amber-300 uppercase tracking-widest drop-shadow-sm">
                              {block.position || "JABATAN RESMI"}
                            </span>
                            <span className="text-amber-400 text-xs">❦</span>
                          </div>
                          <span className="text-[7.5px] text-stone-200 block uppercase font-semibold tracking-wide">
                            {block.positionSub || "INSTITUSI / KESATUAN"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ───────────────────────────────────────────────────────── */}
                  {/* BLOCK VARIANT 2: PHOTO STORY (Berita Foto Berantai) */}
                  {/* ───────────────────────────────────────────────────────── */}
                  {block.type === "photo_story" && (
                    <div className="relative w-full flex-1 flex flex-col justify-end overflow-hidden min-h-[70px]">
                      <div className="absolute inset-0">
                        <Image
                          src={block.image || "/images/ads/iklan-bunga.jpeg"}
                          alt={block.title}
                          fill
                          sizes="300px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                      </div>
                      <div
                        className={`relative z-10 p-1 border-t border-black ${
                          block.themeColor === "blue"
                            ? "bg-[#0B3C5D]/90 backdrop-blur-xs text-white"
                            : block.themeColor === "orange"
                            ? "bg-[#E65100]/90 backdrop-blur-xs text-white"
                            : block.themeColor === "red"
                            ? "bg-red-800/90 backdrop-blur-xs text-white"
                            : "bg-black/85 backdrop-blur-xs text-white"
                        }`}
                      >
                        <p className="text-[8px] font-serif font-bold text-white line-clamp-2 leading-tight drop-shadow-xs">
                          {block.title}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ───────────────────────────────────────────────────────── */}
                  {/* BLOCK VARIANT 3: MULTI-COLUMN TEXT ARTICLE (Khas Koran) */}
                  {/* ───────────────────────────────────────────────────────── */}
                  {block.type === "text_columns" && block.type !== "redaksi_box" && !block.id.includes("redaksi-box") && (() => {
                    const imgPos = block.imagePosition || "left";
                    const isTop = imgPos === "top";
                    const isRight = imgPos === "right";
                    const isBottom = imgPos === "bottom";

                    const fontClass =
                      block.fontSize === "base"
                        ? "text-[9.5px] leading-[1.35]"
                        : block.fontSize === "sm"
                        ? "text-[8.5px] leading-[1.3]"
                        : "text-[7.5px] leading-[1.25]";

                    const isBlueTheme = block.themeColor === "blue";
                    const isOrangeTheme = block.themeColor === "orange";
                    const isRedTheme = block.themeColor === "red";
                    const isDarkTheme = block.themeColor === "dark";

                    return (
                      <div
                        className={`flex flex-col justify-between overflow-hidden flex-1 w-full ${
                          isBlueTheme
                            ? "bg-[#D6EEFC] text-stone-950"
                            : isOrangeTheme
                            ? "bg-[#FFF9F2] text-stone-900"
                            : isRedTheme
                            ? "bg-red-50/50 text-stone-950"
                            : isDarkTheme
                            ? "bg-stone-900 text-white"
                            : "bg-white text-stone-900"
                        }`}
                      >
                        {/* Title Bar: Bedakan Versi Lama (Gambar 1: Kotak Biru Klasik) vs Versi Baru (Oranye) vs Putih (Gambar 2) */}
                        {isBlueTheme ? (
                          <div className="bg-[#85BDE6] border-b border-black px-2 py-1 shrink-0">
                            <h3 className="font-serif font-black text-[9.5px] text-black line-clamp-2 leading-tight uppercase tracking-tight">
                              {block.title}
                            </h3>
                          </div>
                        ) : isOrangeTheme ? (
                          <div className="bg-[#FA9805] border-b border-black p-1 shrink-0">
                            <h3 className="font-serif font-extrabold text-[9px] text-stone-900 line-clamp-2 leading-tight uppercase">
                              {block.title}
                            </h3>
                          </div>
                        ) : isRedTheme ? (
                          <div className="bg-red-700 border-b border-black p-1 shrink-0">
                            <h3 className="font-serif font-extrabold text-[9px] text-white line-clamp-2 leading-tight uppercase">
                              {block.title}
                            </h3>
                          </div>
                        ) : isDarkTheme ? (
                          <div className="bg-black border-b border-stone-800 p-1 shrink-0">
                            <h3 className="font-serif font-extrabold text-[9px] text-amber-300 line-clamp-2 leading-tight uppercase">
                              {block.title}
                            </h3>
                          </div>
                        ) : (
                          <div className="bg-white border-b border-black px-2 py-1 shrink-0 text-center">
                            <h3 className="font-serif font-black text-[9.5px] text-black line-clamp-2 leading-snug">
                              {block.title}
                            </h3>
                          </div>
                        )}

                        {/* Content Body with Dynamic Image Placement */}
                        <div
                          className={`p-1.5 flex flex-1 overflow-hidden gap-1.5 min-h-0 ${
                            isTop
                              ? "flex-col"
                              : isBottom
                              ? "flex-col-reverse"
                              : isRight
                              ? "flex-row-reverse items-start"
                              : "flex-row items-start"
                          }`}
                        >
                          {block.image && (
                            <div
                              className={`relative shrink-0 rounded-xs overflow-hidden border border-black bg-stone-200 group/img ${
                                isTop || isBottom ? "w-full" : ""
                              }`}
                              style={{
                                width: isTop || isBottom ? "100%" : `${block.imageWidth || 64}px`,
                                height: isTop || isBottom
                                  ? `${block.imageHeight || 85}px`
                                  : `${block.imageHeight || 56}px`,
                                minWidth: isTop || isBottom ? "100%" : "40px",
                                minHeight: "35px",
                              }}
                            >
                              <Image
                                src={block.image}
                                alt={block.title}
                                fill
                                sizes={isTop || isBottom ? "450px" : "200px"}
                                className="object-cover"
                              />

                              {/* Image Mouse Resize Handle */}
                              {isEditorMode && !isPrintTarget && (
                                isTop || isBottom ? (
                                  /* Horizontal row-resize handle for top/bottom full-width image */
                                  <div
                                    onMouseDown={(e) => handleStartResizeImageHeight(e, pageIdx, block)}
                                    className="absolute bottom-0 inset-x-0 h-2.5 hover:h-3.5 bg-amber-400/80 hover:bg-amber-500 cursor-row-resize z-20 flex items-center justify-center transition-all select-none shadow-xs"
                                    title="Tarik ke bawah/atas dengan kursor mouse untuk mengatur tinggi foto banner"
                                  >
                                    <div className="h-0.5 w-12 bg-black/70 rounded-full" />
                                  </div>
                                ) : (
                                  /* Corner resize handle for side image */
                                  <div
                                    onMouseDown={(e) => handleStartResizeImage(e, pageIdx, block)}
                                    className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 hover:bg-amber-300 border-t border-l border-black rounded-tl-xs cursor-se-resize z-20 flex items-center justify-center text-black shadow-xs select-none"
                                    title="Tarik sudut ini dengan kursor mouse untuk mengubah ukuran foto (Resize Gambar)"
                                  >
                                    <Maximize2 className="w-2 h-2 text-stone-900" />
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {/* Text Flow: Multi-column or Single, dynamically filling all remaining space */}
                          <div
                            className={`flex-1 w-full font-serif ${fontClass} text-justify text-stone-900 overflow-hidden min-h-0`}
                            style={{
                              columnCount: block.textColumns || (isTop || isBottom ? 2 : 1),
                              columnGap: "6px",
                              columnRule: "1px dotted #ccc",
                            }}
                          >
                            {block.content ||
                              "Belum ada isi naskah berita. Klik tombol sunting atau pilih berita dari portal untuk mengisi naskah berita lengkap di bagian ini."}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ───────────────────────────────────────────────────────── */}
                  {/* BLOCK VARIANT 4: AD BANNER / SPONSOR */}
                  {/* ───────────────────────────────────────────────────────── */}
                  {block.type === "ad_banner" && (
                    <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden bg-amber-50 p-1 min-h-[50px]">
                      {block.image ? (
                        <div className="relative w-full h-full min-h-[50px]">
                          <Image
                            src={block.image}
                            alt={block.title}
                            fill
                            sizes="400px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-2">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-amber-800 block">
                            SLOT IKLAN SPONSOR MITRA
                          </span>
                          <span className="text-[7px] text-stone-500">
                            {block.title || "Toko Bunga / Karangan Bunga Ucapan"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ───────────────────────────────────────────────────────── */}
                  {/* BLOCK VARIANT 5: BOKS SUSUNAN REDAKSI (Koran Klasik Sesuai Gambar 2) */}
                  {/* ───────────────────────────────────────────────────────── */}
                  {(block.type === "redaksi_box" || block.id.includes("redaksi-box") || block.title.toLowerCase().includes("susunan redaksi")) && (
                    <div className="flex flex-col bg-white border border-black p-1.5 h-full overflow-hidden text-black font-sans select-text justify-between">
                      {/* 1. Header Masthead Logo in Black & White */}
                      <div className="relative w-full border border-black overflow-hidden bg-black mb-1 p-1 shrink-0">
                        <div className="relative w-full h-8 aspect-[329/92] mx-auto filter grayscale contrast-125">
                          <Image
                            src="/images/logo-hd.webp"
                            alt="Jurnal Polisi B&W"
                            fill
                            sizes="200px"
                            className="object-contain"
                          />
                        </div>
                      </div>

                      {/* 2. Legal / Registration Info */}
                      <div className="text-[6.5px] leading-[1.2] text-center font-serif border-b border-black/40 pb-1 mb-0.5 shrink-0">
                        <p className="font-bold">Terbit berdasarkan : UU Pokok Pers No. 40 Tahun 1999</p>
                        <p className="font-extrabold uppercase tracking-wide">PT. MEDIA JURNAL PERS</p>
                        <p>Nomor : AHU-00027.AH.01.01.TAHUN 2017 - NPWP : 95.994.024.0-424.000</p>
                        <p className="font-bold">VERIFIKASI DEWAN PERS INDONESIA SPRI</p>
                        <p>NO : 153/Sert-Pers-SPRI/X/2021</p>
                      </div>

                      {/* 3. Rounded Pill: SUSUNAN REDAKSI */}
                      <div className="text-center my-0.5 shrink-0">
                        <span className="inline-block border border-black rounded-full px-2.5 py-0.2 text-[6.8px] font-sans font-black tracking-wider bg-stone-100 uppercase">
                          SUSUNAN REDAKSI :
                        </span>
                      </div>

                      {/* 4. Editorial Staff Hierarchy */}
                      <div className="flex-1 overflow-hidden text-[6px] leading-[1.18] font-sans space-y-0.5 text-center">
                        <div>
                          <p className="font-bold text-[6.5px] text-black">DEWAN PEMBINA :</p>
                          <p className="text-stone-800">Irjen Pol. (Purn.) Anton Charliyan, Brigjen TNI Syahnan, Rahmatono Saputra, Didik Wibowo, Ams Rahoma, Andi C. Momon, N.Ag</p>
                        </div>

                        <div>
                          <p className="font-bold text-[6.5px] text-black">DEWAN PENASEHAT :</p>
                          <p className="text-stone-800">Irjen Pol. (Purn.) Anton Charliyan, Brigjen TNI Syahnan, Levi Ahimaya, Romy Kasnadi, Yentry Agung Sudaryo, Hilman Muslim, Gaspar Santika</p>
                        </div>

                        <div className="grid grid-cols-2 gap-0.5 text-[6px] text-left">
                          <div>
                            <p className="font-bold text-black">PENASEHAT HUKUM :</p>
                            <p>Adv. Ade Rusmana, S.H.</p>
                            <p>Sadriyah Nur Quryadi, S.H.</p>
                            <p>Muhammad Rizal Tanjung</p>
                          </div>
                          <div>
                            <p className="font-bold text-black">PENANGGUNG JAWAB :</p>
                            <p>Gronaldi, Royan</p>
                            <p className="font-bold text-black mt-0.5">PIMPINAN UMUM :</p>
                            <p>Herrydi Suryanegara</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-0.5 text-[6px] text-left">
                          <div>
                            <p className="font-bold text-black">BENDAHARA UMUM :</p>
                            <p>Indriyani</p>
                            <p className="font-bold text-black mt-0.5">PIMPINAN PERUSAHAAN :</p>
                            <p>Herrydi Suryanegara</p>
                          </div>
                          <div>
                            <p className="font-bold text-black">PIMPINAN REDAKSI :</p>
                            <p>Gronaldi</p>
                            <p className="font-bold text-black mt-0.5">WAKIL PIMPINAN REDAKSI :</p>
                            <p>Romi Sartono</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-0.5 text-[6px] text-left">
                          <div>
                            <p className="font-bold text-black">REDAKTUR PELAKSANA :</p>
                            <p>Cecep Supriyadi</p>
                          </div>
                          <div>
                            <p className="font-bold text-black">SEKRETARIS REDAKSI :</p>
                            <p>Syamsuhadi Nugraha</p>
                          </div>
                        </div>

                        <div className="text-left">
                          <p className="font-bold text-black">STAFF REDAKSI :</p>
                          <p>Iwan Supriana, Zainal Arifin Lani</p>
                        </div>

                        <div className="text-left">
                          <p className="font-bold text-black">KEPALA PERWAKILAN :</p>
                          <p className="line-clamp-3">
                            Fery Melinda (Jabar), Uko Susanto (Jateng), Deddy Nuroyanto (Jatim), Bambang Kuncoro (Jateng), Ramdani M. Syari&apos;i (DKI), Saham Sihombing, S.Pd., M.Pd. (Sumut), Maswito Siregar (Sumut), Andi Sulaeman (Sulawesi), Jafrizal (Aceh), Edi Syafrizal (Kepri), Jasmadi Tarman (Bengkulu), Jafriadi (Sumbar), Samsul Rizal (Jambi), Sukardi (Kalbar), Yugo Munthe (Babel), Kiki (Banten).
                          </p>
                        </div>

                        <div className="text-left">
                          <p className="font-bold text-black">TIM INVESTIGASI NASIONAL :</p>
                          <p className="line-clamp-2">
                            Syamsuhadi Nugraha, Abdul Mujid, Daniel DA Samuel, Slamet Kurniawan, Zaenal, Abdul Rahman, Yusuf Humaera, Andi Muhammad A, Desta Diki M, Dini Iskandar, Toni Hidayat, Rajak, Doni Anggara, Muchtar, S.Pd., Cecep Solihin, Abdul Manaf, Irawan, Boni Hasoloan Sitorus.
                          </p>
                        </div>

                        <div className="text-left">
                          <p className="font-bold text-black">WARTAWAN :</p>
                          <p className="line-clamp-2">
                            Sripudin, Jumadi, Arfika Novel Wijaya, Iwan Syahputra, Lina Nomi, Deni Kiki, Dini, Rustamaji, Didin Sahidin, Aan Sunanto, Yayat Hidayat, Yanto Kasianto, Heru Hidayat, Dede Sujana, Sahat Rony, David Bambang, Karno Yusuf Saputra, Drs. Hasrul F. Siregar, Irham, Darmawan Santoso, Yanir, Rikiy, Jafrianto, Abdulah DZ.
                          </p>
                        </div>
                      </div>

                      {/* 5. Rounded Pill: ALAMAT KANTOR REDAKSI PUSAT */}
                      <div className="text-center my-0.5 border-t border-black/30 pt-0.5 shrink-0">
                        <span className="inline-block border border-black rounded-full px-2 py-0.2 text-[6.5px] font-sans font-black tracking-wider bg-stone-100 uppercase">
                          ALAMAT KANTOR REDAKSI PUSAT :
                        </span>
                      </div>

                      {/* 6. Office Address Info */}
                      <div className="text-[5.8px] leading-[1.2] text-center font-serif shrink-0">
                        <p>Jl. Raya Jatinangor No. 53 RT.01/RW.01 Cisempur, Kec. Jatinangor, Kab. Sumedang, Jawa Barat.</p>
                        <p className="font-bold">HP : 081120008418 – 089608144118</p>
                        <p>Rek. Bank BRI 4317-01-004.604-532 An: Indriyani</p>
                        <p className="font-sans">E-mail: jurnalpolisi73@gmail.com</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ========================================================= */}
            {/* GHOST / EMPTY SLOT FOR FILLING REMAINING ROW SPACE */}
            {/* ========================================================= */}
            {isEditorMode && !isPrintTarget && remainingRowSpan > 0 && (
              <div
                className={`${getColSpanClass(
                  remainingRowSpan
                )} border-2 border-dashed border-amber-400 bg-amber-50/85 rounded-lg p-2.5 flex flex-col items-center justify-center text-center transition-all min-h-[75px] shadow-xs select-none`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Plus className="w-4 h-4 text-amber-700 animate-bounce" />
                  <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-tight">
                    Ruang Kosong Tersedia ({remainingRowSpan}/12 Kolom)
                  </span>
                </div>
                <p className="text-[8px] text-stone-600 mb-1.5 max-w-xs">
                  Pilih konten langsung untuk mengisi kekosongan tata letak:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAddBlock(pageIdx, "text_columns", remainingRowSpan)}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[8.5px] font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-transform hover:scale-105"
                    title="Tambahkan berita naskah teks multi-kolom yang mengisi tepat ruang kosong ini"
                  >
                    <Columns className="w-2.5 h-2.5" />
                    <span>+ Teks Kolom</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddBlock(pageIdx, "photo_story", remainingRowSpan)}
                    className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-[8.5px] font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-transform hover:scale-105"
                    title="Tambahkan berita foto dokumentasi yang mengisi tepat ruang kosong ini"
                  >
                    <ImageIcon className="w-2.5 h-2.5" />
                    <span>+ Foto Story</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAddModal(pageIdx, remainingRowSpan)}
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-900 text-amber-300 rounded text-[8.5px] font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-transform hover:scale-105"
                    title="Buka form kustom lengkap"
                  >
                    <Edit className="w-2.5 h-2.5" />
                    <span>+ Kustom Form</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Add Section Button */}
            {isEditorMode && !isPrintTarget && (
              <div
                className="col-span-12 border-2 border-dashed border-red-300 bg-red-50/50 hover:bg-red-50 hover:border-[#E50914] rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer transition-all mt-1"
                onClick={() => onOpenAddModal(pageIdx, 6)}
              >
                <Plus className="w-4 h-4 text-[#E50914]" />
                <span className="text-[10px] font-bold text-[#7F0000]">
                  + Tambah Kotak Section Baru ke Halaman Ini (Gambar, Berita Kolom, atau Tokoh)
                </span>
              </div>
            )}
          </main>

          {/* ========================================================= */}
          {/* 3. FOOTER STRIP */}
          {/* ========================================================= */}
          <footer className="w-full shrink-0 border-t border-black pt-0.5 mt-1 flex items-center justify-between text-[7px] font-mono text-stone-600">
            <span>TERBIT BERDASARKAN UU POKOK PERS NO. 40 TAHUN 1999 • VERIFIKASI DEWAN PERS</span>
            <span>JURNAL POLISI RESMI • HALAMAN {page.pageNumber}</span>
          </footer>
        </div>
      </div>
    );
  };

  return (
    <div className="newspaper-print-container flex flex-col items-center">
      {/* SCREEN VIEW: Render the currently active page */}
      <div className="screen-only-canvas w-full flex justify-center overflow-x-auto pb-8">
        {renderPageSheet(currentPage, activePageIndex, false)}
      </div>

      {/* PRINT VIEW: Render ALL pages sequentially for browser printing */}
      <div className="hidden print:block print:w-full">
        {data.pages.map((p, idx) => renderPageSheet(p, idx, true))}
      </div>

      {/* Exact A4 Print Stylesheet with Page Breaks and Grayscale */}
      <style jsx global>{`
        .newspaper-grayscale {
          filter: grayscale(100%) contrast(108%);
          -webkit-filter: grayscale(100%) contrast(108%);
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .newspaper-print-container,
          .newspaper-print-container * {
            visibility: visible !important;
          }
          .screen-only-canvas {
            display: none !important;
          }
          .newspaper-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-only-page {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 4mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .newspaper-grayscale {
            filter: grayscale(100%) contrast(108%) !important;
            -webkit-filter: grayscale(100%) contrast(108%) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
