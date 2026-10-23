export interface NewspaperBlock {
  id: string;
  type: "hero_greeting" | "article" | "photo_story" | "text_columns" | "ad_banner";
  title: string;
  subtitle?: string;
  greeting?: string;
  name?: string;
  positionPrefix?: string;
  position?: string;
  positionSub?: string;
  image?: string;
  content?: string;
  colSpan: number; // 3 = 1/4, 4 = 1/3, 6 = 1/2, 8 = 2/3, 9 = 3/4, 12 = Full
  textColumns?: number; // 1, 2, 3, 4
  height?: "auto" | "sm" | "md" | "lg" | "xl";
  category?: string;
  badge?: string;
  themeColor?: "orange" | "red" | "dark" | "gold" | "white";
  imageWidth?: number; // Lebar gambar kustom dalam pixel
  imageHeight?: number; // Tinggi gambar kustom dalam pixel
  imagePosition?: "left" | "right" | "top" | "bottom"; // Tata letak posisi gambar terhadap teks
  fontSize?: "xs" | "sm" | "base"; // Ukuran font teks naskah (xs: 7.5px, sm: 8.5px, base: 9.5px)
  customHeight?: number; // Tinggi section kustom dalam pixel (hasil resize mouse)
}

export interface NewspaperPage {
  id: string;
  pageNumber: number;
  title: string;
  showCoverMasthead: boolean;
  runningHeader?: string;
  isGrayscale?: boolean; // Pilihan halaman menjadi Hitam Putih (B&W)
  blocks: NewspaperBlock[];
}

export interface MultiPageNewspaperData {
  masthead: {
    image?: string;
    showEditionBar?: boolean;
    editionBadge: string;
    title?: string;
    taglineTop?: string;
    taglineBottom?: string;
    website?: string;
    organization?: string;
  };
  isGrayscale?: boolean; // Pilihan global edisi koran menjadi Hitam Putih (B&W)
  isDraft?: boolean;
  pages: NewspaperPage[];
}

// Default initial data matching Image 2 exactly
export const DEFAULT_MULTIPAGE_DATA: MultiPageNewspaperData = {
  masthead: {
    image: "/images/header-koran-default.webp",
    showEditionBar: true,
    title: "JURNAL POLISI",
    taglineTop: "MEDIA MITRA POLRI & TNI",
    taglineBottom: "MEMBEDAH ASPIRASI, MEMBERI SOLUSI",
    editionBadge: "EDISI NOVEMBER 2026",
    website: "WWW.JURNALPOLISI.CO.ID",
    organization: "KEPOLISIAN ASPIRASI MASYARAKAT",
  },
  pages: [
    {
      id: "page-1",
      pageNumber: 1,
      title: "Halaman 1 - Cover Utama",
      showCoverMasthead: true,
      runningHeader: "JURNAL POLISI • EDISI KHUSUS MITRA POLRI & TNI",
      blocks: [
        {
          id: "block-hero",
          type: "hero_greeting",
          title: "Selamat dan Sukses",
          greeting: "Selamat dan Sukses",
          name: "JENDERAL POLISI Drs. SUYUDI ARIO SETO, S.H., M.Si.",
          positionPrefix: "SEBAGAI",
          position: "KAPOLRI",
          positionSub: "KEPALA KEPOLISIAN NEGARA REPUBLIK INDONESIA",
          image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop",
          colSpan: 7,
          themeColor: "dark",
        },
        {
          id: "block-side-1",
          type: "photo_story",
          title: "Peringati Hari Kontrasepsi Sedunia, Wali Kota Tebing Tinggi Tegaskan 4 Komitmen Penting.",
          image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=800&auto=format&fit=crop",
          colSpan: 5,
          themeColor: "orange",
        },
        {
          id: "block-side-2",
          type: "photo_story",
          title: "Kapolres Serdang Bedagai Turut Hadiri Peninjauan Sekolah Rakyat Terintegrasi I, Mendukung Program Pendidikan Terpadu.",
          image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
          colSpan: 5,
          themeColor: "orange",
        },
        {
          id: "block-side-3",
          type: "photo_story",
          title: "Satlantas Polresta Tangerang Tangani Laka Lantas Forklift Tabrak Rumah Di Kronjo Sesuai Prosedur.",
          image: "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?q=80&w=800&auto=format&fit=crop",
          colSpan: 5,
          themeColor: "orange",
        },
        {
          id: "block-bottom-1",
          type: "text_columns",
          title: "Polres Asahan Gagalkan Penyelundupan 1,5 Kg Sabu Jaringan Malaysia Dan Musnahkan Barang Bukti Narkoba.",
          image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop",
          content:
            "Asahan, Jurnalpolisi.co.id - Satuan Reserse Narkoba Polres Asahan menunjukkan komitmen nyata dalam pemberantasan peredaran narkotika. Dalam pengungkapan kasus jaringan internasional, petugas berhasil mengamankan 1,5 kg sabu dan ratusan butir pil ekstasi. Langkah tegas ini diapresiasi oleh berbagai elemen masyarakat sebagai wujud presisi kepolisian dalam menjaga generasi penerus bangsa dari ancaman bahaya narkoba.",
          colSpan: 6,
          textColumns: 2,
          themeColor: "orange",
        },
        {
          id: "block-bottom-2",
          type: "text_columns",
          title: "Coffee Morning Kejari Dan Polres Kuningan Perkuat Silaturahmi Serta Keterbukaan Informasi Publik.",
          image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
          content:
            "Kuningan, Jurnalpolisi.co.id - Jajaran Kejaksaan Negeri bersama Kepolisian Resort menggelar dialog pagi santai bersama insan pers dan tokoh masyarakat. Kegiatan yang berlangsung di aula utama ini bertujuan memperkuat sinergitas transparansi penegakan hukum dan respon cepat terhadap aspirasi warga di lapangan.",
          colSpan: 6,
          textColumns: 2,
          themeColor: "orange",
        },
      ],
    },
  ],
};

// Migration helper: Converts old single-page JSON layout to multi-page data safely
export function parseNewspaperData(rawJson: string | null | undefined): MultiPageNewspaperData {
  if (!rawJson) return DEFAULT_MULTIPAGE_DATA;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
      if (!parsed.masthead?.image) {
        parsed.masthead = {
          ...parsed.masthead,
          image: "/images/header-koran-default.webp",
          showEditionBar: parsed.masthead?.showEditionBar !== false,
        };
      }
      return parsed as MultiPageNewspaperData;
    }

    // Convert old single-page structure
    if (parsed.headline && parsed.sideStories && parsed.bottomArticles) {
      const blocks: NewspaperBlock[] = [
        {
          id: "block-hero",
          type: "hero_greeting",
          title: parsed.headline.greeting || "Selamat dan Sukses",
          greeting: parsed.headline.greeting,
          name: parsed.headline.name,
          positionPrefix: parsed.headline.positionPrefix,
          position: parsed.headline.position,
          positionSub: parsed.headline.positionSub,
          image: parsed.headline.image,
          colSpan: 7,
          themeColor: "dark",
        },
        ...parsed.sideStories.map((s: { id?: string; title: string; image: string }, idx: number) => ({
          id: s.id || `side-${idx + 1}`,
          type: "photo_story" as const,
          title: s.title,
          image: s.image,
          colSpan: 5,
          themeColor: "orange" as const,
        })),
        ...parsed.bottomArticles.map((b: { id?: string; title: string; image: string; content: string }, idx: number) => ({
          id: b.id || `bottom-${idx + 1}`,
          type: "text_columns" as const,
          title: b.title,
          image: b.image,
          content: b.content,
          colSpan: 6,
          textColumns: 2,
          themeColor: "orange" as const,
        })),
      ];

      return {
        masthead: parsed.masthead || DEFAULT_MULTIPAGE_DATA.masthead,
        pages: [
          {
            id: "page-1",
            pageNumber: 1,
            title: "Halaman 1 - Cover Utama",
            showCoverMasthead: true,
            runningHeader: "JURNAL POLISI • EDISI KHUSUS MITRA POLRI & TNI",
            blocks,
          },
        ],
      };
    }

    return DEFAULT_MULTIPAGE_DATA;
  } catch {
    return DEFAULT_MULTIPAGE_DATA;
  }
}
