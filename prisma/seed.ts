import { PrismaClient, StatusArtikel, PenempatanIklan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database Jurnal Polisi...");

  // 1. Bersihkan data lama jika ada
  await prisma.pesanKontak.deleteMany({});
  await prisma.pengaturan.deleteMany({});
  await prisma.halaman.deleteMany({});
  await prisma.iklan.deleteMany({});
  await prisma.artikelTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.artikel.deleteMany({});
  await prisma.kategori.deleteMany({});
  await prisma.tokenPenyegar.deleteMany({});
  await prisma.pengguna.deleteMany({});
  await prisma.peranIzin.deleteMany({});
  await prisma.izin.deleteMany({});
  await prisma.peran.deleteMany({});
  await prisma.superGrup.deleteMany({});

  console.log("✓ Data lama dibersihkan");

  // 2. Buat Super Grup
  const sgSuperAdmin = await prisma.superGrup.create({
    data: {
      nama: "Super Admin",
      slug: "super-admin",
      deskripsi: "Akses penuh sistem",
      adalah_sistem: true,
    },
  });

  const sgRedaksi = await prisma.superGrup.create({
    data: {
      nama: "Redaksi",
      slug: "redaksi",
      deskripsi: "Tim redaksi peliputan dan penerbitan berita",
      adalah_sistem: false,
    },
  });

  const sgPeriklanan = await prisma.superGrup.create({
    data: {
      nama: "Periklanan",
      slug: "periklanan",
      deskripsi: "Pengelolaan banner dan penempatan iklan mitra",
      adalah_sistem: false,
    },
  });

  console.log("✓ Super Grup berhasil dibuat");

  // 3. Buat Izin (Permissions)
  const permissionsList = [
    { kode: "*", deskripsi: "Akses penuh seluruh modul sistem" },
    { kode: "article:*", deskripsi: "Kelola semua artikel" },
    { kode: "article:create", deskripsi: "Buat artikel baru" },
    { kode: "article:update", deskripsi: "Sunting artikel apapun" },
    { kode: "article:update:own", deskripsi: "Sunting artikel milik sendiri" },
    { kode: "article:publish", deskripsi: "Terbitkan atau arsipkan artikel" },
    { kode: "article:delete", deskripsi: "Hapus artikel" },
    { kode: "category:*", deskripsi: "Kelola seluruh kategori" },
    { kode: "category:read", deskripsi: "Lihat daftar kategori" },
    { kode: "slider:*", deskripsi: "Kelola slider headline utama" },
    { kode: "page:*", deskripsi: "Kelola halaman statis (Redaksi, ToS, dll)" },
    { kode: "user:read", deskripsi: "Lihat data pengguna" },
    { kode: "user:*", deskripsi: "Kelola seluruh data pengguna" },
    { kode: "ad:*", deskripsi: "Kelola seluruh penempatan iklan" },
    { kode: "ad:create", deskripsi: "Buat iklan baru" },
    { kode: "ad:update", deskripsi: "Sunting iklan" },
    { kode: "setting:update", deskripsi: "Sunting pengaturan portal" },
  ];

  const createdPermissions: Record<string, string> = {};
  for (const perm of permissionsList) {
    const p = await prisma.izin.create({
      data: perm,
    });
    createdPermissions[perm.kode] = p.id;
  }

  console.log("✓ Izin (Permissions) berhasil dibuat");

  // 4. Buat Peran (Roles) & Pasang Izin
  const roleOwner = await prisma.peran.create({
    data: {
      nama: "Owner",
      slug: "owner",
      super_grup_id: sgSuperAdmin.id,
      deskripsi: "Pemilik sistem dengan hak akses tak terbatas",
    },
  });
  await prisma.peranIzin.create({
    data: { peran_id: roleOwner.id, izin_id: createdPermissions["*"] },
  });

  const rolePemred = await prisma.peran.create({
    data: {
      nama: "Pemimpin Redaksi",
      slug: "pemred",
      super_grup_id: sgRedaksi.id,
      deskripsi: "Penanggung jawab isi konten dan kebijakan redaksi",
    },
  });
  for (const code of ["article:*", "category:*", "slider:*", "page:*", "user:read"]) {
    await prisma.peranIzin.create({
      data: { peran_id: rolePemred.id, izin_id: createdPermissions[code] },
    });
  }

  const roleEditor = await prisma.peran.create({
    data: {
      nama: "Editor",
      slug: "editor",
      super_grup_id: sgRedaksi.id,
      deskripsi: "Pemeriksa dan penerbit naskah berita",
    },
  });
  for (const code of ["article:create", "article:update", "article:publish", "category:read"]) {
    await prisma.peranIzin.create({
      data: { peran_id: roleEditor.id, izin_id: createdPermissions[code] },
    });
  }

  const roleReporter = await prisma.peran.create({
    data: {
      nama: "Reporter",
      slug: "reporter",
      super_grup_id: sgRedaksi.id,
      deskripsi: "Penyusun draf liputan lapangan",
    },
  });
  for (const code of ["article:create", "article:update:own"]) {
    await prisma.peranIzin.create({
      data: { peran_id: roleReporter.id, izin_id: createdPermissions[code] },
    });
  }

  const roleManajerIklan = await prisma.peran.create({
    data: {
      nama: "Manajer Iklan",
      slug: "manajer-iklan",
      super_grup_id: sgPeriklanan.id,
      deskripsi: "Pengatur jadwal dan posisi tayang iklan",
    },
  });
  for (const code of ["ad:*", "setting:update"]) {
    await prisma.peranIzin.create({
      data: { peran_id: roleManajerIklan.id, izin_id: createdPermissions[code] },
    });
  }

  console.log("✓ Peran dan hak akses berhasil dibuat");

  // 5. Buat Pengguna Utama (Admin & Editor)
  const passwordHashAdmin = await bcrypt.hash("admin123", 12);
  const userAdmin = await prisma.pengguna.create({
    data: {
      nama_pengguna: "admin",
      nama_lengkap: "Administrator Super",
      email: "admin@jurnalpolisi.id",
      kata_sandi: passwordHashAdmin,
      aktif: true,
      peran_id: roleOwner.id,
    },
  });

  const passwordHashEditor = await bcrypt.hash("editor123", 12);
  const userEditor = await prisma.pengguna.create({
    data: {
      nama_pengguna: "editor",
      nama_lengkap: "Bripka Hendra Wijaya",
      email: "hendra@jurnalpolisi.id",
      kata_sandi: passwordHashEditor,
      aktif: true,
      peran_id: roleEditor.id,
    },
  });

  console.log("✓ Pengguna admin & editor berhasil dibuat");

  // 6. Buat Kategori
  const katPolitik = await prisma.kategori.create({
    data: {
      nama: "Politik",
      slug: "politik",
      slogan: "Isu Strategis Bangsa",
      ikon: "Flag",
      tampil_di_cepat: true,
      urutan: 1,
    },
  });

  const katHukum = await prisma.kategori.create({
    data: {
      nama: "Hukum",
      slug: "hukum",
      slogan: "Keadilan & Penegakan",
      ikon: "Scale",
      tampil_di_cepat: true,
      urutan: 2,
    },
  });

  const katSosial = await prisma.kategori.create({
    data: {
      nama: "Sosial",
      slug: "sosial",
      slogan: "Masyarakat & Humaniora",
      ikon: "Users",
      tampil_di_cepat: true,
      urutan: 3,
    },
  });

  const katPatroli = await prisma.kategori.create({
    data: {
      nama: "Patroli",
      slug: "patroli",
      slogan: "Kamtibmas & Operasi Presisi",
      ikon: "ShieldAlert",
      tampil_di_cepat: false,
      urutan: 4,
    },
  });

  const katLaluLintas = await prisma.kategori.create({
    data: {
      nama: "Lalu Lintas",
      slug: "lalu-lintas",
      slogan: "Keselamatan Jalan Raya",
      ikon: "Car",
      tampil_di_cepat: false,
      urutan: 5,
    },
  });

  console.log("✓ Kategori berhasil dibuat");

  // 7. Buat Tag
  const tagsList = ["Presisi", "Operasi Lilin", "Kamtibmas", "Bareskrim", "Korlantas", "Humanis", "E-Tilang"];
  const createdTags: Record<string, string> = {};
  for (const t of tagsList) {
    const tag = await prisma.tag.create({
      data: {
        nama: t,
        slug: t.toLowerCase().replace(/\s+/g, "-"),
      },
    });
    createdTags[t] = tag.id;
  }

  // 8. Buat Iklan dengan iklan-bunga.jpeg
  // SESUAI PERMINTAAN PENGGUNA: gunakan iklan-bunga.jpeg ini sebagai iklan
  await prisma.iklan.createMany({
    data: [
      {
        judul: "Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan 24 Jam",
        gambar: "/images/ads/iklan-bunga.jpeg",
        tautan: "https://wa.me/6281234567890?text=Halo%20Toko%20Bunga%20Sejahtera%2C%20saya%20tertarik%20dengan%20karangan%20bunga",
        posisi: PenempatanIklan.SIDEBAR,
        aktif: true,
        urutan: 1,
      },
      {
        judul: "Pusat Karangan Bunga & Florist Terbaik - Diskon Khusus Anggota",
        gambar: "/images/ads/iklan-bunga.jpeg",
        tautan: "https://wa.me/6281234567890?text=Halo%20Florist%2C%20saya%20ingin%20tanya%20promo%20bunga",
        posisi: PenempatanIklan.HOME_STRIP,
        aktif: true,
        urutan: 1,
      },
      {
        judul: "Layanan Bunga Duka Cita & Ucapan Selamat Kirim Cepat se-Indonesia",
        gambar: "/images/ads/iklan-bunga.jpeg",
        tautan: "https://wa.me/6281234567890?text=Halo%20saya%20pesan%20bunga%20ucapan",
        posisi: PenempatanIklan.ARTICLE_TOP,
        aktif: true,
        urutan: 1,
      },
      {
        judul: "Florist Mitra Resmi Jurnal Polisi - Kualitas Bunga Segar & Terpercaya",
        gambar: "/images/ads/iklan-bunga.jpeg",
        tautan: "https://wa.me/6281234567890?text=Halo%20mitra%20florist",
        posisi: PenempatanIklan.FOOTER,
        aktif: true,
        urutan: 1,
      },
    ],
  });

  console.log("✓ Iklan banner (iklan-bunga.jpeg) berhasil di-seed");

  // 9. Buat Artikel Berita Realistis & Berkualitas Tinggi
  const articlesData = [
    {
      judul: "Kapolri Tegaskan Komitmen Pelayanan Humanis dan Transparansi Berkeadilan",
      slug: "kapolri-tegaskan-komitmen-pelayanan-humanis-dan-transparansi-berkeadilan",
      ringkasan: "Dalam apel akbar kesiapan jajaran, Kapolri menekankan pentingnya pendekatan dialogis dan respon cepat terhadap setiap keluhan masyarakat di seluruh Indonesia.",
      konten: `<p><strong>JAKARTA</strong> — Kepala Kepolisian Negara Republik Indonesia (Kapolri) kembali menegaskan komitmen institusi kepolisian dalam menghadirkan pelayanan yang humanis, transparan, dan berkeadilan bagi seluruh lapisan masyarakat.</p><p>Dalam arahannya di hadapan seluruh perwira tinggi dan pejabat utama polda jajaran, ditekankan bahwa transformasi menuju Polri yang Presisi (Prediktif, Responsibilitas, Transparansi Berkeadilan) bukanlah sekadar slogan, melainkan pedoman kerja nyata di lapangan.</p><h3>Penguatan Pengawasan Internal dan Eksternal</h3><p>Kapolri menginstruksikan seluruh pimpinan satuan kerja untuk memperketat pengawasan melekat terhadap perilaku anggota saat berinteraksi langsung dengan warga. Pemanfaatan teknologi informasi modern seperti aplikasi pengaduan terpadu dan tilang elektronik (ETLE) terus diperluas demi menghilangkan potensi pungutan liar.</p><p>"Masyarakat mengharapkan kehadiran polisi yang mengayomi dan mendengar. Setiap personel di lapangan adalah etalase citra institusi," tegas Kapolri dalam keterangannya di Rupatama Mabes Polri.</p><p>Langkah ini disambut positif oleh berbagai kalangan akademisi dan pegiat hak asasi manusia sebagai wujud kesungguhan kepolisian dalam mewujudkan reformasi kultural yang berkelanjutan.</p>`,
      gambar_sampul: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop",
      status: StatusArtikel.PUBLISHED,
      is_draft: false,
      adalah_utama: true,
      adalah_pilihan: true,
      dilihat: 1420,
      kategori_id: katHukum.id,
      penulis_id: userAdmin.id,
      diterbitkan_pada: new Date("2026-10-19T08:30:00Z"),
      tags: ["Presisi", "Kamtibmas"],
    },
    {
      judul: "Patroli Presisi Perintis Tingkatkan Keamanan Lingkungan Permukiman Malam Hari",
      slug: "patroli-presisi-perintis-tingkatkan-keamanan-lingkungan-permukiman-malam-hari",
      ringkasan: "Tim Patroli Perintis Presisi menggelar pemantauan intensif di sejumlah titik rawan guna mencegah potensi gesekan sosial dan tindak pidana jalanan.",
      konten: `<p><strong>SURABAYA</strong> — Satuan Samapta melalui Tim Patroli Perintis Presisi secara konsisten menggelar patroli dialogis skala sedang hingga besar pada jam-jam rawan di wilayah permukiman warga.</p><p>Operasi pemantauan yang menyasar jalan protokol, pusat perbelanjaan, hingga pemukiman padat penduduk ini bertujuan menciptakan rasa aman serta memberikan respon cepat bilamana terjadi gangguan kamtibmas.</p><p>Petugas juga menyempatkan diri berdialog dengan petugas pos ronda dan pemuda karang taruna setempat guna menggali informasi kamtibmas secara langsung dari sumber pertama.</p>`,
      gambar_sampul: "https://images.unsplash.com/photo-1520690214124-2405c5217036?q=80&w=1200&auto=format&fit=crop",
      status: StatusArtikel.PUBLISHED,
      is_draft: false,
      adalah_utama: true,
      adalah_pilihan: true,
      dilihat: 980,
      kategori_id: katPatroli.id,
      penulis_id: userEditor.id,
      diterbitkan_pada: new Date("2026-10-19T10:15:00Z"),
      tags: ["Presisi", "Kamtibmas"],
    },
    {
      judul: "Modernisasi Sistem Tilang Elektronik ETLE Tekan Angka Pelanggaran Lalu Lintas",
      slug: "modernisasi-sistem-tilang-elektronik-etle-tekan-angka-pelanggaran-lalu-lintas",
      ringkasan: "Penerapan kamera AI generasi baru mampu mendeteksi pelanggaran rambu dan penggunaan ponsel secara otomatis dengan akurasi tinggi.",
      konten: `<p><strong>BANDUNG</strong> — Korps Lalu Lintas (Korlantas) Polri mencatat penurunan signifikan angka pelanggaran lalu lintas pasca perluasan kamera Electronic Traffic Law Enforcement (ETLE) berbasis Artificial Intelligence di berbagai ruas tol dan jalur arteri.</p><p>Kamera canggih ini mampu mengidentifikasi ketidakpatuhan berkendara seperti tidak memakai sabuk keselamatan, melawan arus, serta melebihi batas kecepatan maksimal tanpa interaksi langsung antara polisi dan pengemudi.</p>`,
      gambar_sampul: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1200&auto=format&fit=crop",
      status: StatusArtikel.PUBLISHED,
      is_draft: false,
      adalah_utama: true,
      adalah_pilihan: false,
      dilihat: 840,
      kategori_id: katLaluLintas.id,
      penulis_id: userAdmin.id,
      diterbitkan_pada: new Date("2026-10-18T14:20:00Z"),
      tags: ["Korlantas", "E-Tilang"],
    },
    {
      judul: "Bareskrim Ungkap Sindikat Penipuan Siber Lintas Provinsi dengan Kerugian Miliaran",
      slug: "bareskrim-ungkap-sindikat-penipuan-siber-lintas-provinsi-dengan-kerugian-miliaran",
      ringkasan: "Direktorat Tindak Pidana Siber berhasil mengamankan 8 tersangka sindikat kejahatan phishing dan peretasan rekening perbankan.",
      konten: `<p><strong>JAKARTA</strong> — Tim Subdit Siber Bareskrim Polri berhasil membongkar jaringan penipuan daring bermodus rekayasa sosial dan aplikasi pesan palsu. Pelaku memanfaatkan file instalasi berbahaya untuk menguras saldo tabungan korban.</p><p>Penyelidikan mendalam selama dua bulan membuahkan hasil dengan penangkapan para pelaku di sejumlah lokasi persembunyian.</p>`,
      gambar_sampul: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
      status: StatusArtikel.PUBLISHED,
      is_draft: false,
      adalah_utama: false,
      adalah_pilihan: true,
      dilihat: 1120,
      kategori_id: katHukum.id,
      penulis_id: userAdmin.id,
      diterbitkan_pada: new Date("2026-10-18T16:00:00Z"),
      tags: ["Bareskrim"],
    },
    {
      judul: "Bakti Sosial Polri Sambut HUT: Ribuan Paket Sembako Dibagikan ke Warga Kurang Mampu",
      slug: "bakti-sosial-polri-sambut-hut-ribuan-paket-sembako-dibagikan-ke-warga-kurang-mampu",
      ringkasan: "Wujud kepedulian nyata anggota di daerah pelosok melalui pendistribusian logistik dan layanan kesehatan gratis kepada masyarakat prasejahtera.",
      konten: `<p><strong>MEDAN</strong> — Jajaran kepolisian daerah menggelar rangkaian kegiatan sosial berupa donor darah, pengobatan cuma-cuma, dan pembagian paket sembako untuk keluarga berpenghasilan rendah.</p><p>Kegiatan ini menjadi momentum mempererat tali silaturahmi antara aparat kepolisian dan warga masyarakat di akar rumput.</p>`,
      gambar_sampul: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1200&auto=format&fit=crop",
      status: StatusArtikel.PUBLISHED,
      is_draft: false,
      adalah_utama: false,
      adalah_pilihan: true,
      dilihat: 650,
      kategori_id: katSosial.id,
      penulis_id: userEditor.id,
      diterbitkan_pada: new Date("2026-10-18T11:00:00Z"),
      tags: ["Humanis"],
    },
    {
      judul: "Menjaga Netralitas Aparat Jelang Pilkada Serentak, Sanksi Tegas Menanti Pelanggar",
      slug: "menjaga-netralitas-aparat-jelang-pilkada-serentak-sanksi-tegas-menanti-pelanggar",
      ringkasan: "Divisi Propam menerbitkan surat telegram tegas yang melarang keterlibatan personel kepolisian dalam kontestasi politik praktis.",
      konten: `<p><strong>JAKARTA</strong> — Menjelang perhelatan pesta demokrasi pemilihan kepala daerah serentak, pimpinan kepolisian menginstruksikan seluruh personel untuk memegang teguh asas netralitas.</p><p>Masyarakat diminta tak ragu melaporkan melalui kanal resmi apabila menemukan indikasi ketidaknetralan anggota di daerah masing-masing.</p>`,
      gambar_sampul: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1200&auto=format&fit=crop",
      status: StatusArtikel.PUBLISHED,
      is_draft: false,
      adalah_utama: false,
      adalah_pilihan: true,
      dilihat: 780,
      kategori_id: katPolitik.id,
      penulis_id: userAdmin.id,
      diterbitkan_pada: new Date("2026-10-17T09:45:00Z"),
      tags: ["Presisi"],
    },
    {
      judul: "Operasi Zebra Candi 2026 Berhasil Turunkan Fatalitas Kecelakaan hingga 35 Persen",
      slug: "operasi-zebra-candi-2026-berhasil-turunkan-fatalitas-kecelakaan-hingga-35-persen",
      ringkasan: "Edukasi persuasif dikombinasikan dengan penindakan berbasis ETLE menghasilkan dampak positif terhadap kesadaran tertib berlalu lintas.",
      konten: `<p><strong>SEMARANG</strong> — Operasi keselamatan yang berlangsung selama dua pekan mencatat hasil positif dalam menekan angka fatalitas kecelakaan di jalur tol Trans Jawa maupun jalan nasional.</p>`,
      gambar_sampul: "https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=1200&auto=format&fit=crop",
      status: StatusArtikel.PUBLISHED,
      is_draft: false,
      adalah_utama: false,
      adalah_pilihan: false,
      dilihat: 410,
      kategori_id: katLaluLintas.id,
      penulis_id: userEditor.id,
      diterbitkan_pada: new Date("2026-10-17T07:20:00Z"),
      tags: ["Korlantas"],
    },
    {
      judul: "Polisi Sahabat Anak Kenalkan Rambu dan Keamanan Jalan Raya Sejak Usia Dini",
      slug: "polisi-sahabat-anak-kenalkan-rambu-dan-keamanan-jalan-raya-sejak-usia-dini",
      ringkasan: "Kegiatan edukatif yang hangat disambut antusias ratusan siswa taman kanak-kanak dan sekolah dasar di Mapolres.",
      konten: `<p><strong>YOGYAKARTA</strong> — Program Polisi Sahabat Anak (Polsanak) menghadirkan ruang belajar interaktif bagi tunas bangsa agar memahami rambu keselamatan dan tidak merasa takut terhadap aparat kepolisian.</p>`,
      gambar_sampul: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
      status: StatusArtikel.PUBLISHED,
      is_draft: false,
      adalah_utama: false,
      adalah_pilihan: false,
      dilihat: 520,
      kategori_id: katSosial.id,
      penulis_id: userEditor.id,
      diterbitkan_pada: new Date("2026-10-16T13:30:00Z"),
      tags: ["Humanis"],
    },
  ];

  for (const item of articlesData) {
    const { tags, ...articlePayload } = item;
    const art = await prisma.artikel.create({
      data: articlePayload,
    });

    for (const tagName of tags) {
      const tagId = createdTags[tagName];
      if (tagId) {
        await prisma.artikelTag.create({
          data: {
            artikel_id: art.id,
            tag_id: tagId,
          },
        });
      }
    }
  }

  console.log("✓ Artikel berita berhasil di-seed");

  // 10. Buat Halaman Statis
  await prisma.halaman.createMany({
    data: [
      {
        slug: "redaksi",
        judul: "Susunan Redaksi Portal Berita Jurnal Polisi",
        konten: `<h3>Dewan Penasihat & Pembina</h3><p>Komjen Pol (Purn) Dr. H. Bambang Sudarmono, S.H., M.M.<br/>Irjen Pol (Purn) Drs. Agus Setiawan, S.I.K.</p><h3>Pemimpin Umum / Penanggung Jawab</h3><p>Drs. M. Aditya Pratama, M.Si.</p><h3>Pemimpin Redaksi</h3><p>Bripka Hendra Wijaya, S.Kom.</p><h3>Dewan Redaksi</h3><p>1. Siti Rahmawati, S.Sos.<br/>2. Arif Budiman, S.H.<br/>3. Dimas Arya Permadi, M.I.Kom.</p><h3>Wartawan & Liputan Khusus</h3><p>Biro Jakarta: Rizky Firmansyah, Asep Sunarya<br/>Biro Jawa Barat: Danu Wicaksono<br/>Biro Jawa Tengah & DIY: Gunawan Prasetyo<br/>Biro Jawa Timur: Ilham Maulana</p>`,
      },
      {
        slug: "pedoman-media-siber",
        judul: "Pedoman Pemberitaan Media Siber",
        konten: `<p>Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB.</p><h4>1. Ruang Lingkup</h4><p>Media Siber adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers.</p><h4>2. Verifikasi dan Keberimbangan Berita</h4><p>Pada prinsipnya setiap berita harus melalui verifikasi. Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan.</p><h4>3. Ralat, Koreksi, dan Hak Jawab</h4><p>Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers.</p>`,
      },
      {
        slug: "term-of-service",
        judul: "Syarat dan Ketentuan Layanan (Terms of Service)",
        konten: `<p>Selamat datang di situs resmi Jurnal Polisi. Dengan mengakses atau menggunakan portal berita ini, Anda setuju untuk terikat oleh syarat dan ketentuan yang diatur di bawah ini.</p><h4>1. Hak Kekayaan Intelektual</h4><p>Seluruh materi di situs ini, termasuk naskah berita, foto, grafis, logo, dan tata letak dilindungi undang-undang hak cipta.</p><h4>2. Penggunaan Konten</h4><p>Dilarang memperbanyak, mempublikasikan ulang, atau menyebarluaskan konten portal untuk kepentingan komersial tanpa izin tertulis dari Redaksi Jurnal Polisi.</p><h4>3. Komentar & Tanggapan</h4><p>Pengunjung bertanggung jawab penuh atas setiap komentar yang dikirimkan. Komentar yang mengandung unsur SARA, ujaran kebencian, fitnah, atau pornografi akan dihapus.</p>`,
      },
    ],
  });

  console.log("✓ Halaman statis berhasil dibuat");

  // 11. Buat Pengaturan Portal
  await prisma.pengaturan.createMany({
    data: [
      { kunci: "nama_portal", nilai: "JURNAL POLISI" },
      { kunci: "tagline", nilai: "Media Informasi & Edukasi Kepolisian Terpercaya" },
      { kunci: "alamat", nilai: "Gedung Presisi Media Nusantara, Jl. Trunojoyo No. 3, Kebayoran Baru, Jakarta Selatan 12110" },
      { kunci: "telepon", nilai: "(021) 7218000" },
      { kunci: "email", nilai: "redaksi@jurnalpolisi.id" },
      { kunci: "whatsapp", nilai: "+62 812-3456-7890" },
      { kunci: "instagram", nilai: "https://instagram.com/jurnalpolisi_official" },
      { kunci: "youtube", nilai: "https://youtube.com/@jurnalpolisi" },
    ],
  });

  console.log("✓ Pengaturan portal berhasil disimpan");
  console.log("🎉 Seeding database selesai dengan sempurna!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
