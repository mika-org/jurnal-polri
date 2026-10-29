export interface NewspaperBlock {
  id: string;
  type: "hero_greeting" | "article" | "photo_story" | "text_columns" | "ad_banner" | "redaksi_box";
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
  themeColor?: "blue" | "orange" | "red" | "dark" | "gold" | "white";
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
  coverVersion?: "v1_lama" | "v2_baru"; // Versi cover: "v1_lama" (Gambar 1: Strip Merah, Kotak Biru Klasik) atau "v2_baru" (Existing Modern: Strip Oranye 3 Segmen, Card Oranye)
  runningHeader?: string; // Judul rubrik/header per halaman (misal: "JENDELA REDAKSI", "BERITA DAERAH")
  isGrayscale?: boolean; // Pilihan halaman menjadi Hitam Putih (B&W)
  blocks: NewspaperBlock[];
}

export interface MultiPageNewspaperData {
  masthead: {
    image?: string;
    showEditionBar?: boolean;
    editionBadge: string;
    coverVersion?: "v1_lama" | "v2_baru"; // Versi cover global/default
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

// Preset Section Cover Versi Lama (Gambar 1: Kotak Biru Klasik Khas Koran Cetak Jurnal Polisi)
export const COVER_PRESET_V1_LAMA: NewspaperBlock[] = [
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
    themeColor: "red",
  },
  {
    id: "block-side-2",
    type: "photo_story",
    title: "Kapolres Serdang Bedagai Turut Hadiri Peninjauan Sekolah Rakyat Terintegrasi I, Mendukung Program Pendidikan Terpadu.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
    colSpan: 5,
    themeColor: "red",
  },
  {
    id: "block-side-3",
    type: "photo_story",
    title: "Satlantas Polresta Tangerang Tangani Laka Lantas Forklift Tabrak Rumah Di Kronjo Sesuai Prosedur.",
    image: "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?q=80&w=800&auto=format&fit=crop",
    colSpan: 5,
    themeColor: "red",
  },
  {
    id: "block-bottom-1",
    type: "text_columns",
    title: "Polres Asahan Gagalkan Penyelundupan 1,5 Kg Sabu Jaringan Malaysia Dan Musnahkan 4,8 Kg Sabu Serta 268 Ekstasi.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop",
    content:
      "Asahan, Jurnalpolisi.co.id - Satuan Reserse Narkoba Polres Asahan menunjukkan komitmen nyata dalam pemberantasan peredaran narkotika. Dalam sepekan terakhir, Polres Asahan berhasil menggagalkan penyelundupan sabu jaringan internasional dan sekaligus melaksanakan pemusnahan barang bukti narkotika hasil pengungkapan kasus September 2026.\n\nBerdasarkan Penetapan Status BB Nomor B-407/L.2.23/Enz-1/09/2026 tanggal 04 September 2026, barang bukti yang dimusnahkan yakni 1 bungkus teh Cina merk Qingshan Pan Wei seberat 5.621,29 gram, 2 bungkus plastik bening seberat 1.377,62 gram, dan 268 butir ekstasi.",
    colSpan: 6,
    textColumns: 2,
    themeColor: "blue",
    imagePosition: "left",
    fontSize: "xs",
  },
  {
    id: "block-bottom-2",
    type: "text_columns",
    title: "Coffee Morning Kejari Dan Polres Kuningan Perkuat Silaturahmi Serta Keterbukaan Informasi Publik.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
    content:
      "Kuningan, Jurnalpolisi.co.id - Kejaksaan Negeri Kuningan menggelar kegiatan Coffee Morning bersama insan pers, lembaga swadaya masyarakat (LSM), dan organisasi kemasyarakatan (ormas), Kamis (23/10/2026).\n\nKegiatan yang dimulai sekitar pukul 09.00 WIB hingga selesai tersebut berlangsung di Kantor Kejaksaan Negeri Kuningan. Acara dihadiri Kepala Kejaksaan Negeri Kuningan, Dadan Sukmana, S.H., M.H., didampingi para Kasi. Turut hadir dalam kegiatan tersebut perwakilan media dan ormas di Kabupaten Kuningan. Coffee Morning berlangsung dalam suasana santai dan penuh kekeluargaan.",
    colSpan: 6,
    textColumns: 2,
    themeColor: "blue",
    imagePosition: "right",
    fontSize: "xs",
  },
];

// Preset Section Cover Versi Baru (Existing Modern: Card Oranye & Modern Header Bars)
export const COVER_PRESET_V2_BARU: NewspaperBlock[] = [
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
    title: "Polres Asahan Gagalkan Penyelundupan 1,5 Kg Sabu Jaringan Malaysia Dan Musnahkan 4,8 Kg Sabu Serta 268 Ekstasi.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop",
    content:
      "Asahan, Jurnalpolisi.co.id - Satuan Reserse Narkoba Polres Asahan menunjukkan komitmen nyata dalam pemberantasan peredaran narkotika. Petugas berhasil mengamankan 1,5 kg sabu dan ratusan butir pil ekstasi sebagai komitmen presisi Polri menjaga generasi bangsa.",
    colSpan: 6,
    textColumns: 2,
    themeColor: "orange",
    imagePosition: "left",
    fontSize: "xs",
  },
  {
    id: "block-bottom-2",
    type: "text_columns",
    title: "Coffee Morning Kejari Dan Polres Kuningan Perkuat Silaturahmi Serta Keterbukaan Informasi Publik.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
    content:
      "Kuningan, Jurnalpolisi.co.id - Jajaran Kejaksaan Negeri bersama Polres Kuningan menggelar dialog pagi santai bersama insan pers dan tokoh masyarakat guna memperkuat sinergitas transparansi penegakan hukum.",
    colSpan: 6,
    textColumns: 2,
    themeColor: "orange",
    imagePosition: "left",
    fontSize: "xs",
  },
];

// Preset Halaman 2 Sesuai Gambar 2 (Jendela Redaksi & Box Redaksi)
export const PAGE_2_PRESET_JENDELA_REDAKSI: NewspaperPage = {
  id: "page-2",
  pageNumber: 2,
  title: "Halaman 2 - Jendela Redaksi",
  showCoverMasthead: false,
  runningHeader: "JENDELA REDAKSI",
  isGrayscale: true, // Hitam Putih Saja Sesuai Gambar 2!
  blocks: [
    {
      id: "block-redaksi-box",
      type: "redaksi_box",
      title: "SUSUNAN REDAKSI JURNAL POLISI",
      content:
        "Terbit berdasarkan : UU Pokok Pers No. 40 Tahun 1999\nPT. MEDIA JURNAL PERS\nNomor : AHU-00027.AH.01.01.TAHUN 2017 - NPWP : 95.994.024.0-424.000\nVERIFIKASI DEWAN PERS INDONESIA SPRI\nNO : 153/Sert-Pers-SPRI/X/2021\n\nDEWAN PEMBINA :\nIrjen Pol. (Purn.) Anton Charliyan, Brigjen TNI Syahnan, Rahmatono Saputra, Didik Wibowo, Ams Rahoma, Andi C. Momon, N.Ag\n\nDEWAN PENASEHAT :\nIrjen Pol. (Purn.) Anton Charliyan, Brigjen TNI Syahnan, Levi Ahimaya, Romy Kasnadi, Yentry Agung Sudaryo, Hilman Muslim, Gaspar Santika\n\nPENASEHAT HUKUM :\nAdv. Ade Rusmana, S.H.\nSadriyah Nur Quryadi, S.H.\nMuhammad Rizal Tanjung\n\nPENANGGUNG JAWAB :\nGronaldi, Royan\n\nPIMPINAN UMUM :\nHerrydi Suryanegara\n\nBENDAHARA UMUM :\nIndriyani\n\nPIMPINAN PERUSAHAAN :\nHerrydi Suryanegara\n\nPIMPINAN REDAKSI :\nGronaldi\n\nWAKIL PIMPINAN REDAKSI :\nRomi Sartono\n\nREDAKTUR PELAKSANA :\nCecep Supriyadi\n\nSEKRETARIS REDAKSI :\nSyamsuhadi Nugraha",
      colSpan: 5,
      textColumns: 1,
      themeColor: "white",
      fontSize: "xs",
    },
    {
      id: "block-story-voli",
      type: "text_columns",
      title: "Turnamen Bola Voli Lurah Kopo Dibuka, RW. 11 Dan RW. 12 Adu Sportivitas.",
      image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=800&auto=format&fit=crop",
      content:
        "Bandung, Jurnalpolisi.co.id - Semangat olahraga sekaligus kebersamaan warga mewarnai pembukaan Turnamen Bola Voli Lurah Kopo yang berlangsung di Lapangan Serbaguna RW 11, Kelurahan Kopo, Kecamatan Bojongloa Kaler, Kota Bandung.\n\nPembukaan turnamen ditandai dengan pertandingan antara RW 11 dan RW 12, baik untuk kategori putra maupun putri. Pertandingan tersebut berlangsung dalam suasana penuh antusiasme, dengan dukungan warga yang hadir memberikan semangat kepada para pemain.\n\nLurah Kopo bersama jajaran turut hadir dalam kegiatan tersebut. Kehadiran pemerintah kelurahan menjadi bentuk dukungan terhadap kegiatan olahraga masyarakat sekaligus upaya mendorong terciptanya ruang interaksi positif antar warga.\n\nTurnamen ini tidak hanya menjadi ajang untuk menunjukkan kemampuan dan prestasi di bidang olahraga. Kegiatan tersebut juga menjadi momentum bagi warga untuk mempererat tali silaturahmi, membangun komunikasi, serta memperkuat rasa kebersamaan di lingkungan Kelurahan Kopo.",
      colSpan: 7,
      textColumns: 2,
      imagePosition: "top",
      themeColor: "white",
      fontSize: "xs",
    },
    {
      id: "block-story-seblak",
      type: "text_columns",
      title: "MENGAIS REZEKI MELALUI GEROBAK SEBLAK. Penuh Suka Dan Duka, Ibu Etin Tetap Bertahan Menjajakan Kuliner Seblak",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
      content:
        "Tangerang, Jurnalpolisi.co.id - Di balik sebuah gerobak sederhana, tersimpan kisah perjuangan seorang perempuan bernama Ibu Etin. Setiap hari, ia berusaha mengisi rezeki dengan menjajakan aneka kuliner untuk memenuhi kebutuhan hidup sekaligus mempertahankan usaha yang telah dijalaninya.\n\nIbu Etin menawarkan berbagai makanan yang akrab di lidah masyarakat, seperti seblak, lumpia basah, serta sejumlah kuliner khas Bandung. Dengan peralatan dan gerobak sederhana, ia tetap setia melayani pelanggan dan menjaga agar usahanya terus berjalan.\n\nMenjadi pedagang kuliner bukanlah pekerjaan yang selalu mudah. Ada hari ketika dagangannya ramai dan membawa kebahagiaan karena penghasilan yang didapat cukup baik. Namun, ada pula saat pembeli sepi sehingga pendapatan tidak sesuai dengan harapan.",
      colSpan: 7,
      textColumns: 2,
      imagePosition: "left",
      themeColor: "white",
      fontSize: "xs",
    },
  ],
};

// Default initial data: Page 1 (Cover Versi Lama / Gambar 1) & Page 2 (Jendela Redaksi / Gambar 2)
export const DEFAULT_MULTIPAGE_DATA: MultiPageNewspaperData = {
  masthead: {
    image: "/images/header-koran-default.webp",
    showEditionBar: true,
    coverVersion: "v1_lama",
    title: "JURNAL POLISI",
    taglineTop: "MEDIA MITRA TNI & POLRI",
    taglineBottom: "MEMBEDAH ASPIRASI, MEMBERI SOLUSI",
    editionBadge: "EDISI OKTOBER 2026",
    website: "WWW.JURNALPOLISI.CO.ID",
    organization: "KEPOLISIAN ASPIRASI MASYARAKAT",
  },
  pages: [
    {
      id: "page-1",
      pageNumber: 1,
      title: "Halaman 1 - Cover Utama",
      showCoverMasthead: true,
      coverVersion: "v1_lama",
      runningHeader: "JURNAL POLISI • EDISI KHUSUS MITRA POLRI & TNI",
      blocks: COVER_PRESET_V1_LAMA,
    },
    PAGE_2_PRESET_JENDELA_REDAKSI,
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
          coverVersion: parsed.masthead?.coverVersion || "v1_lama",
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
          themeColor: "blue" as const,
        })),
        ...parsed.bottomArticles.map((b: { id?: string; title: string; image: string; content: string }, idx: number) => ({
          id: b.id || `bottom-${idx + 1}`,
          type: "text_columns" as const,
          title: b.title,
          image: b.image,
          content: b.content,
          colSpan: 6,
          textColumns: 2,
          themeColor: "blue" as const,
        })),
      ];

      return {
        masthead: parsed.masthead
          ? { ...parsed.masthead, coverVersion: "v1_lama" }
          : DEFAULT_MULTIPAGE_DATA.masthead,
        pages: [
          {
            id: "page-1",
            pageNumber: 1,
            title: "Halaman 1 - Cover Utama",
            showCoverMasthead: true,
            coverVersion: "v1_lama",
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
