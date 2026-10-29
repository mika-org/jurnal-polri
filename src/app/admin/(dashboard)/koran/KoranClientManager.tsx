"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  Printer,
  Save,
  Upload,
  RefreshCw,
  Plus,
  Check,
  Newspaper,
  Layout,
  Sliders,
  ExternalLink,
  Trash2,
  FileCheck,
  Columns,
  Sparkles,
  Layers,
  ChevronRight,
  Maximize2,
  Copy,
  Edit,
  X,
  FileText,
  ImageIcon,
  Shield,
  BookOpen,
} from "lucide-react";
import NewspaperA4Canvas from "@/components/admin/koran/NewspaperA4Canvas";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  type NewspaperBlock,
  type NewspaperPage,
  type MultiPageNewspaperData,
  DEFAULT_MULTIPAGE_DATA,
  parseNewspaperData,
  COVER_PRESET_V1_LAMA,
  COVER_PRESET_V2_BARU,
  PAGE_2_PRESET_JENDELA_REDAKSI,
} from "@/components/admin/koran/NewspaperTypes";
import {
  simpanEdisiKoran,
  hapusEdisiKoran,
  ambilSemuaEdisiKoran,
} from "@/app/actions/koran";

interface PortalArticleOption {
  id: string;
  judul: string;
  slug: string;
  gambar_sampul: string;
  ringkasan: string;
  kategori: { nama: string };
}

interface SavedEdition {
  id: string;
  judul: string;
  nomor_edisi: string | null;
  data_layout: string;
  created_at: Date | string;
}

interface KoranClientManagerProps {
  initialEditions: SavedEdition[];
  portalArticles: PortalArticleOption[];
}

export default function KoranClientManager({
  initialEditions,
  portalArticles,
}: KoranClientManagerProps) {
  const [editions, setEditions] = useState<SavedEdition[]>(initialEditions);
  const [currentEditionId, setCurrentEditionId] = useState<string | null>(
    initialEditions[0]?.id || null
  );

  // Initialize data with multi-page parser
  const [newspaperData, setNewspaperData] = useState<MultiPageNewspaperData>(() =>
    parseNewspaperData(initialEditions[0]?.data_layout)
  );

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [activeViewTab, setActiveViewTab] = useState<"editor" | "archive">("editor");
  const [isEditorMode, setIsEditorMode] = useState<boolean>(true);
  const [previewScale, setPreviewScale] = useState<number>(75); // percent
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<{
    pageIndex: number;
    defaultSpan: number;
  } | null>(null);

  const [editingBlock, setEditingBlock] = useState<{
    pageIndex: number;
    block: NewspaperBlock;
  } | null>(null);

  const [isPortalPickerOpen, setIsPortalPickerOpen] = useState<boolean>(false);

  // Header Image Configuration State (Khusus Memasukkan Gambar Header Saja)
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState<boolean>(false);
  const [headerImageInput, setHeaderImageInput] = useState<string>(
    newspaperData.masthead.image || "/images/header-koran-default.webp"
  );
  const [headerEditionInput, setHeaderEditionInput] = useState<string>(
    newspaperData.masthead.editionBadge || "EDISI NOVEMBER 2026"
  );
  const [headerShowEditionBar, setHeaderShowEditionBar] = useState<boolean>(
    newspaperData.masthead.showEditionBar !== false
  );
  const [headerUploading, setHeaderUploading] = useState<boolean>(false);

  const handleOpenHeaderModal = () => {
    setHeaderImageInput(newspaperData.masthead.image || "/images/header-koran-default.webp");
    setHeaderEditionInput(newspaperData.masthead.editionBadge || "EDISI NOVEMBER 2026");
    setHeaderShowEditionBar(newspaperData.masthead.showEditionBar !== false);
    setIsHeaderModalOpen(true);
  };

  const handleHeaderFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeaderUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        setHeaderImageInput(data.url);
      } else {
        alert(data.error || "Gagal mengunggah gambar header");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat mengunggah gambar header");
    } finally {
      setHeaderUploading(false);
    }
  };

  const handleSaveHeader = () => {
    setNewspaperData((prev) => ({
      ...prev,
      masthead: {
        ...prev.masthead,
        image: headerImageInput,
        editionBadge: headerEditionInput,
        showEditionBar: headerShowEditionBar,
      },
    }));
    setIsHeaderModalOpen(false);
  };

  const handleResetDefaultHeader = () => {
    setHeaderImageInput("/images/header-koran-default.webp");
  };

  // Form state for creating / editing block
  const [formType, setFormType] = useState<NewspaperBlock["type"]>("text_columns");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formColSpan, setFormColSpan] = useState<number>(6);
  const [formTextColumns, setFormTextColumns] = useState<number>(2);
  const [formImagePosition, setFormImagePosition] = useState<"top" | "left" | "right" | "bottom">("top");
  const [formFontSize, setFormFontSize] = useState<"xs" | "sm" | "base">("xs");
  const [formGreeting, setFormGreeting] = useState("");
  const [formName, setFormName] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formPositionPrefix, setFormPositionPrefix] = useState("");
  const [formPositionSub, setFormPositionSub] = useState("");
  const [formThemeColor, setFormThemeColor] = useState<NewspaperBlock["themeColor"]>("orange");

  // Handle Print all pages
  const handlePrint = () => {
    window.print();
  };

  // Custom In-App Confirm Dialog State
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
    variant: "warning",
    action: async () => {},
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Handle Save As Draft
  const handleSaveDraft = () => {
    startTransition(async () => {
      try {
        const rawBadge = newspaperData.masthead.editionBadge || "EDISI CETAK";
        const draftTitle = rawBadge.startsWith("[DRAFT]") ? rawBadge : `[DRAFT] ${rawBadge}`;

        const payload = {
          id: currentEditionId || undefined,
          judul: draftTitle,
          data_layout: JSON.stringify({
            ...newspaperData,
            isDraft: true,
          }),
        };

        try {
          localStorage.setItem("koran_draft_saved", JSON.stringify(newspaperData));
        } catch {}

        const res = await simpanEdisiKoran(payload);
        if (res.success && res.edisi) {
          setCurrentEditionId(res.edisi.id);
          setSuccessMessage("Draft edisi koran berhasil disimpan ke basis data!");
          setTimeout(() => setSuccessMessage(""), 4000);
          ambilSemuaEdisiKoran().then(setEditions).catch(() => {});
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal menyimpan draft edisi koran");
      }
    });
  };

  // Handle Save Edition to PostgreSQL (Final / Terbit)
  const handleSaveEdition = () => {
    startTransition(async () => {
      try {
        const rawBadge = newspaperData.masthead.editionBadge || "EDISI CETAK";
        const cleanTitle = rawBadge.replace(/^\[DRAFT\]\s*/i, "");

        const payload = {
          id: currentEditionId || undefined,
          judul: cleanTitle,
          data_layout: JSON.stringify({
            ...newspaperData,
            isDraft: false,
          }),
        };
        const res = await simpanEdisiKoran(payload);
        if (res.success && res.edisi) {
          setCurrentEditionId(res.edisi.id);
          setSuccessMessage("Seluruh halaman koran final berhasil disimpan & diterbitkan!");
          setTimeout(() => setSuccessMessage(""), 4000);
          ambilSemuaEdisiKoran().then(setEditions).catch(() => {});
        }
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal menyimpan edisi koran");
      }
    });
  };

  // Buat lembar kerja edisi koran baru untuk edisi selanjutnya
  const handleCreateNewEdition = () => {
    setCurrentEditionId(null);
    const monthNames = [
      "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
      "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];
    const now = new Date();
    const nextMonthIdx = (now.getMonth() + 1) % 12;
    const nextYear = nextMonthIdx === 0 ? now.getFullYear() + 1 : now.getFullYear();
    const nextEditionBadge = `EDISI ${monthNames[nextMonthIdx]} ${nextYear}`;

    setNewspaperData({
      ...DEFAULT_MULTIPAGE_DATA,
      masthead: {
        ...DEFAULT_MULTIPAGE_DATA.masthead,
        editionBadge: nextEditionBadge,
      },
      isDraft: false,
      isGrayscale: false,
    });
    setActivePageIndex(0);
    setActiveViewTab("editor");
    setSuccessMessage(`Lembar kerja edisi baru "${nextEditionBadge}" berhasil dibuka! Silakan mulai menyusun halaman koran Anda.`);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  // Pilihan mengubah halaman menjadi hitam putih (B&W) atau berwarna
  const handleToggleGrayscale = (allPages = false) => {
    setNewspaperData((prev) => {
      if (allPages) {
        const nextVal = !prev.isGrayscale;
        return {
          ...prev,
          isGrayscale: nextVal,
          pages: prev.pages.map((p) => ({ ...p, isGrayscale: nextVal })),
        };
      }
      const pages = [...prev.pages];
      const curr = pages[activePageIndex];
      if (curr) {
        pages[activePageIndex] = {
          ...curr,
          isGrayscale: !curr.isGrayscale,
        };
      }
      return { ...prev, pages };
    });
  };

  // Muat edisi yang tersimpan ke editor untuk diedit kembali
  const handleLoadEdition = (ed: SavedEdition) => {
    setNewspaperData(parseNewspaperData(ed.data_layout));
    setCurrentEditionId(ed.id);
    setActivePageIndex(0);
    setActiveViewTab("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSuccessMessage(`Edisi "${ed.judul}" berhasil dimuat ke editor untuk diedit kembali!`);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  // Add a new A4 Page
  const handleAddPage = () => {
    const newPageNum = newspaperData.pages.length + 1;
    const defaultHeaders = [
      "JENDELA REDAKSI",
      "BERITA UTAMA",
      "HUKUM & KRIMINAL",
      "LIPUTAN DAERAH",
      "POLRES KITA",
      "OPINI & TAJUK",
    ];
    const defaultHeader =
      newPageNum === 2
        ? "JENDELA REDAKSI"
        : defaultHeaders[Math.min(newPageNum - 2, defaultHeaders.length - 1)] || "BERITA UTAMA";

    const newPage: NewspaperPage = {
      id: `page-${Date.now()}`,
      pageNumber: newPageNum,
      title: `Halaman ${newPageNum} - ${defaultHeader}`,
      showCoverMasthead: false,
      runningHeader: defaultHeader,
      isGrayscale: true, // Halaman isi format lama otomatis Hitam Putih!
      blocks: [
        {
          id: `block-${Date.now()}-1`,
          type: "text_columns",
          title: "Tajuk Berita Utama Daerah & Liputan Lapangan",
          content:
            "Tuliskan naskah berita lengkap di sini. Anda dapat mengatur naskah ini menjadi format 1, 2, 3, atau 4 kolom koran dengan mudah. Klik tombol sunting untuk memperbarui teks atau pilih dari artikel portal.",
          image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop",
          colSpan: 12,
          textColumns: 3,
          themeColor: "white",
        },
      ],
    };

    setNewspaperData((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));
    setActivePageIndex(newPageNum - 1);
  };

  // Remove a Page (Menggunakan ConfirmDialog)
  const handleDeletePage = (pageIdx: number) => {
    if (newspaperData.pages.length <= 1) {
      alert("Minimal edisi koran harus memiliki 1 halaman.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Hapus Halaman Koran",
      message: `Hapus Halaman ${pageIdx + 1}? Semua kotak section di halaman ini akan dihapus.`,
      confirmText: "Ya, Hapus Halaman",
      variant: "danger",
      action: async () => {
        setNewspaperData((prev) => {
          const updated = prev.pages.filter((_, idx) => idx !== pageIdx);
          const renumbered = updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
          return { ...prev, pages: renumbered };
        });
        setActivePageIndex(Math.max(0, pageIdx - 1));
      },
    });
  };

  // Toggle Cover Masthead on current page
  const handleToggleCoverMasthead = (pageIdx: number) => {
    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      if (pages[pageIdx]) {
        pages[pageIdx] = {
          ...pages[pageIdx],
          showCoverMasthead: !pages[pageIdx].showCoverMasthead,
        };
      }
      return { ...prev, pages };
    });
  };

  // Update Running Header per halaman (Judul Rubrik Halaman Sesuai Gambar 2)
  const handleUpdatePageHeader = (pageIdx: number, newHeader: string) => {
    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      if (pages[pageIdx]) {
        pages[pageIdx] = {
          ...pages[pageIdx],
          runningHeader: newHeader,
        };
      }
      return { ...prev, pages };
    });
  };

  // Update Versi Cover (Versi Lama / Gambar 1 vs Versi Baru / Modern)
  const handleUpdateCoverVersion = (pageIdx: number, version: "v1_lama" | "v2_baru") => {
    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      if (pages[pageIdx]) {
        pages[pageIdx] = {
          ...pages[pageIdx],
          coverVersion: version,
        };
      }
      return {
        ...prev,
        masthead: {
          ...prev.masthead,
          coverVersion: version,
        },
        pages,
      };
    });
  };

  // Terapkan Layout Format Section Cover Versi Lama (Gambar 1)
  const handleApplyCoverV1Lama = (pageIdx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Gunakan Format Cover Versi Lama (Gambar 1)",
      message:
        "Terapkan format cover Versi Lama (kotak section berita biru klasik & strip merah sesuai Gambar 1)? Kotak section di cover ini akan diperbarui.",
      confirmText: "Ya, Terapkan Versi Lama",
      variant: "warning",
      action: async () => {
        setNewspaperData((prev) => {
          const pages = [...prev.pages];
          if (pages[pageIdx]) {
            pages[pageIdx] = {
              ...pages[pageIdx],
              coverVersion: "v1_lama",
              blocks: JSON.parse(JSON.stringify(COVER_PRESET_V1_LAMA)),
            };
          }
          return {
            ...prev,
            masthead: {
              ...prev.masthead,
              coverVersion: "v1_lama",
            },
            pages,
          };
        });
        setSuccessMessage("Format Cover Versi Lama (Gambar 1) berhasil diterapkan!");
        setTimeout(() => setSuccessMessage(""), 4000);
      },
    });
  };

  // Terapkan Layout Format Section Cover Versi Baru (Modern)
  const handleApplyCoverV2Baru = (pageIdx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Gunakan Format Cover Versi Baru (Modern)",
      message:
        "Terapkan format cover Versi Baru (card modern oranye & 3 segmen badge)? Kotak section di cover ini akan diperbarui.",
      confirmText: "Ya, Terapkan Versi Baru",
      variant: "warning",
      action: async () => {
        setNewspaperData((prev) => {
          const pages = [...prev.pages];
          if (pages[pageIdx]) {
            pages[pageIdx] = {
              ...pages[pageIdx],
              coverVersion: "v2_baru",
              blocks: JSON.parse(JSON.stringify(COVER_PRESET_V2_BARU)),
            };
          }
          return {
            ...prev,
            masthead: {
              ...prev.masthead,
              coverVersion: "v2_baru",
            },
            pages,
          };
        });
        setSuccessMessage("Format Cover Versi Baru (Modern) berhasil diterapkan!");
        setTimeout(() => setSuccessMessage(""), 4000);
      },
    });
  };

  // Terapkan Edisi Format Lama Lengkap (Gambar 1 Cover + Gambar 2 Halaman Isi B&W)
  const handleApplyFullFormatLama = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Terapkan Format Lama (Gambar 1 & Gambar 2)",
      message:
        "Terapkan format edisi koran cetak klasik lengkap? Halaman 1 akan diatur sebagai Cover Klasik (Gambar 1) dan Halaman 2 sebagai Jendela Redaksi & Berita Hitam Putih (Gambar 2).",
      confirmText: "Ya, Terapkan Format Lama",
      variant: "warning",
      action: async () => {
        setNewspaperData((prev) => ({
          ...prev,
          masthead: {
            ...prev.masthead,
            coverVersion: "v1_lama",
            editionBadge: prev.masthead.editionBadge || "EDISI OKTOBER 2026",
          },
          pages: [
            {
              id: "page-1",
              pageNumber: 1,
              title: "Halaman 1 - Cover Utama",
              showCoverMasthead: true,
              coverVersion: "v1_lama",
              runningHeader: "JURNAL POLISI • EDISI KHUSUS MITRA POLRI & TNI",
              isGrayscale: false,
              blocks: JSON.parse(JSON.stringify(COVER_PRESET_V1_LAMA)),
            },
            {
              ...JSON.parse(JSON.stringify(PAGE_2_PRESET_JENDELA_REDAKSI)),
              id: "page-2",
              pageNumber: 2,
              isGrayscale: true,
            },
          ],
        }));
        setActivePageIndex(0);
        setSuccessMessage("Format Lama (Gambar 1 Cover & Gambar 2 Halaman Isi Hitam Putih) berhasil diterapkan!");
        setTimeout(() => setSuccessMessage(""), 5000);
      },
    });
  };

  // Update a block
  const handleUpdateBlock = (pageIdx: number, blockId: string, updates: Partial<NewspaperBlock>) => {
    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      const page = pages[pageIdx];
      if (!page) return prev;

      const blocks = page.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
      pages[pageIdx] = { ...page, blocks };
      return { ...prev, pages };
    });
  };

  // Delete a block
  const handleDeleteBlock = (pageIdx: number, blockId: string) => {
    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      const page = pages[pageIdx];
      if (!page) return prev;

      const blocks = page.blocks.filter((b) => b.id !== blockId);
      pages[pageIdx] = { ...page, blocks };
      return { ...prev, pages };
    });
  };

  // Reorder blocks (Drag & Drop)
  const handleReorderBlocks = (pageIdx: number, sourceIdx: number, destIdx: number) => {
    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      const page = pages[pageIdx];
      if (!page) return prev;

      const blocks = [...page.blocks];
      const [moved] = blocks.splice(sourceIdx, 1);
      blocks.splice(destIdx, 0, moved);

      pages[pageIdx] = { ...page, blocks };
      return { ...prev, pages };
    });
  };

  // Direct Add Block (e.g. from 1-click empty slot filling)
  const handleAddBlockDirect = (pageIndex: number, block: NewspaperBlock) => {
    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      const page = pages[pageIndex];
      if (!page) return prev;

      pages[pageIndex] = {
        ...page,
        blocks: [...page.blocks, block],
      };
      return { ...prev, pages };
    });
  };

  // Open Add Block Modal
  const handleOpenAddModal = (pageIdx: number, defaultSpan: number = 6) => {
    setFormType("text_columns");
    setFormTitle("");
    setFormContent("");
    setFormImage("");
    setFormColSpan(defaultSpan);
    setFormTextColumns(defaultSpan >= 6 ? 2 : 1);
    setFormImagePosition(defaultSpan >= 6 ? "top" : "left");
    setFormFontSize("xs");
    setFormGreeting("Selamat dan Sukses");
    setFormName("");
    setFormPosition("");
    setFormPositionPrefix("SEBAGAI");
    setFormPositionSub("");
    setFormThemeColor("orange");

    setIsAddModalOpen({ pageIndex: pageIdx, defaultSpan });
  };

  // Open Edit Block Modal
  const handleOpenEditModal = (pageIdx: number, block: NewspaperBlock) => {
    setFormType(block.type);
    setFormTitle(block.title || "");
    setFormContent(block.content || "");
    setFormImage(block.image || "");
    setFormColSpan(block.colSpan || 6);
    setFormTextColumns(block.textColumns || 2);
    setFormImagePosition(block.imagePosition || "left");
    setFormFontSize(block.fontSize || "xs");
    setFormGreeting(block.greeting || "Selamat dan Sukses");
    setFormName(block.name || "");
    setFormPosition(block.position || "");
    setFormPositionPrefix(block.positionPrefix || "SEBAGAI");
    setFormPositionSub(block.positionSub || "");
    setFormThemeColor(block.themeColor || "orange");

    setEditingBlock({ pageIndex: pageIdx, block });
  };

  // Save Add Block
  const handleSaveAddBlock = () => {
    if (!isAddModalOpen) return;
    const { pageIndex } = isAddModalOpen;

    const newBlock: NewspaperBlock = {
      id: `block-${Date.now()}`,
      type: formType,
      title: formTitle || "Judul Kotak Berita",
      content: formContent,
      image: formImage || undefined,
      colSpan: formColSpan,
      textColumns: formTextColumns,
      imagePosition: formImagePosition,
      fontSize: formFontSize,
      greeting: formGreeting,
      name: formName,
      position: formPosition,
      positionPrefix: formPositionPrefix,
      positionSub: formPositionSub,
      themeColor: formThemeColor,
    };

    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      const page = pages[pageIndex];
      if (!page) return prev;

      pages[pageIndex] = {
        ...page,
        blocks: [...page.blocks, newBlock],
      };
      return { ...prev, pages };
    });

    setIsAddModalOpen(null);
  };

  // Save Edit Block
  const handleSaveEditBlock = () => {
    if (!editingBlock) return;
    const { pageIndex, block } = editingBlock;

    handleUpdateBlock(pageIndex, block.id, {
      type: formType,
      title: formTitle,
      content: formContent,
      image: formImage || undefined,
      colSpan: formColSpan,
      textColumns: formTextColumns,
      imagePosition: formImagePosition,
      fontSize: formFontSize,
      greeting: formGreeting,
      name: formName,
      position: formPosition,
      positionPrefix: formPositionPrefix,
      positionSub: formPositionSub,
      themeColor: formThemeColor,
      customHeight: block.customHeight,
      imageWidth: block.imageWidth,
      imageHeight: block.imageHeight,
    });

    setEditingBlock(null);
  };

  // File upload with automated WebP compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        setFormImage(data.url);
      } else {
        alert(data.error || "Gagal mengunggah gambar");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  // Pick portal article into form
  const handleSelectPortalArticle = (art: PortalArticleOption) => {
    setFormTitle(art.judul);
    setFormContent(art.ringkasan);
    setFormImage(art.gambar_sampul);
    if (formType === "hero_greeting") {
      setFormName(art.judul);
    }
    setIsPortalPickerOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BANNER CARD */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-50 text-[#7F0000] border border-red-200">
              <Newspaper className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Pusat Desain &amp; Cetak Koran PDF Lembar A4
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Atur tata letak koran fleksibel multi-halaman: drag &amp; drop posisi, sesuaikan lebar kotak, isi ruang kosong, dan format teks 1-4 kolom.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tambah Koran Baru / Edisi Selanjutnya */}
          <button
            type="button"
            onClick={handleCreateNewEdition}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Buka lembar kerja baru untuk membuat edisi koran selanjutnya"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Koran / Edisi Selanjutnya</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF A4</span>
          </button>

          {/* Simpan Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border border-amber-300 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Simpan sebagai draft sementara tanpa menerbitkan"
          >
            {isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span>Simpan Draft</span>
          </button>

          {/* Simpan & Terbitkan Edisi Final */}
          <button
            type="button"
            onClick={handleSaveEdition}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-stone-50 text-stone-800 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border border-stone-200 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Simpan edisi final ke basis data"
          >
            {isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-stone-600" />
            )}
            <span>Simpan &amp; Terbitkan Edisi</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          {activeViewTab === "editor" && editions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveViewTab("archive")}
              className="text-xs text-emerald-800 underline font-bold hover:text-emerald-950 cursor-pointer"
            >
              Lihat Daftar Edisi &rarr;
            </button>
          )}
        </div>
      )}

      {/* Navigasi View Switcher: Kanvas Editor vs Daftar Edisi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewTab("editor")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === "editor"
                ? "bg-[#7F0000] text-white shadow-xs"
                : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Kanvas Editor Desain Koran</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab("archive")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewTab === "archive"
                ? "bg-[#7F0000] text-white shadow-xs"
                : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Daftar Arsip Edisi Koran</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeViewTab === "archive"
                  ? "bg-white text-[#7F0000]"
                  : "bg-stone-100 text-stone-700 border border-stone-200"
              }`}
            >
              {editions.length}
            </span>
          </button>
        </div>

        {/* Status Edisi Aktif Ringkas */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-stone-500 font-medium">Edisi Aktif:</span>
          <span className="font-black text-stone-900 uppercase">
            {newspaperData.masthead.editionBadge || "EDISI CETAK"}
          </span>
          {newspaperData.isDraft ? (
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
              DRAFT
            </span>
          ) : currentEditionId ? (
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              TERBIT
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
              EDISI BARU
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MULTI-PAGE SELECTOR & CONTROLLER BAR (Khusus Mode Editor) */}
      {/* ========================================================= */}
      {activeViewTab === "editor" && (
        <>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Page Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Halaman:</span>
            </span>

            {newspaperData.pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActivePageIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePageIndex === idx
                    ? "bg-[#7F0000] text-white shadow-xs"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                }`}
              >
                <span>Hal. {p.pageNumber}</span>
                {p.showCoverMasthead && (
                  <span className="text-[9px] bg-amber-400 text-black px-1 rounded font-black">
                    COVER
                  </span>
                )}
                {p.isGrayscale && (
                  <span className="text-[9px] bg-stone-900 text-white px-1 rounded font-mono">
                    B&amp;W
                  </span>
                )}
              </button>
            ))}

            {/* Add New Page Button */}
            <button
              type="button"
              onClick={handleAddPage}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-[#7F0000] border border-red-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Halaman Baru</span>
            </button>
          </div>

          {/* Mode Switch & Zoom Scale */}
          <div className="flex items-center gap-3">
            {/* Editor vs Preview Mode */}
            <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setIsEditorMode(true)}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  isEditorMode
                    ? "bg-[#E50914] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Mode Editor (Interaktif)
              </button>
              <button
                type="button"
                onClick={() => setIsEditorMode(false)}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  !isEditorMode
                    ? "bg-[#E50914] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Pratinjau Cetak Murni
              </button>
            </div>

            {/* Zoom Scale */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-600">
              <span>Zoom:</span>
              <div className="inline-flex rounded-lg bg-white border border-stone-200 p-0.5 text-xs font-bold shadow-2xs">
                {[60, 75, 85, 100].map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setPreviewScale(sc)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      previewScale === sc
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {sc}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Page Settings Bar */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-stone-800">
              Sedang Mengedit: Halaman {activePageIndex + 1} ({newspaperData.pages[activePageIndex]?.blocks.length || 0} Kotak Section)
            </span>

            {/* Quick Edit Judul Edisi Cover */}
            <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 font-bold text-[10.5px] whitespace-nowrap">Judul Edisi:</span>
              <input
                type="text"
                value={newspaperData.masthead.editionBadge || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewspaperData((prev) => ({
                    ...prev,
                    masthead: { ...prev.masthead, editionBadge: val },
                  }));
                }}
                placeholder="misal: EDISI OKTOBER 2026"
                className="bg-white border border-stone-300 rounded px-2 py-0.5 text-xs font-black text-stone-900 focus:outline-none focus:ring-1 focus:ring-red-500 w-44 sm:w-48 uppercase"
                title="Ketik untuk mengubah judul edisi langsung pada cover koran"
              />
            </div>

            {/* Cover: Pemilihan Format Gaya Versi Lama (Gambar 1) vs Versi Baru (Modern) */}
            {newspaperData.pages[activePageIndex]?.showCoverMasthead && (
              <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-0.5 rounded-lg border border-stone-200">
                <span className="text-stone-600 font-bold text-[10.5px] whitespace-nowrap">Format Cover:</span>
                <div className="inline-flex rounded-md bg-stone-200 p-0.5 text-[10.5px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleUpdateCoverVersion(activePageIndex, "v1_lama")}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      (newspaperData.pages[activePageIndex]?.coverVersion || newspaperData.masthead.coverVersion || "v1_lama") === "v1_lama"
                        ? "bg-[#B71C1C] text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                    title="Versi Lama: Strip Merah, Kotak Section Biru Klasik (Sesuai Gambar 1)"
                  >
                    Versi Lama (Gambar 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateCoverVersion(activePageIndex, "v2_baru")}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      (newspaperData.pages[activePageIndex]?.coverVersion || newspaperData.masthead.coverVersion) === "v2_baru"
                        ? "bg-[#E65100] text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                    title="Versi Baru: Strip Oranye 3 Segmen & Card Modern Oranye"
                  >
                    Versi Baru (Modern)
                  </button>
                </div>

                {/* Tombol Terapkan Layout Cepat */}
                {(newspaperData.pages[activePageIndex]?.coverVersion || newspaperData.masthead.coverVersion || "v1_lama") === "v1_lama" ? (
                  <button
                    type="button"
                    onClick={() => handleApplyCoverV1Lama(activePageIndex)}
                    className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                    title="Muat susunan kotak section khas Versi Lama (Gambar 1)"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                    <span>Terapkan Section Versi Lama</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyCoverV2Baru(activePageIndex)}
                    className="px-2 py-0.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-300 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                    title="Muat susunan kotak section modern Versi Baru"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-orange-600" />
                    <span>Terapkan Section Versi Baru</span>
                  </button>
                )}
              </div>
            )}

            {/* Sub-Page: Edit Judul Header Halaman Per Halaman (Sesuai Gambar 2) */}
            {!newspaperData.pages[activePageIndex]?.showCoverMasthead && (
              <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-0.5 rounded-lg border border-stone-200">
                <span className="text-stone-600 font-bold text-[10.5px] whitespace-nowrap flex items-center gap-1">
                  <Edit className="w-3 h-3 text-red-600" />
                  <span>Judul Header Halaman:</span>
                </span>
                <input
                  type="text"
                  value={newspaperData.pages[activePageIndex]?.runningHeader ?? "JENDELA REDAKSI"}
                  onChange={(e) => handleUpdatePageHeader(activePageIndex, e.target.value)}
                  placeholder="misal: JENDELA REDAKSI"
                  className="bg-white border border-stone-300 rounded px-2 py-0.5 text-xs font-black text-stone-900 focus:outline-none focus:ring-1 focus:ring-red-500 w-36 sm:w-44 uppercase"
                  title="Ketik untuk mengubah judul header di atas halaman ini (seperti pada Gambar 2)"
                />

                {/* Quick preset chips */}
                <div className="hidden lg:flex items-center gap-1">
                  {[
                    "JENDELA REDAKSI",
                    "BERITA UTAMA",
                    "HUKUM & KRIMINAL",
                    "LIPUTAN DAERAH",
                    "POLRES KITA",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleUpdatePageHeader(activePageIndex, chip)}
                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                        newspaperData.pages[activePageIndex]?.runningHeader === chip
                          ? "bg-red-700 text-white"
                          : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode Hitam Putih / Berwarna Toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleToggleGrayscale(false)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  newspaperData.pages[activePageIndex]?.isGrayscale
                    ? "bg-stone-900 text-white border-stone-950 shadow-xs"
                    : "bg-white hover:bg-stone-50 text-stone-800 border-stone-300"
                }`}
                title="Pilihan mengubah halaman ini menjadi Hitam Putih (B&W) atau Berwarna"
              >
                <Sparkles className={`w-3.5 h-3.5 ${newspaperData.pages[activePageIndex]?.isGrayscale ? "text-amber-400" : "text-stone-500"}`} />
                <span>
                  {newspaperData.pages[activePageIndex]?.isGrayscale
                    ? "Hal. Ini: Hitam Putih (B&W)"
                    : "Hal. Ini: Berwarna"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleGrayscale(true)}
                className="text-[10px] text-stone-500 hover:text-stone-900 font-semibold underline cursor-pointer"
                title="Terapkan Hitam Putih ke Seluruh Halaman Koran"
              >
                (Semua: {newspaperData.isGrayscale ? "B&W" : "Warna"})
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 hover:text-stone-900 font-medium select-none">
              <input
                type="checkbox"
                checked={newspaperData.pages[activePageIndex]?.showCoverMasthead || false}
                onChange={() => handleToggleCoverMasthead(activePageIndex)}
                className="rounded border-stone-300 text-red-600 focus:ring-red-500"
              />
              <span>Banner Header (Cover)</span>
            </label>

            {newspaperData.pages[activePageIndex]?.showCoverMasthead && (
              <button
                type="button"
                onClick={handleOpenHeaderModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Atur Gambar Header Koran"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Ubah Gambar Header</span>
              </button>
            )}
          </div>

          {newspaperData.pages.length > 1 && (
            <button
              type="button"
              onClick={() => handleDeletePage(activePageIndex)}
              className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer text-[11px]"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hapus Halaman Ini</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. A4 INTERACTIVE VISUAL CANVAS */}
      {/* ========================================================= */}
      <div className="bg-stone-200/70 p-6 rounded-2xl border border-stone-300 overflow-x-auto flex justify-center">
        <NewspaperA4Canvas
          data={newspaperData}
          activePageIndex={activePageIndex}
          isEditorMode={isEditorMode}
          scalePercent={previewScale}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onReorderBlocks={handleReorderBlocks}
          onOpenAddModal={handleOpenAddModal}
          onOpenEditModal={handleOpenEditModal}
          onOpenHeaderModal={handleOpenHeaderModal}
          onAddBlock={handleAddBlockDirect}
          onUpdatePageHeader={handleUpdatePageHeader}
          onUpdateCoverVersion={handleUpdateCoverVersion}
        />
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: TAMBAH KONTEN / SECTION BARU */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#E50914]" />
                <span>Tambah Kotak Section Baru ke Halaman {isAddModalOpen.pageIndex + 1}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action: Import from Portal News */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#7F0000]">Impor dari Berita Portal Jurnal Polisi</p>
                <p className="text-[11px] text-stone-600">Salin otomatis judul, ringkasan, dan foto dari database portal</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPortalPickerOpen(true)}
                className="px-3 py-1.5 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Pilih Berita Portal
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Type Selection */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tipe Kotak Section:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "text_columns", label: "Teks Kolom Koran", icon: Columns },
                    { id: "photo_story", label: "Berita Foto", icon: ImageIcon },
                    { id: "hero_greeting", label: "Banner Tokoh / Ucapan", icon: Shield },
                    { id: "ad_banner", label: "Slot Iklan Sponsor", icon: Sparkles },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormType(t.id as NewspaperBlock["type"])}
                      className={`p-2.5 rounded-lg border text-center font-bold text-[11px] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        formType === t.id
                          ? "bg-red-50 border-[#E50914] text-[#7F0000]"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700"
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ColSpan Width Selector */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Lebar Kotak (Grid Kolom):
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    { span: 3, label: "1/4 (3)" },
                    { span: 4, label: "1/3 (4)" },
                    { span: 6, label: "1/2 (6)" },
                    { span: 8, label: "2/3 (8)" },
                    { span: 9, label: "3/4 (9)" },
                    { span: 12, label: "Penuh (12)" },
                  ].map((s) => (
                    <button
                      key={s.span}
                      type="button"
                      onClick={() => setFormColSpan(s.span)}
                      className={`py-1.5 rounded border text-[11px] font-bold transition-colors cursor-pointer ${
                        formColSpan === s.span
                          ? "bg-[#7F0000] text-white border-red-900"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Columns & Dynamic Image Position Selector if type is text_columns */}
              {formType === "text_columns" && (
                <div className="space-y-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Format Kolom Teks Berita (Khas Koran):
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setFormTextColumns(col)}
                          className={`py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                            formTextColumns === col
                              ? "bg-[#E50914] text-white border-[#B91C1C]"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {col} Kolom Teks
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Photo & Text Flow Layout */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Tata Letak Posisi Foto &amp; Alur Teks Berita:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: "top",
                          title: "Foto di Atas (Full)",
                          desc: "Foto membentang penuh di atas, naskah teks di bawah",
                          icon: "⬆️",
                        },
                        {
                          id: "left",
                          title: "Foto di Kiri",
                          desc: "Foto di sisi kiri, naskah teks mengalir di sisi kanan",
                          icon: "⬅️",
                        },
                        {
                          id: "right",
                          title: "Foto di Kanan",
                          desc: "Foto di sisi kanan, naskah teks mengalir di sisi kiri",
                          icon: "➡️",
                        },
                        {
                          id: "bottom",
                          title: "Foto di Bawah (Full)",
                          desc: "Naskah teks di atas, foto membentang penuh di bawah",
                          icon: "⬇️",
                        },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setFormImagePosition(pos.id as "top" | "left" | "right" | "bottom")}
                          className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            formImagePosition === pos.id
                              ? "bg-amber-100 border-amber-600 ring-2 ring-amber-500/30 text-stone-900 font-bold shadow-xs"
                              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span>{pos.icon}</span>
                            <span>{pos.title}</span>
                          </div>
                          <p className="text-[9.5px] text-stone-500 mt-1 leading-tight">{pos.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size to Fill Space */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Ukuran Huruf Naskah (Membantu Mengisi Ruang Kosong):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "xs", label: "Kecil (7.5px)", sub: "Padat Khas Koran" },
                        { id: "sm", label: "Sedang (8.5px)", sub: "Standar Terbaca" },
                        { id: "base", label: "Besar (9.5px)", sub: "Mengisi Ruang Luas" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFormFontSize(f.id as "xs" | "sm" | "base")}
                          className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                            formFontSize === f.id
                              ? "bg-[#7F0000] text-white border-red-900 font-bold"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          <div className="text-xs font-bold">{f.label}</div>
                          <div className="text-[9.5px] opacity-80">{f.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pilihan Gaya Warna Tema Section (Bedakan Versi Lama vs Versi Baru) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Format Gaya Warna Section:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: "blue", label: "Biru Klasik", badge: "Versi Lama (Gambar 1)", bg: "bg-[#D6EEFC]", border: "border-blue-400" },
                    { id: "orange", label: "Oranye Modern", badge: "Versi Baru", bg: "bg-[#FA9805]", border: "border-orange-500" },
                    { id: "white", label: "Putih Bersih", badge: "Standar", bg: "bg-white", border: "border-stone-300" },
                    { id: "dark", label: "Gelap Elegan", badge: "Hitam Tokoh", bg: "bg-stone-900", border: "border-black" },
                    { id: "red", label: "Merah Presisi", badge: "Aksen Berita", bg: "bg-red-700", border: "border-red-800" },
                  ].map((tc) => (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => setFormThemeColor(tc.id as NewspaperBlock["themeColor"])}
                      className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        formThemeColor === tc.id
                          ? "ring-2 ring-red-600 border-red-600 bg-red-50/40"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${tc.bg} border ${tc.border} shrink-0`} />
                        <span className="font-bold text-[11px] text-stone-900">{tc.label}</span>
                      </div>
                      <span className="text-[9px] text-stone-500 mt-1">{tc.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Judul / Headline:</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Operasi Lilin Pengamanan Nataru Sukses Digelar"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Content textarea if applicable */}
              {formType === "text_columns" && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Isi Berita:</label>
                  <textarea
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Tuliskan naskah berita lengkap di sini..."
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              )}

              {/* Hero Greeting Specifics */}
              {formType === "hero_greeting" && (
                <div className="space-y-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Ucapan:</label>
                      <input
                        type="text"
                        value={formGreeting}
                        onChange={(e) => setFormGreeting(e.target.value)}
                        placeholder="Selamat dan Sukses"
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Nama Pejabat:</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="IRJEN POL..."
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Awalan Jabatan:</label>
                      <input
                        type="text"
                        value={formPositionPrefix}
                        onChange={(e) => setFormPositionPrefix(e.target.value)}
                        placeholder="SEBAGAI"
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Jabatan:</label>
                      <input
                        type="text"
                        value={formPosition}
                        onChange={(e) => setFormPosition(e.target.value)}
                        placeholder="KAPOLDA"
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Instansi:</label>
                      <input
                        type="text"
                        value={formPositionSub}
                        onChange={(e) => setFormPositionSub(e.target.value)}
                        placeholder="KEPOLISIAN DAERAH"
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Image upload / URL */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Foto Gambar (Otomatis Kompresi WebP):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="URL gambar atau unggah file di samping..."
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900"
                  />
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? "Mengompres..." : "Pilih File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAddBlock}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#E50914] hover:bg-[#B91C1C] text-white shadow-xs cursor-pointer"
              >
                Tambahkan Kotak ke Halaman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: SUNTING KONTEN KOTAK */}
      {/* ========================================================= */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-600" />
                <span>Sunting Kotak Section</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingBlock(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Width / ColSpan */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Lebar Kotak:</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    { span: 3, label: "1/4 (3)" },
                    { span: 4, label: "1/3 (4)" },
                    { span: 6, label: "1/2 (6)" },
                    { span: 8, label: "2/3 (8)" },
                    { span: 9, label: "3/4 (9)" },
                    { span: 12, label: "Penuh (12)" },
                  ].map((s) => (
                    <button
                      key={s.span}
                      type="button"
                      onClick={() => setFormColSpan(s.span)}
                      className={`py-1.5 rounded border text-[11px] font-bold transition-colors cursor-pointer ${
                        formColSpan === s.span
                          ? "bg-[#7F0000] text-white border-red-900"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Columns & Dynamic Image Position Selector if type is text_columns */}
              {formType === "text_columns" && (
                <div className="space-y-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Format Kolom Teks Berita (Khas Koran):
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setFormTextColumns(col)}
                          className={`py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                            formTextColumns === col
                              ? "bg-[#E50914] text-white border-[#B91C1C]"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {col} Kolom Teks
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Photo & Text Flow Layout */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Tata Letak Posisi Foto &amp; Alur Teks Berita:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: "top",
                          title: "Foto di Atas (Full)",
                          desc: "Foto membentang penuh di atas, naskah teks di bawah",
                          icon: "⬆️",
                        },
                        {
                          id: "left",
                          title: "Foto di Kiri",
                          desc: "Foto di sisi kiri, naskah teks mengalir di sisi kanan",
                          icon: "⬅️",
                        },
                        {
                          id: "right",
                          title: "Foto di Kanan",
                          desc: "Foto di sisi kanan, naskah teks mengalir di sisi kiri",
                          icon: "➡️",
                        },
                        {
                          id: "bottom",
                          title: "Foto di Bawah (Full)",
                          desc: "Naskah teks di atas, foto membentang penuh di bawah",
                          icon: "⬇️",
                        },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setFormImagePosition(pos.id as "top" | "left" | "right" | "bottom")}
                          className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            formImagePosition === pos.id
                              ? "bg-amber-100 border-amber-600 ring-2 ring-amber-500/30 text-stone-900 font-bold shadow-xs"
                              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span>{pos.icon}</span>
                            <span>{pos.title}</span>
                          </div>
                          <p className="text-[9.5px] text-stone-500 mt-1 leading-tight">{pos.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size to Fill Space */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Ukuran Huruf Naskah (Membantu Mengisi Ruang Kosong):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "xs", label: "Kecil (7.5px)", sub: "Padat Khas Koran" },
                        { id: "sm", label: "Sedang (8.5px)", sub: "Standar Terbaca" },
                        { id: "base", label: "Besar (9.5px)", sub: "Mengisi Ruang Luas" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFormFontSize(f.id as "xs" | "sm" | "base")}
                          className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                            formFontSize === f.id
                              ? "bg-[#7F0000] text-white border-red-900 font-bold"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          <div className="text-xs font-bold">{f.label}</div>
                          <div className="text-[9.5px] opacity-80">{f.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pilihan Gaya Warna Tema Section (Bedakan Versi Lama vs Versi Baru) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Format Gaya Warna Section:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: "blue", label: "Biru Klasik", badge: "Versi Lama (Gambar 1)", bg: "bg-[#D6EEFC]", border: "border-blue-400" },
                    { id: "orange", label: "Oranye Modern", badge: "Versi Baru", bg: "bg-[#FA9805]", border: "border-orange-500" },
                    { id: "white", label: "Putih Bersih", badge: "Standar", bg: "bg-white", border: "border-stone-300" },
                    { id: "dark", label: "Gelap Elegan", badge: "Hitam Tokoh", bg: "bg-stone-900", border: "border-black" },
                    { id: "red", label: "Merah Presisi", badge: "Aksen Berita", bg: "bg-red-700", border: "border-red-800" },
                  ].map((tc) => (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => setFormThemeColor(tc.id as NewspaperBlock["themeColor"])}
                      className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        formThemeColor === tc.id
                          ? "ring-2 ring-red-600 border-red-600 bg-red-50/40"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${tc.bg} border ${tc.border} shrink-0`} />
                        <span className="font-bold text-[11px] text-stone-900">{tc.label}</span>
                      </div>
                      <span className="text-[9px] text-stone-500 mt-1">{tc.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Judul / Headline:</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Content textarea if text_columns */}
              {formType === "text_columns" && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Isi Berita:</label>
                  <textarea
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              )}

              {/* Hero Greeting Specifics */}
              {formType === "hero_greeting" && (
                <div className="space-y-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Ucapan:</label>
                      <input
                        type="text"
                        value={formGreeting}
                        onChange={(e) => setFormGreeting(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Nama Pejabat:</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Awalan Jabatan:</label>
                      <input
                        type="text"
                        value={formPositionPrefix}
                        onChange={(e) => setFormPositionPrefix(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Jabatan:</label>
                      <input
                        type="text"
                        value={formPosition}
                        onChange={(e) => setFormPosition(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Instansi:</label>
                      <input
                        type="text"
                        value={formPositionSub}
                        onChange={(e) => setFormPositionSub(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Image upload / URL */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Foto Gambar (Otomatis Kompresi WebP):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900"
                  />
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? "Mengompres..." : "Ganti Foto"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditBlock}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#E50914] hover:bg-[#B91C1C] text-white shadow-xs cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: PILIH ARTIKEL PORTAL */}
      {/* ========================================================= */}
      {isPortalPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#E50914]" />
                <span>Pilih Berita dari Portal Jurnal Polisi</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPortalPickerOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {portalArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleSelectPortalArticle(art)}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-stone-200 hover:border-[#E50914] hover:bg-red-50/40 transition-all cursor-pointer"
                >
                  <div className="relative w-14 h-11 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <Image
                      src={art.gambar_sampul || "/images/ads/iklan-bunga.jpeg"}
                      alt={art.judul}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                      {art.kategori.nama}
                    </span>
                    <p className="text-xs font-bold text-stone-900 line-clamp-2 mt-0.5">
                      {art.judul}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6.5. MODAL: PENGATURAN GAMBAR HEADER KORAN */}
      {/* ========================================================= */}
      {isHeaderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#E50914]" />
                  <span>Pengaturan Gambar Header Koran</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Header koran khusus diperuntukkan untuk memasukkan file gambar (Format PNG, WEBP, atau JPG).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHeaderModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Judul Edisi Koran (Baris Atas Cover) */}
            <div className="space-y-1.5 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
              <label className="block text-xs font-bold text-amber-950">
                Judul / Teks Edisi Koran (Ditampilkan di Baris Atas Cover):
              </label>
              <input
                type="text"
                value={headerEditionInput}
                onChange={(e) => setHeaderEditionInput(e.target.value)}
                placeholder="misal: EDISI NOVEMBER 2026 atau EDISI KHUSUS POLRI PRESISI"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-black text-stone-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              />
              <div className="flex items-center justify-between text-[11px] text-amber-800 pt-1">
                <span>Teks ini otomatis tercetak tebal pada strip oranye di bawah banner header cover.</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none">
                  <input
                    type="checkbox"
                    checked={headerShowEditionBar}
                    onChange={(e) => setHeaderShowEditionBar(e.target.checked)}
                    className="rounded border-amber-400 text-red-600 focus:ring-red-500"
                  />
                  <span>Tampilkan Baris Edisi</span>
                </label>
              </div>
            </div>

            {/* Pratinjau Banner Gambar Saat Ini */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Pratinjau Banner Gambar Header:
              </label>
              <div className="relative w-full border-2 border-stone-800 rounded-lg overflow-hidden bg-stone-100 min-h-[90px] flex items-center justify-center shadow-xs">
                {headerImageInput ? (
                  <div className="w-full relative">
                    <img
                      src={headerImageInput}
                      alt="Pratinjau Header Koran"
                      className="w-full h-auto object-contain block max-h-[160px]"
                    />
                  </div>
                ) : (
                  <div className="p-6 text-center text-stone-400 text-xs">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <span>Belum ada gambar header terpilih</span>
                  </div>
                )}
              </div>
            </div>

            {/* Unggah File Gambar */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Unggah Gambar Baru dari Komputer:
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 border-2 border-dashed border-stone-300 hover:border-[#E50914] bg-stone-50 hover:bg-red-50/20 rounded-xl p-3 text-center cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderFileUpload}
                    className="hidden"
                    disabled={headerUploading}
                  />
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-700 group-hover:text-[#E50914]">
                    <Upload className="w-4 h-4 text-[#E50914]" />
                    <span>{headerUploading ? "Mengunggah & Kompresi WebP..." : "Klik untuk Pilih File Gambar Header"}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    PNG, WEBP, atau JPG (Otomatis dikompresi WebP optimal oleh server)
                  </p>
                </label>
              </div>
            </div>

            {/* Masukkan URL Gambar Langsung */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Atau Masukkan URL Gambar:
              </label>
              <input
                type="text"
                value={headerImageInput}
                onChange={(e) => setHeaderImageInput(e.target.value)}
                placeholder="/images/header-koran-default.webp atau https://..."
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetDefaultHeader}
                className="text-[11px] text-stone-600 hover:text-stone-900 underline cursor-pointer"
              >
                Gunakan Header Bawaan Jurnal Polisi
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHeaderModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeader}
                  className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Terapkan Gambar Header
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 7. RIWAYAT ARSIP EDISI TERSIMPAN DI BASIS DATA */}
      {/* ========================================================= */}
      <div className={`bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs ${
        activeViewTab === "archive" ? "mt-2" : "mt-6"
      }`}>
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#7F0000]" />
              <span>Daftar Edisi Koran Tersimpan (Dapat Diedit Kembali)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pilih edisi koran untuk diedit kembali naskah &amp; tata letaknya, atau buat edisi baru selanjutnya.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewEdition}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Edisi Selanjutnya</span>
            </button>
            <span className="text-xs text-stone-500 font-mono bg-stone-100 px-2 py-1 rounded border border-stone-200">
              {editions.length} Edisi
            </span>
          </div>
        </div>

        {editions.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">
            <Newspaper className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <p className="font-bold text-stone-700 text-sm">Belum ada edisi koran yang disimpan</p>
            <p className="mt-1">Susun konten pada Kanvas Editor lalu klik tombol &quot;Simpan Draft&quot; atau &quot;Simpan &amp; Terbitkan&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#7F0000] text-white uppercase tracking-wider text-[10px] font-bold border-b border-red-900">
                <tr>
                  <th className="py-3 px-4 text-white font-bold tracking-wider">Judul / Edisi</th>
                  <th className="py-3 px-4 text-white font-bold tracking-wider">Format</th>
                  <th className="py-3 px-4 text-white font-bold tracking-wider">Jumlah Halaman</th>
                  <th className="py-3 px-4 text-white font-bold tracking-wider">Tanggal Dibuat</th>
                  <th className="py-3 px-4 text-right text-white font-bold tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {editions.map((ed) => {
                  let pageCount = 1;
                  let isBw = false;
                  try {
                    const parsed = JSON.parse(ed.data_layout);
                    pageCount = parsed.pages?.length || 1;
                    isBw = Boolean(parsed.isGrayscale);
                  } catch {}

                  const isCurrent = ed.id === currentEditionId;

                  return (
                    <tr
                      key={ed.id}
                      className={`transition-colors ${
                        isCurrent ? "bg-amber-50/60 font-semibold" : "hover:bg-stone-50"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <span>{ed.judul.replace(/^\[DRAFT\]\s*/i, "")}</span>
                          {ed.judul.includes("[DRAFT]") ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              DRAFT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              TERBIT
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-stone-900 text-white">
                              AKTIF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isBw ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-stone-800 text-white font-mono">
                            HITAM PUTIH (B&amp;W)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            FULL COLOR
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{pageCount} Halaman</td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {new Date(ed.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleLoadEdition(ed)}
                          className="px-3 py-1.5 bg-red-50 text-[#7F0000] hover:bg-[#7F0000] hover:text-white rounded-lg border border-red-200 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Muat edisi ini ke Kanvas Editor untuk diedit kembali"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit / Buka di Editor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: "Hapus Edisi Koran",
                              message: `Hapus edisi "${ed.judul}" dari basis data? Tindakan ini tidak dapat dibatalkan.`,
                              confirmText: "Ya, Hapus Edisi",
                              variant: "danger",
                              action: async () => {
                                await hapusEdisiKoran(ed.id);
                                setEditions((prev) => prev.filter((x) => x.id !== ed.id));
                                if (currentEditionId === ed.id) {
                                  setCurrentEditionId(null);
                                }
                              },
                            });
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex items-center"
                          title="Hapus Edisi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* IN-APP CONFIRM DIALOG (Menggantikan confirm browser) */}
      {/* ========================================================= */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        isLoading={confirmLoading}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
