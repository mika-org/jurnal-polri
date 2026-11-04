"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
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
  Undo2,
  Redo2,
  Eye,
  Download,
  ArrowLeft,
  Minus,
  MousePointer2,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
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

  const [editTarget, setEditTarget] = useState<"block" | "text" | "image">("block");
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
  const [formCustomColor, setFormCustomColor] = useState<string>("");

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

  // Terapkan Format Halaman Isi Klasik Gambar 2 (Jendela Redaksi Hitam Putih) pada halaman aktif
  const handleApplyPage2FormatLama = (pageIdx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Terapkan Format Klasik (Gambar 2)",
      message: `Terapkan susunan Halaman Isi Klasik Hitam Putih (Boks Susunan Redaksi + 2 Berita Kolom sesuai Gambar 2) ke Halaman ${pageIdx + 1}?`,
      confirmText: "Ya, Terapkan Format Gambar 2",
      variant: "warning",
      action: async () => {
        setNewspaperData((prev) => {
          const pages = [...prev.pages];
          if (pages[pageIdx]) {
            pages[pageIdx] = {
              ...pages[pageIdx],
              showCoverMasthead: false,
              runningHeader: "JENDELA REDAKSI",
              isGrayscale: true,
              blocks: JSON.parse(JSON.stringify(PAGE_2_PRESET_JENDELA_REDAKSI.blocks)),
            };
          }
          return { ...prev, pages };
        });
        setSuccessMessage(`Format Klasik Gambar 2 (Jendela Redaksi B&W) berhasil diterapkan pada Halaman ${pageIdx + 1}!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      },
    });
  };

  // Sisipkan Boks Susunan Redaksi Langsung ke Halaman Aktif
  const handleInsertRedaksiBox = (pageIdx: number) => {
    const redaksiBoxBlock: NewspaperBlock = {
      id: `block-redaksi-box-${Date.now()}`,
      type: "redaksi_box",
      title: "BOKS SUSUNAN REDAKSI",
      colSpan: 5,
      textColumns: 1,
      content: "",
      fontSize: "xs",
      themeColor: "white",
    };
    setNewspaperData((prev) => {
      const pages = [...prev.pages];
      if (pages[pageIdx]) {
        pages[pageIdx] = {
          ...pages[pageIdx],
          blocks: [redaksiBoxBlock, ...pages[pageIdx].blocks],
        };
      }
      return { ...prev, pages };
    });
    setSuccessMessage("Boks Susunan Redaksi (Format Gambar 2) berhasil ditambahkan ke halaman!");
    setTimeout(() => setSuccessMessage(""), 4000);
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
    setFormCustomColor("");

    setIsAddModalOpen({ pageIndex: pageIdx, defaultSpan });
  };

  // Open Edit Block Modal
  const handleOpenEditModal = (
    pageIdx: number,
    block: NewspaperBlock,
    target: "block" | "text" | "image" = "block"
  ) => {
    setEditTarget(target);
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
    setFormCustomColor(block.customColor || "");

    setEditingBlock({ pageIndex: pageIdx, block });
  };

  // Save Add Block
  const handleSaveAddBlock = () => {
    if (!isAddModalOpen) return;
    const { pageIndex } = isAddModalOpen;

    const newBlock: NewspaperBlock = {
      id: `block-${Date.now()}`,
      type: formType,
      title: formTitle || (formType === "redaksi_box" ? "BOKS SUSUNAN REDAKSI" : "Judul Kotak Berita"),
      content: formContent,
      image: formImage || undefined,
      colSpan: formColSpan,
      textColumns: formType === "redaksi_box" ? 1 : formTextColumns,
      imagePosition: formImagePosition,
      fontSize: formFontSize,
      greeting: formGreeting,
      name: formName,
      position: formPosition,
      positionPrefix: formPositionPrefix,
      positionSub: formPositionSub,
      themeColor: formType === "redaksi_box" ? "white" : formThemeColor,
      customColor: formCustomColor || undefined,
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
      customColor: formCustomColor || undefined,
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
      e.target.value = "";
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
    if (editingBlock) {
      handleUpdateBlock(editingBlock.pageIndex, editingBlock.block.id, {
        title: art.judul,
        content: art.ringkasan,
        image: art.gambar_sampul,
      });
    }
    setIsPortalPickerOpen(false);
  };

  // ===== Editor shell state (selection, undo/redo, layers) =====
  const [hist, setHist] = useState<{ past: string[]; future: string[] }>({ past: [], future: [] });
  const currentSnapRef = useRef<string>(JSON.stringify(newspaperData));
  const skipHistRef = useRef<boolean>(false);

  useEffect(() => {
    const snap = JSON.stringify(newspaperData);
    if (snap === currentSnapRef.current) return;
    const prevSnap = currentSnapRef.current;
    currentSnapRef.current = snap;
    if (skipHistRef.current) {
      skipHistRef.current = false;
      return;
    }
    setHist((h) => ({ past: [...h.past, prevSnap].slice(-50), future: [] }));
  }, [newspaperData]);

  const handleUndo = () => {
    if (hist.past.length === 0) return;
    const prev = hist.past[hist.past.length - 1];
    setHist({ past: hist.past.slice(0, -1), future: [currentSnapRef.current, ...hist.future] });
    skipHistRef.current = true;
    setNewspaperData(JSON.parse(prev));
  };

  const handleRedo = () => {
    if (hist.future.length === 0) return;
    const next = hist.future[0];
    setHist({ past: [...hist.past, currentSnapRef.current], future: hist.future.slice(1) });
    skipHistRef.current = true;
    setNewspaperData(JSON.parse(next));
  };

  const activePage = newspaperData.pages[activePageIndex];
  const activeCoverVersion =
    activePage?.coverVersion || newspaperData.masthead.coverVersion || "v1_lama";

  const handleMoveLayer = (idx: number, dir: -1 | 1) => {
    const dest = idx + dir;
    if (!activePage || dest < 0 || dest >= activePage.blocks.length) return;
    handleReorderBlocks(activePageIndex, idx, dest);
  };

  const BLOCK_TYPE_LABEL: Record<NewspaperBlock["type"], string> = {
    hero_greeting: "Banner Tokoh",
    article: "Artikel",
    photo_story: "Berita Foto",
    text_columns: "Teks Kolom",
    ad_banner: "Iklan",
    redaksi_box: "Boks Redaksi",
  };

  const THEME_SWATCH: Record<NonNullable<NewspaperBlock["themeColor"]>, string> = {
    blue: "#BFE3F2",
    orange: "#F97316",
    red: "#E50914",
    dark: "#111827",
    gold: "#F5C518",
    white: "#FFFFFF",
  };

  const sectionLabel = "text-[10.5px] font-bold uppercase tracking-wider text-stone-500";
  const ghostBtn =
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3 py-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  const chipCls = (active: boolean) =>
    `py-1.5 rounded-md border text-[11px] font-bold cursor-pointer ${
      active
        ? "bg-[#7F0000] text-white border-[#7F0000]"
        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
    }`;

  const renderToggle = (checked: boolean, onChange: () => void) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-[#7F0000]" : "bg-stone-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );

  // Terapkan warna langsung (live) ke blok yang sedang disunting
  const applyCustomColor = (v: string) => {
    setFormCustomColor(v);
    if (editingBlock && (v === "" || /^#[0-9a-fA-F]{6}$/.test(v))) {
      handleUpdateBlock(editingBlock.pageIndex, editingBlock.block.id, {
        customColor: v || undefined,
      });
    }
  };

  const applyThemePreset = (c: NewspaperBlock["themeColor"]) => {
    setFormThemeColor(c);
    setFormCustomColor("");
    if (editingBlock) {
      handleUpdateBlock(editingBlock.pageIndex, editingBlock.block.id, {
        themeColor: c,
        customColor: undefined,
      });
    }
  };

  // ===== Inspector kanan: Blok / Teks / Gambar (live, tanpa tombol simpan) =====
  const liveBlock = editingBlock
    ? newspaperData.pages[editingBlock.pageIndex]?.blocks.find((b) => b.id === editingBlock.block.id)
    : undefined;
  const upd = (u: Partial<NewspaperBlock>) => {
    if (editingBlock) handleUpdateBlock(editingBlock.pageIndex, editingBlock.block.id, u);
  };
  const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

  const renderColorRow = (
    label: string,
    value: string | undefined,
    fallback: string,
    onChange: (v: string | undefined) => void
  ) => (
    <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3 py-2">
      <label className="relative w-5 h-5 shrink-0 cursor-pointer">
        <span
          className="block w-5 h-5 rounded-md border border-stone-300"
          style={{ backgroundColor: value && isHex(value) ? value : fallback }}
        />
        <input
          type="color"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          value={value && isHex(value) ? value : fallback}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={label}
        />
      </label>
      <span className="text-xs text-stone-800 flex-1 truncate">{label}</span>
      <input
        key={value ?? "none"}
        type="text"
        defaultValue={value ?? ""}
        placeholder={fallback.toUpperCase()}
        maxLength={7}
        onChange={(e) => {
          let v = e.target.value.trim();
          if (v && !v.startsWith("#")) v = "#" + v;
          if (isHex(v)) onChange(v.toUpperCase());
        }}
        className="w-[4.5rem] text-right text-[11px] font-mono text-stone-700 bg-transparent focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-stone-400 hover:text-stone-700 cursor-pointer"
          title="Reset"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  const renderNumField = (
    label: string,
    value: number | undefined,
    placeholder: string,
    onChange: (v: number | undefined) => void,
    min = 0,
    max = 2000
  ) => (
    <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2">
      <span className="text-xs text-stone-500 shrink-0">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="w-full min-w-0 text-sm font-semibold text-stone-900 bg-transparent focus:outline-none"
      />
    </label>
  );

  const handleLiveUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) upd({ image: data.url });
      else alert(data.error || "Gagal mengunggah gambar");
    } catch {
      alert("Terjadi kesalahan jaringan saat mengunggah gambar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const FONT_OPTIONS: { label: string; value: string }[] = [
    { label: "Bawaan koran (Serif)", value: "" },
    { label: "Inter", value: "Inter, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Courier New", value: "'Courier New', monospace" },
  ];

  const editPanel =
    editingBlock && liveBlock ? (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className={sectionLabel}>{BLOCK_TYPE_LABEL[liveBlock.type]}</span>
            <p className="text-sm font-bold text-stone-900 mt-0.5 line-clamp-2">{liveBlock.title}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              title="Duplikat"
              onClick={() => handleAddBlockDirect(editingBlock.pageIndex, { ...liveBlock, id: `block-${Date.now()}` })}
              className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Hapus kotak"
              onClick={() => {
                handleDeleteBlock(editingBlock.pageIndex, liveBlock.id);
                setEditingBlock(null);
              }}
              className="p-1.5 rounded-md hover:bg-red-50 text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Tutup"
              onClick={() => setEditingBlock(null)}
              className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Blok / Teks / Gambar */}
        <div className="grid grid-cols-3 rounded-lg bg-stone-100 p-0.5 text-[11px] font-bold">
          {([
            ["block", "Blok"],
            ["text", "Teks"],
            ["image", "Gambar"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setEditTarget(k)}
              className={`py-1.5 rounded-md cursor-pointer transition-colors ${
                editTarget === k ? "bg-white text-[#7F0000] shadow-xs" : "text-stone-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ================= TAB: BLOK ================= */}
        {editTarget === "block" && (
          <div className="space-y-5">
            <section className="space-y-2">
              <span className={sectionLabel}>Posisi &amp; Ukuran</span>
              <div className="grid grid-cols-2 gap-2">
                {renderNumField("Kolom", liveBlock.colSpan, "6", (v) => upd({ colSpan: Math.min(12, Math.max(1, v ?? 6)) }), 1, 12)}
                {renderNumField("Tinggi", liveBlock.customHeight, "auto", (v) => upd({ customHeight: v }))}
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {[3, 4, 6, 8, 9, 12].map((s) => (
                  <button key={s} type="button" onClick={() => upd({ colSpan: s })} className={chipCls(liveBlock.colSpan === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <span className={sectionLabel}>Gaya</span>
              {renderColorRow("Warna latar", liveBlock.customColor, "#FFFFFF", (v) => upd({ customColor: v }))}
              {renderColorRow("Warna border", liveBlock.borderColor, "#000000", (v) => upd({ borderColor: v }))}
              <div className="grid grid-cols-2 gap-2">
                {renderNumField("Radius", liveBlock.radius, "2", (v) => upd({ radius: v }), 0, 50)}
                {renderNumField("Border", liveBlock.borderWidth, "1", (v) => upd({ borderWidth: v }), 0, 12)}
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block mb-1.5">Preset tema</span>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(THEME_SWATCH) as NonNullable<NewspaperBlock["themeColor"]>[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => upd({ themeColor: c, customColor: undefined })}
                      style={{ backgroundColor: THEME_SWATCH[c] }}
                      className={`w-7 h-7 rounded-full border cursor-pointer ${
                        liveBlock.themeColor === c && !liveBlock.customColor
                          ? "ring-2 ring-offset-1 ring-[#7F0000] border-transparent"
                          : "border-stone-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {liveBlock.type === "text_columns" && (
              <section className="space-y-2">
                <span className={sectionLabel}>Tata Letak Gambar</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    ["top", "Atas"],
                    ["left", "Kiri"],
                    ["right", "Kanan"],
                    ["bottom", "Bawah"],
                  ] as const).map(([k, label]) => (
                    <button key={k} type="button" onClick={() => upd({ imagePosition: k })} className={chipCls((liveBlock.imagePosition || "left") === k)}>
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ================= TAB: TEKS ================= */}
        {editTarget === "text" && (
          <div className="space-y-5">
            <section className="space-y-2">
              <span className={sectionLabel}>Isi</span>
              <input
                type="text"
                value={liveBlock.title}
                onChange={(e) => upd({ title: e.target.value })}
                placeholder="Judul / headline"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#7F0000]"
              />
              {(liveBlock.type === "text_columns" || liveBlock.type === "article") && (
                <textarea
                  rows={6}
                  value={liveBlock.content || ""}
                  onChange={(e) => upd({ content: e.target.value })}
                  placeholder="Isi berita"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#7F0000]"
                />
              )}
              {liveBlock.type === "hero_greeting" && (
                <div className="space-y-2">
                  {([
                    ["greeting", "Ucapan"],
                    ["name", "Nama pejabat"],
                    ["positionPrefix", "Awalan jabatan"],
                    ["position", "Jabatan"],
                    ["positionSub", "Instansi"],
                  ] as const).map(([k, label]) => (
                    <input
                      key={k}
                      type="text"
                      value={(liveBlock[k] as string | undefined) || ""}
                      onChange={(e) => upd({ [k]: e.target.value } as Partial<NewspaperBlock>)}
                      placeholder={label}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#7F0000]"
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsPortalPickerOpen(true)}
                className={`${ghostBtn} w-full`}
                title="Isi dari berita portal"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#7F0000]" />
                <span>Ambil dari berita portal</span>
              </button>
            </section>

            <section className="space-y-2">
              <span className={sectionLabel}>Teks</span>
              <div className="grid grid-cols-[1fr_5.5rem] gap-2">
                <select
                  value={liveBlock.textFont || ""}
                  onChange={(e) => upd({ textFont: e.target.value || undefined })}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#7F0000]"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.label} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2">
                  <input
                    type="number"
                    min={5}
                    max={40}
                    step={0.5}
                    value={liveBlock.textSize ?? ""}
                    placeholder="7.5"
                    onChange={(e) => upd({ textSize: e.target.value === "" ? undefined : Number(e.target.value) })}
                    className="w-full min-w-0 text-sm font-semibold bg-transparent focus:outline-none"
                  />
                  <span className="text-[11px] text-stone-400">px</span>
                </label>
              </div>
              {renderColorRow("Warna teks", liveBlock.textColor, "#111827", (v) => upd({ textColor: v }))}
              {renderColorRow("Warna BG teks", liveBlock.textBgColor, "#BFE3F2", (v) => upd({ textBgColor: v }))}
              <div className="grid grid-cols-4 rounded-xl bg-stone-100 p-1">
                {([
                  ["left", AlignLeft],
                  ["center", AlignCenter],
                  ["right", AlignRight],
                  ["justify", AlignJustify],
                ] as const).map(([k, Icon]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => upd({ textAlign: k })}
                    className={`py-1.5 rounded-lg flex items-center justify-center cursor-pointer ${
                      (liveBlock.textAlign || "justify") === k ? "bg-white text-[#7F0000] shadow-xs" : "text-stone-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              {liveBlock.type === "text_columns" && (
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1.5">Kolom teks</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((c) => (
                      <button key={c} type="button" onClick={() => upd({ textColumns: c })} className={chipCls((liveBlock.textColumns || 1) === c)}>
                        {c} kol
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================= TAB: GAMBAR ================= */}
        {editTarget === "image" && (
          <div className="space-y-4">
            <span className={`${sectionLabel} block`}>Gambar</span>
            {liveBlock.image ? (
              <div className="h-32 rounded-2xl overflow-hidden bg-stone-200 border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={liveBlock.image}
                  alt="Pratinjau"
                  className={`w-full h-full ${
                    liveBlock.imageFit === "fit" ? "object-contain" : liveBlock.imageFit === "stretch" ? "object-fill" : "object-cover"
                  }`}
                  style={{
                    filter: liveBlock.imageGrayscale ? "grayscale(1)" : undefined,
                    transform:
                      `${liveBlock.imageFlipV ? "scaleY(-1) " : ""}${liveBlock.imageFlipH ? "scaleX(-1)" : ""}`.trim() || undefined,
                  }}
                />
              </div>
            ) : (
              <div className="h-24 rounded-2xl border border-dashed border-stone-300 flex items-center justify-center text-xs text-stone-400">
                Belum ada gambar
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <label className={`${ghostBtn} cursor-pointer`}>
                {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{liveBlock.image ? "Ganti" : "Unggah"}</span>
                <input type="file" accept="image/*" onChange={handleLiveUpload} className="hidden" disabled={uploading} />
              </label>
              <button
                type="button"
                disabled={!liveBlock.image}
                onClick={() => upd({ image: undefined })}
                className={`${ghostBtn} !text-red-600`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>

            <input
              type="text"
              value={liveBlock.image || ""}
              onChange={(e) => upd({ image: e.target.value || undefined })}
              placeholder="atau tempel URL gambar"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#7F0000]"
            />

            <div className="grid grid-cols-3 rounded-xl bg-stone-100 p-1 text-xs font-semibold">
              {([
                ["fill", "Isi"],
                ["fit", "Pas"],
                ["stretch", "Tarik"],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => upd({ imageFit: k })}
                  className={`py-1.5 rounded-lg cursor-pointer ${
                    (liveBlock.imageFit || "fill") === k ? "bg-white text-[#7F0000] font-bold shadow-xs" : "text-stone-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {([
              ["imageGrayscale", "Greyscale"],
              ["imageFlipV", "Balik Vertikal"],
              ["imageFlipH", "Horizontal"],
            ] as const).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between text-sm text-stone-800">
                <span>{label}</span>
                {renderToggle(!!liveBlock[k], () => upd({ [k]: !liveBlock[k] } as Partial<NewspaperBlock>))}
              </div>
            ))}

            {liveBlock.type === "text_columns" && liveBlock.image && (
              <div className="grid grid-cols-2 gap-2">
                {renderNumField("Lebar", liveBlock.imageWidth, "64", (v) => upd({ imageWidth: v }))}
                {renderNumField("Tinggi", liveBlock.imageHeight, "56", (v) => upd({ imageHeight: v }))}
              </div>
            )}
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className="space-y-4">
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

      {activeViewTab === "editor" ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[calc(100vh-7rem)] min-h-[640px]">
          {/* ===================== TOP BAR ===================== */}
          <div className="h-14 shrink-0 border-b border-stone-200 px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setActiveViewTab("archive")}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 cursor-pointer"
                title="Kembali ke daftar arsip edisi"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
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
                  placeholder="EDISI OKTOBER 2026"
                  className="block w-56 sm:w-72 text-sm font-bold text-stone-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 truncate"
                  title="Judul edisi (tampil di cover koran)"
                />
                <div className="text-[11px] font-medium flex items-center gap-1.5">
                  {isPending ? (
                    <span className="text-stone-500">Menyimpan…</span>
                  ) : newspaperData.isDraft ? (
                    <span className="text-amber-600">● Draft</span>
                  ) : currentEditionId ? (
                    <span className="text-emerald-600">● Terbit</span>
                  ) : (
                    <span className="text-blue-600">● Edisi baru</span>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <button type="button" onClick={handleUndo} disabled={hist.past.length === 0} className="p-2 rounded-lg hover:bg-stone-100 text-stone-700 disabled:opacity-30 cursor-pointer" title="Urungkan">
                <Undo2 className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleRedo} disabled={hist.future.length === 0} className="p-2 rounded-lg hover:bg-stone-100 text-stone-700 disabled:opacity-30 cursor-pointer" title="Ulangi">
                <Redo2 className="w-4 h-4" />
              </button>
              <span className="w-px h-5 bg-stone-200 mx-1" />
              <button type="button" onClick={handleCreateNewEdition} className="p-2 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer" title="Edisi baru">
                <Plus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setActiveViewTab("archive")} className="p-2 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer inline-flex items-center gap-1" title="Arsip edisi tersimpan">
                <Layers className="w-4 h-4" />
                <span className="text-[10px] font-mono">{editions.length}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorMode((v) => !v)}
                className={`${ghostBtn} ${!isEditorMode ? "!bg-stone-900 !text-white !border-stone-900" : ""}`}
                title="Beralih antara mode editor dan pratinjau cetak murni"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button type="button" onClick={handleSaveDraft} disabled={isPending} className={ghostBtn} title="Simpan sebagai draft sementara">
                {isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Simpan Draft</span>
              </button>
              <button type="button" onClick={handleSaveEdition} disabled={isPending} className={`${ghostBtn} hidden lg:inline-flex`} title="Simpan & terbitkan edisi final">
                <Save className="w-3.5 h-3.5" />
                <span>Terbitkan</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#7F0000] hover:bg-[#650000] text-white text-xs font-semibold px-3.5 py-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor PDF</span>
              </button>
            </div>
          </div>

          {/* ===================== BODY ===================== */}
          <div className="flex-1 min-h-0 flex">
            {/* ---------- LEFT SIDEBAR ---------- */}
            <aside className="w-64 shrink-0 border-r border-stone-200 overflow-y-auto p-4 space-y-5 hidden md:block">
              {/* Halaman */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <span className={sectionLabel}>Halaman ({newspaperData.pages.length})</span>
                  <button type="button" onClick={handleAddPage} className="text-[11px] font-bold text-[#7F0000] hover:underline cursor-pointer">
                    + Tambah
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {newspaperData.pages.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActivePageIndex(idx);
                        setEditingBlock(null);
                      }}
                      className="shrink-0 flex flex-col items-center gap-1 cursor-pointer"
                      title={p.title}
                    >
                      <div
                        className={`w-[54px] h-[76px] rounded-md bg-white p-1 flex flex-col gap-0.5 overflow-hidden border-2 ${
                          activePageIndex === idx ? "border-[#7F0000]" : "border-stone-200"
                        } ${p.isGrayscale ? "grayscale" : ""}`}
                      >
                        {p.showCoverMasthead && <div className="h-2.5 bg-stone-900 rounded-[1px] shrink-0" />}
                        <div className="flex flex-wrap gap-0.5 content-start flex-1 overflow-hidden">
                          {p.blocks.slice(0, 8).map((b) => (
                            <div
                              key={b.id}
                              style={{ width: `calc(${(b.colSpan / 12) * 100}% - 2px)` }}
                              className={`h-3 rounded-[1px] ${b.type === "text_columns" || b.type === "redaksi_box" ? "bg-sky-200" : "bg-slate-400"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className={`text-[10px] ${activePageIndex === idx ? "text-[#7F0000] font-bold" : "text-stone-500"}`}>
                        {p.pageNumber}
                      </span>
                    </button>
                  ))}
                  <button type="button" onClick={handleAddPage} className="shrink-0 flex flex-col items-center gap-1 cursor-pointer" title="Halaman baru">
                    <div className="w-[54px] h-[76px] rounded-md border border-dashed border-stone-300 flex items-center justify-center text-stone-400 hover:bg-stone-50">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-stone-500">Baru</span>
                  </button>
                </div>
                {newspaperData.pages.length > 1 && (
                  <button type="button" onClick={() => handleDeletePage(activePageIndex)} className="mt-1 text-[11px] font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer">
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus halaman {activePageIndex + 1}</span>
                  </button>
                )}
              </section>

              {/* Tambah Blok */}
              <section>
                <span className={`${sectionLabel} block mb-2`}>Tambah Blok</span>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => handleOpenAddModal(activePageIndex, 6)} className={ghostBtn}>
                    <FileText className="w-4 h-4 text-[#7F0000]" />
                    <span>Kotak Berita</span>
                  </button>
                  <button type="button" onClick={() => handleInsertRedaksiBox(activePageIndex)} className={ghostBtn}>
                    <BookOpen className="w-4 h-4 text-[#7F0000]" />
                    <span>Redaksi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenAddModal(activePageIndex, 5);
                      setFormType("photo_story");
                    }}
                    className={ghostBtn}
                  >
                    <ImageIcon className="w-4 h-4 text-[#7F0000]" />
                    <span>Gambar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenAddModal(activePageIndex, 12);
                      setFormType("ad_banner");
                    }}
                    className={ghostBtn}
                  >
                    <Sparkles className="w-4 h-4 text-[#7F0000]" />
                    <span>Iklan</span>
                  </button>
                </div>
              </section>

              {/* Layout & Tema (dinamis: versi lama / baru) */}
              <section className="space-y-3">
                <span className={`${sectionLabel} block`}>Layout &amp; Tema</span>

                {activePage?.showCoverMasthead ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 rounded-lg bg-stone-100 p-0.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => handleUpdateCoverVersion(activePageIndex, "v1_lama")}
                        className={`py-1.5 rounded-md cursor-pointer transition-colors ${activeCoverVersion === "v1_lama" ? "bg-white text-[#7F0000] shadow-xs" : "text-stone-600"}`}
                      >
                        Tema Lama
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCoverVersion(activePageIndex, "v2_baru")}
                        className={`py-1.5 rounded-md cursor-pointer transition-colors ${activeCoverVersion === "v2_baru" ? "bg-white text-[#7F0000] shadow-xs" : "text-stone-600"}`}
                      >
                        Tema Baru
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        activeCoverVersion === "v1_lama"
                          ? handleApplyCoverV1Lama(activePageIndex)
                          : handleApplyCoverV2Baru(activePageIndex)
                      }
                      className={`${ghostBtn} w-full`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#7F0000]" />
                      <span>Terapkan susunan {activeCoverVersion === "v1_lama" ? "tema lama" : "tema baru"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[11px] text-stone-500">Judul header halaman</label>
                    <input
                      type="text"
                      value={activePage?.runningHeader ?? ""}
                      onChange={(e) => handleUpdatePageHeader(activePageIndex, e.target.value)}
                      placeholder="JENDELA REDAKSI"
                      className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#7F0000]"
                    />
                    <div className="flex flex-wrap gap-1">
                      {["JENDELA REDAKSI", "BERITA UTAMA", "HUKUM & KRIMINAL", "LIPUTAN DAERAH", "POLRES KITA"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleUpdatePageHeader(activePageIndex, chip)}
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer ${
                            activePage?.runningHeader === chip ? "bg-[#7F0000] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => handleApplyPage2FormatLama(activePageIndex)} className={`${ghostBtn} w-full`}>
                      <BookOpen className="w-3.5 h-3.5 text-[#7F0000]" />
                      <span>Format klasik B&amp;W</span>
                    </button>
                  </div>
                )}

                <button type="button" onClick={handleApplyFullFormatLama} className={`${ghostBtn} w-full`} title="Cover klasik + Jendela Redaksi B&W">
                  <Newspaper className="w-3.5 h-3.5 text-[#7F0000]" />
                  <span>Terapkan format lama lengkap</span>
                </button>

                <div className="flex items-center justify-between text-xs text-stone-800">
                  <span>Banner header (cover)</span>
                  {renderToggle(!!activePage?.showCoverMasthead, () => handleToggleCoverMasthead(activePageIndex))}
                </div>
                {activePage?.showCoverMasthead && (
                  <button type="button" onClick={handleOpenHeaderModal} className={`${ghostBtn} w-full`}>
                    <ImageIcon className="w-3.5 h-3.5 text-[#7F0000]" />
                    <span>Ubah gambar header</span>
                  </button>
                )}
                <div className="flex items-center justify-between text-xs text-stone-800">
                  <span>Halaman ini hitam putih</span>
                  {renderToggle(!!activePage?.isGrayscale, () => handleToggleGrayscale(false))}
                </div>
                <div className="flex items-center justify-between text-xs text-stone-800">
                  <span>Semua halaman B&amp;W</span>
                  {renderToggle(!!newspaperData.isGrayscale, () => handleToggleGrayscale(true))}
                </div>
              </section>

              {/* Layer */}
              <section>
                <span className={`${sectionLabel} block mb-2`}>Layer</span>
                <ul className="space-y-0.5">
                  {activePage?.blocks.map((b, idx) => (
                    <li key={b.id}>
                      <div
                        onClick={() => handleOpenEditModal(activePageIndex, b)}
                        className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer ${
                          editingBlock?.block.id === b.id ? "bg-red-50 text-[#7F0000] font-bold" : "text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        {b.type === "photo_story" || b.type === "hero_greeting" ? (
                          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="flex-1 truncate">{b.title || BLOCK_TYPE_LABEL[b.type]}</span>
                        <span className="text-[10px] text-stone-500 bg-stone-100 rounded px-1">{b.colSpan}/12</span>
                        <span className="hidden group-hover:flex items-center">
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveLayer(idx, -1); }} className="p-0.5 hover:text-stone-900" title="Naik">
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveLayer(idx, 1); }} className="p-0.5 hover:text-stone-900" title="Turun">
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </span>
                      </div>
                    </li>
                  ))}
                  {(activePage?.blocks.length ?? 0) === 0 && (
                    <li className="text-[11px] text-stone-400 px-2">Belum ada blok di halaman ini.</li>
                  )}
                </ul>
              </section>
            </aside>

            {/* ---------- CANVAS ---------- */}
            <main className="flex-1 min-w-0 bg-stone-100 overflow-auto p-6 flex justify-center">
              <NewspaperA4Canvas
                data={newspaperData}
                activePageIndex={activePageIndex}
                isEditorMode={isEditorMode}
                scalePercent={previewScale}
                onUpdateBlock={handleUpdateBlock}
                onDeleteBlock={(pi, id) => {
                  if (editingBlock?.block.id === id) setEditingBlock(null);
                  handleDeleteBlock(pi, id);
                }}
                onReorderBlocks={handleReorderBlocks}
                onOpenAddModal={handleOpenAddModal}
                onOpenEditModal={handleOpenEditModal}
                selectedBlockId={editingBlock?.block.id ?? null}
                onOpenHeaderModal={handleOpenHeaderModal}
                onAddBlock={handleAddBlockDirect}
                onUpdatePageHeader={handleUpdatePageHeader}
                onUpdateCoverVersion={handleUpdateCoverVersion}
              />
            </main>

            {/* ---------- RIGHT INSPECTOR ---------- */}
            <aside className={`${editingBlock ? "w-[24rem]" : "w-72"} shrink-0 border-l border-stone-200 overflow-y-auto p-4 hidden lg:block transition-[width]`}>
              {editPanel ? (
                editPanel
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 px-4">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <MousePointer2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-stone-900">Belum ada blok dipilih</p>
                  <p className="text-xs text-stone-500">
                    Klik kotak section di halaman (atau di daftar Layer) untuk menyunting isinya di sini.
                  </p>
                </div>
              )}
            </aside>
          </div>

          {/* ===================== BOTTOM BAR (ZOOM) ===================== */}
          <div className="h-10 shrink-0 border-t border-stone-200 px-4 flex items-center justify-between text-xs text-stone-500">
            <span className="truncate">
              Halaman {activePageIndex + 1} — {activePage?.showCoverMasthead ? "Cover" : activePage?.runningHeader || "Isi"} · A4 (210 × 297 mm)
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPreviewScale((s) => Math.max(40, s - 5))} className="p-1 hover:text-stone-900 cursor-pointer" title="Perkecil">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min={40}
                max={120}
                step={5}
                value={previewScale}
                onChange={(e) => setPreviewScale(Number(e.target.value))}
                className="w-32 accent-[#7F0000]"
                aria-label="Zoom"
              />
              <button type="button" onClick={() => setPreviewScale((s) => Math.min(120, s + 5))} className="p-1 hover:text-stone-900 cursor-pointer" title="Perbesar">
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-right font-semibold text-stone-700">{previewScale}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#7F0000]" />
            <h1 className="text-lg font-black text-stone-900 tracking-tight">Arsip Edisi Koran</h1>
          </div>
          <button type="button" onClick={() => setActiveViewTab("editor")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#7F0000] text-white cursor-pointer">
            <Layout className="w-4 h-4" />
            <span>Kembali ke Editor</span>
          </button>
        </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: "text_columns", label: "Teks Kolom Koran", icon: Columns },
                    { id: "photo_story", label: "Berita Foto", icon: ImageIcon },
                    { id: "hero_greeting", label: "Banner Tokoh / Ucapan", icon: Shield },
                    { id: "ad_banner", label: "Slot Iklan Sponsor", icon: Sparkles },
                    { id: "redaksi_box", label: "Boks Redaksi (Gambar 2)", icon: BookOpen },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setFormType(t.id as NewspaperBlock["type"]);
                        if (t.id === "redaksi_box") {
                          setFormColSpan(5);
                          setFormTitle("BOKS SUSUNAN REDAKSI");
                          setFormThemeColor("white");
                        }
                      }}
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

                {/* Info khusus Boks Susunan Redaksi Gambar 2 */}
                {formType === "redaksi_box" && (
                  <div className="mt-2.5 p-3 bg-stone-100 rounded-xl border border-stone-300 text-stone-700 text-xs space-y-1">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-stone-700" />
                      <span>Boks Susunan Redaksi (Format Resmi Cetak Koran Sesuai Gambar 2)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-stone-600">
                      Menyisipkan boks susunan redaksi resmi lengkap dengan logo hitam putih, legalitas pers (UU Pokok Pers No. 40/1999 &amp; Sertifikat Dewan Pers SPRI), hierarki Dewan Pembina s/d jajaran wartawan, dan kontak alamat redaksi pusat persis seperti pada <strong>Gambar 2</strong>.
                    </p>
                    <p className="text-[10px] text-stone-500 font-semibold">
                      * Lebar otomatis diatur <strong>5 kolom</strong> agar berdampingan serasi dengan berita 7 kolom di sebelah kanan.
                    </p>
                  </div>
                )}
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
                <div className="flex items-center gap-2 mb-2 p-2 rounded-lg border border-stone-200 bg-stone-50">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(formCustomColor) ? formCustomColor : "#ffffff"}
                    onChange={(e) => applyCustomColor(e.target.value.toUpperCase())}
                    className="w-9 h-9 p-0 border border-stone-300 rounded cursor-pointer bg-white"
                    aria-label="Pilih warna latar"
                  />
                  <input
                    type="text"
                    value={formCustomColor}
                    maxLength={7}
                    placeholder="#RRGGBB (warna kustom)"
                    onChange={(e) => {
                      let v = e.target.value.trim();
                      if (v && !v.startsWith("#")) v = "#" + v;
                      applyCustomColor(v.toUpperCase());
                    }}
                    className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-stone-300 rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-red-600"
                  />
                  {formCustomColor && (
                    <button
                      type="button"
                      onClick={() => applyCustomColor("")}
                      className="px-2 py-1.5 text-[10px] font-bold text-stone-600 hover:bg-stone-200 rounded cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
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
                      onClick={() => applyThemePreset(tc.id as NewspaperBlock["themeColor"])}
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

              {/* Image upload / URL with Live Preview & WebP status */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-700">
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
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
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

                {/* Live Preview Card */}
                {formImage && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3">
                    <div className="relative w-16 h-14 rounded-lg overflow-hidden border border-emerald-400 shrink-0 bg-white shadow-2xs">
                      <img
                        src={formImage}
                        alt="Preview Foto"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/ads/iklan-bunga.jpeg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Foto Berhasil Diunggah &amp; Siap Ditampilkan</span>
                      </div>
                      <p className="text-[10px] text-stone-600 truncate mt-0.5 font-mono">
                        {formImage}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormImage("")}
                      className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold rounded-md transition-colors cursor-pointer shrink-0"
                      title="Hapus foto ini"
                    >
                      Hapus
                    </button>
                  </div>
                )}

                {uploading && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-amber-900 text-xs font-bold animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                    <span>Sedang memproses kompresi WebP &amp; mengunggah gambar...</span>
                  </div>
                )}
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
                disabled={uploading}
                onClick={handleSaveAddBlock}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#E50914] hover:bg-[#B91C1C] text-white shadow-xs cursor-pointer disabled:opacity-50"
              >
                {uploading ? "Sedang Mengompres..." : "Tambahkan Kotak ke Halaman"}
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
