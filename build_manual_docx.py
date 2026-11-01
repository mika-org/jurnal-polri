# -*- coding: utf-8 -*-
"""
Full Document Builder for BUKU_PANDUAN_PENGGUNA_JURNAL_POLISI.docx
Creates a rich, comprehensive, professionally styled manual with:
- Clear role separation (Super Admin, Pemred, Editor, Wartawan, Manajer Iklan, Publik)
- End-to-end workflows (step-by-step from start to finish)
- Designated Image Placeholder boxes for screenshots with guidelines
- Branded typography and tables
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_manual():
    doc = docx.Document()

    # Configure Margins (Normal 1 inch)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Base Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = RGBColor(31, 41, 55) # Charcoal

    # Helper XML functions
    def set_cell_background(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=140, bottom=140, left=200, right=200):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(
            f'<w:tcMar {nsdecls("w")}>'
            f'<w:top w:w="{top}" w:type="dxa"/>'
            f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
            f'<w:left w:w="{left}" w:type="dxa"/>'
            f'<w:right w:w="{right}" w:type="dxa"/>'
            f'</w:tcMar>'
        )
        tcPr.append(tcMar)

    def set_cell_borders(cell, top="none", bottom="none", left="none", right="none", 
                         color="CCCCCC", sz="4"):
        tcPr = cell._tc.get_or_add_tcPr()
        borders_elm = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:top w:val="{top}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="{left}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{bottom}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:right w:val="{right}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders_elm)

    def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)

    def add_heading_styled(text, level):
        h = doc.add_heading(text, level=level)
        h.paragraph_format.keep_with_next = True
        
        color_map = {
            1: RGBColor(127, 0, 0),     # Brand 800 Maroon
            2: RGBColor(185, 28, 28),   # Brand 600 Red
            3: RGBColor(31, 41, 55),    # Charcoal Dark
            4: RGBColor(75, 85, 99),    # Slate
        }
        size_map = {1: 17, 2: 13, 3: 11, 4: 10}
        space_before_map = {1: 16, 2: 12, 3: 8, 4: 6}
        space_after_map = {1: 6, 2: 4, 3: 3, 4: 2}

        h.paragraph_format.space_before = Pt(space_before_map.get(level, 6))
        h.paragraph_format.space_after = Pt(space_after_map.get(level, 3))
        
        for r in h.runs:
            r.font.name = "Arial"
            r.font.size = Pt(size_map.get(level, 10))
            r.font.bold = True
            r.font.color.rgb = color_map.get(level, RGBColor(31, 41, 55))
            
        return h

    def add_callout_box(text, title="CATATAN PENTING", box_type="info"):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        
        cell = table.cell(0, 0)
        cell.width = Inches(6.5)
        
        bg_colors = {
            "info": "F8FAFC",
            "tip": "F0FDF4",
            "warning": "FEF2F2",
            "brand": "FFF5F5",
        }
        border_colors = {
            "info": "3B82F6",
            "tip": "22C55E",
            "warning": "EF4444",
            "brand": "7F0000",
        }
        
        hex_bg = bg_colors.get(box_type, "F8FAFC")
        hex_border = border_colors.get(box_type, "7F0000")
        
        set_cell_background(cell, hex_bg)
        set_cell_margins(cell, top=140, bottom=140, left=220, right=200)
        set_cell_borders(cell, top="none", bottom="none", left="single", right="none", 
                         color=hex_border, sz="24")
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        
        run_icon = p.add_run(f"📌 {title}: ")
        run_icon.bold = True
        run_icon.font.size = Pt(9.5)
        run_icon.font.name = "Arial"
        run_icon.font.color.rgb = RGBColor(127, 0, 0) if box_type == "brand" else RGBColor(31, 41, 55)
        
        run_text = p.add_run(text)
        run_text.font.size = Pt(9.5)
        run_text.font.name = "Arial"
        run_text.font.color.rgb = RGBColor(55, 65, 81)

        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_before = Pt(0)
        p_after.paragraph_format.space_after = Pt(4)

    def add_image_placeholder(img_id, caption, description, recommended_size="1200 x 675 px (Rasio 16:9)"):
        table = doc.add_table(rows=2, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        
        # Row 0: Header with instructions & ID
        cell_top = table.cell(0, 0)
        cell_top.width = Inches(6.5)
        set_cell_background(cell_top, "2C1414")  # Dark maroon header
        set_cell_margins(cell_top, top=100, bottom=100, left=160, right=160)
        set_cell_borders(cell_top, top="single", bottom="single", left="single", right="single",
                         color="7F0000", sz="8")
        
        p_top = cell_top.paragraphs[0]
        p_top.paragraph_format.space_before = Pt(0)
        p_top.paragraph_format.space_after = Pt(0)
        
        r_cam = p_top.add_run("📷 TEMPAT MENYIMPAN GAMBAR / TANGKAPAN LAYAR | ")
        r_cam.bold = True
        r_cam.font.size = Pt(8.5)
        r_cam.font.name = "Arial"
        r_cam.font.color.rgb = RGBColor(242, 140, 0)
        
        r_id = p_top.add_run(f"[{img_id}] {caption}")
        r_id.bold = True
        r_id.font.size = Pt(8.5)
        r_id.font.name = "Arial"
        r_id.font.color.rgb = RGBColor(255, 255, 255)
        
        # Row 1: The designated slot to paste screenshot
        cell_slot = table.cell(1, 0)
        cell_slot.width = Inches(6.5)
        set_cell_background(cell_slot, "FAF7F7")
        set_cell_margins(cell_slot, top=200, bottom=200, left=200, right=200)
        set_cell_borders(cell_slot, top="none", bottom="dashed", left="dashed", right="dashed",
                         color="B91C1C", sz="8")
        
        p_slot = cell_slot.paragraphs[0]
        p_slot.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_slot.paragraph_format.space_before = Pt(12)
        p_slot.paragraph_format.space_after = Pt(4)
        
        r_paste = p_slot.add_run("[ TEMPELKAN / PASTE TANGKAPAN LAYAR (SCREENSHOT) DI SINI ]\n")
        r_paste.bold = True
        r_paste.font.size = Pt(10.5)
        r_paste.font.name = "Arial"
        r_paste.font.color.rgb = RGBColor(127, 0, 0)
        
        r_guide = p_slot.add_run(
            f"Keterangan Tampilan: {description}\n"
            f"Rekomendasi Dimensi: {recommended_size} | Format: PNG / JPG / WebP\n"
            f"Petunjuk: Klik di dalam kotak ini, lalu tekan Ctrl + V untuk menempelkan gambar."
        )
        r_guide.font.size = Pt(8.5)
        r_guide.font.name = "Arial"
        r_guide.font.italic = True
        r_guide.font.color.rgb = RGBColor(107, 114, 128)
        
        p_space = cell_slot.add_paragraph()
        p_space.paragraph_format.space_before = Pt(10)
        p_space.paragraph_format.space_after = Pt(0)
        
        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_before = Pt(0)
        p_after.paragraph_format.space_after = Pt(6)

    def add_styled_table(headers, data, col_widths=None):
        table = doc.add_table(rows=len(data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        
        set_table_borders(table, color="D1D5DB", sz="4", val="single")
        
        # Header Row
        hdr_cells = table.rows[0].cells
        for i, title in enumerate(headers):
            hdr_cells[i].text = title
            set_cell_background(hdr_cells[i], "7F0000")
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Arial"
                r.font.bold = True
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(255, 255, 255)
                
        # Data Rows
        for row_idx, row_data in enumerate(data):
            row_cells = table.rows[row_idx + 1].cells
            bg_col = "FFFFFF" if row_idx % 2 == 0 else "F9FAFB"
            for col_idx, cell_value in enumerate(row_data):
                row_cells[col_idx].text = str(cell_value)
                set_cell_background(row_cells[col_idx], bg_col)
                set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=140, right=140)
                p = row_cells[col_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                for r in p.runs:
                    r.font.name = "Arial"
                    r.font.size = Pt(8.5)
                    r.font.color.rgb = RGBColor(31, 41, 55)

        if col_widths:
            for row in table.rows:
                for idx, w in enumerate(col_widths):
                    if idx < len(row.cells):
                        row.cells[idx].width = Inches(w)
                        
        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_before = Pt(0)
        p_after.paragraph_format.space_after = Pt(4)
        return table

    def add_step_card(step_num, title, actor, input_desc, action_steps, output_desc):
        p_title = doc.add_paragraph()
        p_title.paragraph_format.space_before = Pt(8)
        p_title.paragraph_format.space_after = Pt(2)
        p_title.paragraph_format.keep_with_next = True
        
        r_step = p_title.add_run(f"Langkah {step_num}: ")
        r_step.bold = True
        r_step.font.size = Pt(10.5)
        r_step.font.name = "Arial"
        r_step.font.color.rgb = RGBColor(185, 28, 28)
        
        r_t = p_title.add_run(title)
        r_t.bold = True
        r_t.font.size = Pt(10.5)
        r_t.font.name = "Arial"
        r_t.font.color.rgb = RGBColor(31, 41, 55)
        
        step_data = [
            ["Pelaksana (Role)", actor],
            ["Prasyarat / Masukan", input_desc],
            ["Instruksi Tindakan", "\n".join([f"{i+1}. {s}" for i, s in enumerate(action_steps)])],
            ["Hasil / Luaran", output_desc]
        ]
        add_styled_table(["Komponen Operasional", "Uraian Teknis"], step_data, col_widths=[2.0, 4.5])

    # =========================================================================
    # 1. COVER PAGE
    # =========================================================================
    p_banner = doc.add_paragraph()
    p_banner.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_banner.paragraph_format.space_before = Pt(30)
    p_banner.paragraph_format.space_after = Pt(10)
    
    r_org = p_banner.add_run("PORTAL BERITA RESMI & MANAJEMEN PUBLIKASI PRESISI\n")
    r_org.bold = True
    r_org.font.size = Pt(12)
    r_org.font.color.rgb = RGBColor(185, 28, 28)
    
    r_brand = p_banner.add_run("JURNAL POLISI\n")
    r_brand.bold = True
    r_brand.font.size = Pt(28)
    r_brand.font.color.rgb = RGBColor(127, 0, 0)
    
    r_subtag = p_banner.add_run("Mengabdi untuk Keadilan, Mengawal Kebenaran Nusantara\n")
    r_subtag.font.size = Pt(11)
    r_subtag.font.italic = True
    r_subtag.font.color.rgb = RGBColor(107, 114, 128)

    # Decorative Line
    p_line = doc.add_paragraph()
    p_line.paragraph_format.space_before = Pt(15)
    p_line.paragraph_format.space_after = Pt(25)
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_l = p_line.add_run("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    r_l.font.color.rgb = RGBColor(242, 140, 0) # Gold
    r_l.bold = True

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(8)
    r_t1 = p_title.add_run("BUKU PANDUAN PENGGUNA\n(USER MANUAL & OPERATIONAL GUIDE)\n")
    r_t1.bold = True
    r_t1.font.size = Pt(20)
    r_t1.font.color.rgb = RGBColor(31, 41, 55)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(35)
    r_t2 = p_sub.add_run(
        "Panduan Komprehensif Berbasis Peran (Role-Based Access Control),\n"
        "Alur Kerja Sistem End-to-End, dan Petunjuk Visual Antarmuka Presisi"
    )
    r_t2.font.size = Pt(11)
    r_t2.font.color.rgb = RGBColor(75, 85, 99)

    # Metadata Block Table
    cover_meta = [
        ["Nomor Dokumen", "SOP-TI-JP-2026-V1"],
        ["Versi Dokumen", "Edisi 1.0 (Produksi)"],
        ["Tanggal Berlaku", "November 2026"],
        ["Klasifikasi", "Dokumen Pedoman Operasional Internal & Redaksi"],
        ["Penyusun", "Tim Teknologi Informasi & Dewan Redaksi Jurnal Polisi"],
        ["Cakupan Peran", "Super Admin, Pemimpin Redaksi, Editor, Wartawan, Manajer Iklan, Publik"]
    ]
    add_styled_table(["Informasi Dokumen", "Keterangan"], cover_meta, col_widths=[2.2, 4.3])

    doc.add_page_break()

    # =========================================================================
    # DAFTAR ISI & STRUKTUR DOKUMEN
    # =========================================================================
    add_heading_styled("DAFTAR ISI & STRUKTUR PANDUAN", level=1)
    
    p_toc_desc = doc.add_paragraph(
        "Buku manual ini disusun secara sistematis agar setiap pemangku kepentingan (stakeholder) "
        "dapat memahami alur kerja menyeluruh portal serta melaksanakan fungsi tugas sesuai peran (role) "
        "masing-masing dengan presisi, cepat, dan tanpa kendala teknis."
    )
    p_toc_desc.paragraph_format.space_after = Pt(8)

    toc_items = [
        ["BAB I", "PENDAHULUAN & ARSITEKTUR SISTEM", "Halaman 3"],
        ["", "1.1 Latar Belakang & Visi Jurnal Polisi", "Halaman 3"],
        ["", "1.2 Lingkup Sistem & Modul Utama", "Halaman 3"],
        ["", "1.3 Spesifikasi Perangkat & Kebutuhan Teknis", "Halaman 4"],
        ["", "1.4 Konvensi Ikon & Pedoman Tangkapan Layar", "Halaman 4"],
        ["BAB II", "MATRIKS PERAN & HAK AKSES (RBAC)", "Halaman 5"],
        ["", "2.1 Struktur Super Grup, Role, dan Permission", "Halaman 5"],
        ["", "2.2 Matriks Izin Akses Peran Lengkap", "Halaman 6"],
        ["", "2.3 Mekanisme Keamanan Sesi & Kredensial", "Halaman 7"],
        ["BAB III", "ALUR KERJA SISTEM END-TO-END (SISTEMIK)", "Halaman 8"],
        ["", "3.1 Peta Alur Besar Siklus Berita (News Lifecycle)", "Halaman 8"],
        ["", "3.2 Alur 1: Dari Peliputan Lapangan hingga Masuk Cetak Koran", "Halaman 9"],
        ["", "3.3 Alur 2: Manajemen Pengguna & Delegasi Peran Personel", "Halaman 10"],
        ["", "3.4 Alur 3: Manajemen Banner Iklan & Monetisasi Sponsor", "Halaman 11"],
        ["", "3.5 Alur 4: Interaksi Pembaca & Layanan Publik", "Halaman 12"],
        ["BAB IV", "PANDUAN OPERASIONAL RUNUT PER ROLE", "Halaman 13"],
        ["", "4.1 Role 1: Super Admin / Owner (Akses Penuh Sistem)", "Halaman 13"],
        ["", "4.2 Role 2: Pemimpin Redaksi (Pemred)", "Halaman 17"],
        ["", "4.3 Role 3: Editor Redaksi", "Halaman 20"],
        ["", "4.4 Role 4: Wartawan / Reporter Lapangan", "Halaman 24"],
        ["", "4.5 Role 5: Manajer Iklan / Tim Sponsorship", "Halaman 28"],
        ["", "4.6 Role 6: Pengguna Publik / Pembaca Portal", "Halaman 31"],
        ["BAB V", "PANDUAN MODUL CETAK KORAN DIGITAL (A4 CANVAS)", "Halaman 34"],
        ["", "5.1 Pengantar Desainer Tata Letak Koran Cetak", "Halaman 34"],
        ["", "5.2 Antarmuka Desainer & Fitur Drag/Drop Berita", "Halaman 34"],
        ["", "5.3 Tata Cara Pembuatan Edisi & Ekspor Siap Cetak (PDF)", "Halaman 35"],
        ["BAB VI", "PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING)", "Halaman 37"],
        ["BAB VII", "LEMBAR PENGESAHAN & CATATAN PERUBAHAN", "Halaman 39"]
    ]
    add_styled_table(["Bab / No", "Topik Panduan", "Referensi"], toc_items, col_widths=[1.2, 4.1, 1.2])

    doc.add_page_break()

    # =========================================================================
    # BAB I: PENDAHULUAN & ARSITEKTUR SISTEM
    # =========================================================================
    add_heading_styled("BAB I: PENDAHULUAN & ARSITEKTUR SISTEM", level=1)
    
    add_heading_styled("1.1 Latar Belakang & Visi Jurnal Polisi", level=2)
    p_latar = doc.add_paragraph(
        "Portal Berita 'Jurnal Polisi' merupakan platform publikasi informasi digital berbasis web modern "
        "yang dirancang untuk menyajikan berita, liputan penegakan hukum, kegiatan kamtibmas, sosial kemasyarakatan, "
        "serta kebijakan nasional secara cepat, akurat, dan berimbang. Mengusung konsep 'Presisi' (Prediktif, "
        "Responsibilitas, Transparansi Berkeadilan), portal ini memadukan keunggulan distribusi berita digital "
        "real-time dengan kemampuan cetak koran fisik beresolusi tinggi (Digital-to-Print Integration)."
    )
    p_latar.paragraph_format.space_after = Pt(6)

    add_heading_styled("1.2 Lingkup Sistem & Modul Utama", level=2)
    p_modul = doc.add_paragraph(
        "Sistem Jurnal Polisi terbagi menjadi 2 (dua) lingkungan utama yang terintegrasi penuh:"
    )
    p_modul.paragraph_format.space_after = Pt(4)

    modul_data = [
        ["1", "Portal Publik (Front-End)", "Halaman beranda (Hero Slider, Berita Terbaru, Kategori Cepat, Berita Pilihan), detail artikel naskah lengkap, pencarian kata kunci, navigasi kategori, mode gelap/terang, dan formulir aduan kontak."],
        ["2", "Admin Presisi (Back-End CMS)", "Pusat komando pengelolaan naskah, moderasi persetujuan berita, manajemen kategori, penempatan slot iklan sponsor, pengaturan halaman statis regulasi, dan manajemen pengguna berbasis RBAC."],
        ["3", "Desainer Cetak Koran A4", "Modul mutakhir penyusunan tata letak (layout) koran siap cetak multi-halaman berbasis web yang dapat mengubah berita portal menjadi lembaran koran fisik dalam format cetak/PDF berstandar grafika."],
        ["4", "Subsistem Keamanan & Audit", "Otentikasi ganda JWT dengan token rotation, enkripsi kata sandi Bcrypt 12-round, sanitasi pencegahan injeksi XSS, dan pembatasan akses data kepemilikan naskah (own-record scope)."]
    ]
    add_styled_table(["No", "Lingkup Modul", "Deskripsi Fungsional"], modul_data, col_widths=[0.6, 2.0, 3.9])

    add_heading_styled("1.3 Spesifikasi Perangkat & Kebutuhan Teknis", level=2)
    p_tek = doc.add_paragraph(
        "Agar seluruh modul portal dan desainer koran dapat dioperasikan secara optimal, pengguna disarankan "
        "menggunakan perangkat dengan kriteria berikut:"
    )
    
    spec_data = [
        ["Komponen", "Kebutuhan Minimum", "Kebutuhan Rekomendasi"],
        ["Perangkat Keras", "Laptop/PC Processor Dual Core 2.0 GHz, RAM 4 GB", "Processor Core i5/Ryzen 5, RAM 8 GB+ (SSD)"],
        ["Resolusi Layar", "1366 x 768 piksel (Admin CMS)", "1920 x 1080 Full HD (Optimal untuk Desainer Koran A4)"],
        ["Peramban (Browser)", "Google Chrome v110+, Microsoft Edge v110+, Firefox v115+", "Google Chrome / Edge versi stabil terbaru"],
        ["Koneksi Internet", "Stabil minimal 5 Mbps (Unggah foto)", "Stabil 20 Mbps+ (Unggah foto definisi tinggi)"],
        ["Aplikasi Pendukung", "PDF Viewer / Printer Driver Standar", "Adobe Acrobat Reader / Google Chrome PDF Engine"]
    ]
    add_styled_table(spec_data[0], spec_data[1:], col_widths=[1.8, 2.3, 2.4])

    add_heading_styled("1.4 Konvensi Ikon & Pedoman Tangkapan Layar", level=2)
    p_ikon = doc.add_paragraph(
        "Sepanjang buku panduan ini, Anda akan menemukan penanda khusus dan kotak tempat tangkapan layar (screenshot placeholder):"
    )
    
    add_callout_box(
        "Kotak dengan garis merah putus-putus dan kepala merah marun adalah TEMPAT MENYIMPAN GAMBAR. "
        "Pengguna/staf dapat menempelkan (paste) screenshot nyata dari aplikasi ke dalam kotak tersebut "
        "tanpa mengubah susunan naskah panduan.",
        title="PETUNJUK PENYIMPANAN GAMBAR",
        box_type="brand"
    )

    doc.add_page_break()

    # =========================================================================
    # BAB II: STRUKTUR HAK AKSES & PERAN PENGGUNA (RBAC)
    # =========================================================================
    add_heading_styled("BAB II: STRUKTUR HAK AKSES & PERAN PENGGUNA (RBAC)", level=1)
    
    add_heading_styled("2.1 Konsep Super Grup, Peran (Role), dan Hak Akses (Permission)", level=2)
    p_rbac = doc.add_paragraph(
        "Sistem Jurnal Polisi menerapkan arsitektur Role-Based Access Control (RBAC) 3 tingkat "
        "yang sangat ketat dan fleksibel: Super Grup -> Peran (Role) -> Hak Akses (Permission). "
        "Setiap pengguna (User) diasosiasikan tepat ke satu Role. Hal ini menjamin bahwa wartawan "
        "tidak dapat menerbitkan naskah tanpa sensor editor, dan staf iklan tidak dapat mengubah naskah berita."
    )
    p_rbac.paragraph_format.space_after = Pt(6)

    add_heading_styled("2.2 Matriks Hak Akses Lengkap Antar-Peran", level=2)
    p_matrix = doc.add_paragraph(
        "Tabel berikut menguraikan matriks wewenang operasional untuk masing-masing peran di dalam sistem Jurnal Polisi:"
    )

    matrix_data = [
        ["Modul / Aksi Sistem", "Super Admin", "Pemred", "Editor", "Wartawan", "Manajer Iklan", "Publik"],
        ["Login Dashboard Admin", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya", "❌ Tidak"],
        ["Tulis Naskah Berita Baru", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya", "❌ Tidak", "❌ Tidak"],
        ["Sunting Naskah Sendiri", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya", "❌ Tidak", "❌ Tidak"],
        ["Sunting Naskah Wartawan Lain", "✅ Ya", "✅ Ya", "✅ Ya", "❌ Tidak", "❌ Tidak", "❌ Tidak"],
        ["Terbitkan Berita (Publish)", "✅ Ya", "✅ Ya", "✅ Ya", "❌ Tidak", "❌ Tidak", "❌ Tidak"],
        ["Tetapkan Headline Slider", "✅ Ya", "✅ Ya", "❌ Tidak", "❌ Tidak", "❌ Tidak", "❌ Tidak"],
        ["Tetapkan Berita Pilihan", "✅ Ya", "✅ Ya", "✅ Ya", "❌ Tidak", "❌ Tidak", "❌ Tidak"],
        ["Hapus / Arsipkan Berita", "✅ Ya", "✅ Ya", "❌ Tidak", "❌ Tidak", "❌ Tidak", "❌ Tidak"],
        ["Kelola Kategori Berita", "✅ Ya", "✅ Ya", "Hanya Lihat", "Hanya Lihat", "❌ Tidak", "❌ Tidak"],
        ["Kelola Banner Iklan Mitra", "✅ Ya", "❌ Tidak", "❌ Tidak", "❌ Tidak", "✅ Ya", "❌ Tidak"],
        ["Desainer Cetak Koran A4", "✅ Ya", "✅ Ya", "❌ Tidak", "❌ Tidak", "❌ Tidak", "❌ Tidak"],
        ["Kelola User & Hak Akses", "✅ Ya", "Hanya Lihat", "❌ Tidak", "❌ Tidak", "❌ Tidak", "❌ Tidak"],
        ["Ubah Pengaturan Portal", "✅ Ya", "❌ Tidak", "❌ Tidak", "❌ Tidak", "✅ Ya (Kontak)", "❌ Tidak"],
        ["Baca Berita & Cari Konten", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya"],
        ["Kirim Pesan Aduan / Kontak", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya", "✅ Ya"]
    ]
    add_styled_table(matrix_data[0], matrix_data[1:], col_widths=[2.1, 0.9, 0.7, 0.7, 0.7, 0.9, 0.5])

    add_heading_styled("2.3 Mekanisme Keamanan Sesi & Kredensial", level=2)
    p_sec = doc.add_paragraph(
        "Untuk melindungi integritas portal dari ancaman pembajakan sesi (session hijacking) dan brute-force:"
    )
    sec_points = [
        "Enkripsi Kata Sandi: Menggunakan algoritma Bcrypt dengan cost factor 12. Kata sandi tidak pernah disimpan dalam format teks terbuka (plaintext).",
        "Sesi JWT (JSON Web Token): Token akses berumur singkat (15 menit) diverifikasi melalui middleware pada setiap transaksi admin.",
        "Token Penyegar (Refresh Token Rotation): Token penyegar 7 hari disimpan dalam HttpOnly cookie dan hash-nya dicatat pada database; token lama langsung dibatalkan (revoked) saat terjadi perpanjangan sesi.",
        "Isolasi Wartawan: Wartawan lapangan memiliki batasan antarmuka khusus (hanya melihat menu Berita dan Profil), mencegah kebocoran konfigurasi sistem."
    ]
    for sp in sec_points:
        p_p = doc.add_paragraph(f"• {sp}")
        p_p.paragraph_format.left_indent = Inches(0.25)
        p_p.paragraph_format.space_after = Pt(2)

    doc.add_page_break()

    # =========================================================================
    # BAB III: ALUR KERJA SISTEM END-TO-END (END-TO-END WORKFLOWS)
    # =========================================================================
    add_heading_styled("BAB III: ALUR KERJA SISTEM END-TO-END", level=1)
    
    p_flow_intro = doc.add_paragraph(
        "Bab ini menyajikan peta alur operasional komprehensif mulai dari peristiwa di lapangan, "
        "pemrosesan naskah redaksi, penayangan publik, hingga pencetakan fisik surat kabar digital. "
        "Setiap alur dirancang agar bebas hambatan (frictionless) dan memenuhi kaidah jurnalistik presisi."
    )
    p_flow_intro.paragraph_format.space_after = Pt(6)

    add_heading_styled("3.1 Diagram Alur Besar Siklus Berita (News Lifecycle Workflow)", level=2)
    
    # Textual Flowchart Box
    flow_diagram = [
        ["TAHAP 1: PELIPUTAN & DRAFTING (Wartawan Lapangan)", 
         "1. Wartawan meliput peristiwa / rilis kepolisian.\n"
         "2. Login ke Admin Presisi -> Tambah Berita Baru.\n"
         "3. Isi Judul, Ringkasan (Lead), Naskah, dan Unggah Foto Sampul.\n"
         "4. Simpan naskah dengan status [DRAFT]."],
        ["TAHAP 2: PENYUNTINGAN & VERIFIKASI (Editor Redaksi)", 
         "1. Editor memeriksa antrean naskah berstatus [DRAFT].\n"
         "2. Verifikasi 5W+1H, kode etik jurnalistik, dan keabsahan fakta.\n"
         "3. Perbaiki tata bahasa melalui CKEditor & rapikan tagar.\n"
         "4. Beri catatan revisi lewat Fitur Komentar jika ada kekurangan naskah.\n"
         "5. Jika naskah layak, Editor menyetujui dan mengubah status ke [PUBLISHED]."],
        ["TAHAP 3: STRATEGI ETALASE & HEADLINE (Pemimpin Redaksi)", 
         "1. Pemred meninjau berita-berita berstatus [PUBLISHED].\n"
         "2. Menetapkan naskah strategis sebagai [Berita Utama / Headline Slider].\n"
         "3. Menetapkan naskah edukatif/unggulan sebagai [Berita Pilihan / Featured].\n"
         "4. Memerintahkan pengarsipan naskah jika peristiwa telah usang atau dicabut."],
        ["TAHAP 4: DISTRIBUSI PUBLIK & BACA (Pengguna Publik)", 
         "1. Berita tayang secara instan di Beranda Portal Jurnal Polisi.\n"
         "2. Pembaca mengakses berita via Desktop/Smartphone, membaca detail.\n"
         "3. Pembaca dapat membagikan berita ke WhatsApp/Medsos & memberi komentar."],
        ["TAHAP 5: CETAK KORAN FISIK / PDF (Super Admin & Pemred)", 
         "1. Buka modul Desainer Cetak Koran A4 di Admin Presisi.\n"
         "2. Pilih Edisi Koran Terbitan atau buat edisi baru.\n"
         "3. Tarik berita portal pilihan ke dalam lembar koran Halaman 1 & Halaman 2.\n"
         "4. Ekspor dokumen ke format PDF beresolusi tinggi untuk dicetak massal."]
    ]
    add_styled_table(["Tahapan Siklus", "Rincian Prosedur Operasional Standar (SOP)"], flow_diagram, col_widths=[2.5, 4.0])

    add_heading_styled("3.2 Alur 1: Alur Kerja Lengkap Wartawan ke Pembaca & Cetak Koran", level=2)
    p_a1 = doc.add_paragraph(
        "Alur ini menjabarkan kronologis berurutan dari hulu ke hilir dengan 6 langkah terkoordinasi:"
    )
    
    add_step_card(
        step_num="1",
        title="Input Liputan Baru oleh Wartawan",
        actor="Wartawan / Reporter Lapangan",
        input_desc="Data rilis pers kepolisian, rekaman wawancara, foto lapangan asli (min 1200x675 px).",
        action_steps=[
            "Buka browser ke URL http://domain-anda/admin/login dan masukkan kredensial akun wartawan.",
            "Klik menu 'Kelola Berita' pada navigasi samping, lalu klik tombol '+ Tambah Berita'.",
            "Tulis judul berita yang lugas, tulis lead 1 paragraf pada kolom 'Ringkasan'.",
            "Isi narasi berita lengkap di CKEditor, pilih Kategori (mis. Presisi Kriminal).",
            "Unggah foto sampul melalui tombol 'Unggah Gambar', masukkan tag penelusuran.",
            "Pastikan pilihan Status berada pada 'DRAFT', lalu klik 'Simpan Berita'."
        ],
        output_desc="Naskah tersimpan di database dengan status DRAFT dan otomatis tercatat atas nama wartawan."
    )

    add_step_card(
        step_num="2",
        title="Pemeriksaan & Koreksi Naskah oleh Editor",
        actor="Editor Redaksi",
        input_desc="Draf naskah yang diajukan oleh wartawan lapangan pada daftar antrean berita.",
        action_steps=[
            "Login sebagai Editor, masuk ke menu 'Kelola Berita'.",
            "Gunakan filter status 'DRAFT' untuk menyortir berita yang butuh peninjauan.",
            "Klik tombol pensil (Edit) pada baris berita wartawan yang bersangkutan.",
            "Periksa akurasi nama instansi, pangkat personel, serta kaidah EYD bahasa Indonesia.",
            "Jika naskah membutuhkan data tambahan dari lapangan, tuliskan catatan pada form Komentar Internal.",
            "Jika naskah sudah sempurna, ubah pilihan Status menjadi 'PUBLISHED' (Terbit).",
            "Klik 'Perbarui Berita' untuk meresmikan penayangan artikel."
        ],
        output_desc="Status naskah berubah menjadi PUBLISHED dengan stempel waktu penerbitan (publishedAt)."
    )

    add_step_card(
        step_num="3",
        title="Kurasi Penempatan Beranda oleh Pemimpin Redaksi",
        actor="Pemimpin Redaksi (Pemred)",
        input_desc="Artikel berstatus PUBLISHED yang dinilai memiliki urgensi kepentingan publik tinggi.",
        action_steps=[
            "Login sebagai Pemred, tinjau ringkasan berita terbit di menu 'Kelola Berita'.",
            "Pilih naskah utama hari ini, klik Edit Berita.",
            "Centang opsi 'Berita Utama (Headline Slider)' agar tampil berputar di banner utama beranda.",
            "Centang opsi 'Berita Pilihan (Featured)' agar masuk ke grid 4 kolom berita rekomendasi.",
            "Klik tombol 'Perbarui Berita'."
        ],
        output_desc="Berita mendapatkan prioritas penayangan tertinggi pada etalase halaman depan portal."
    )

    add_step_card(
        step_num="4",
        title="Penayangan Instan & Konsumsi Publik",
        actor="Masyarakat Publik / Pembaca Portal",
        input_desc="Alamat web portal berita Jurnal Polisi yang dapat diakses publik.",
        action_steps=[
            "Masyarakat mengakses halaman utama http://domain-anda/ dari peramban web.",
            "Melihat berita utama di slider atas, mengeklik judul berita yang diminati.",
            "Membaca narasi berita, melihat foto dokumentasi beresolusi tajam.",
            "Membagikan tautan berita ke grup WhatsApp, Facebook, atau Twitter melalui tombol share."
        ],
        output_desc="Meningkatnya pembaca portal, angka views bertambah secara otomatis dan real-time."
    )

    add_step_card(
        step_num="5",
        title="Penyusunan Lembar Koran Fisik Siap Cetak (A4)",
        actor="Super Admin / Staf Layout Redaksi",
        input_desc="Kumpulan berita berstatus PUBLISHED yang terpilih untuk diterbitkan ke edisi cetak.",
        action_steps=[
            "Masuk ke menu 'Cetak Koran PDF' (/admin/koran).",
            "Pilih edisi yang sedang disusun atau klik 'Buat Edisi Baru' (misal: Edisi Khusus Hari Bhayangkara).",
            "Buka tab 'Pilih Berita Portal' di sisi kanan layar.",
            "Klik tombol 'Gunakan di Cover' pada berita utama untuk menempatkannya pada Halaman 1.",
            "Pilih naskah sekunder untuk mengisi kolom berita Halaman 2 (Jendela Redaksi / Opini).",
            "Sesuaikan ukuran headline, atur kolom teks, dan periksa pratinjau lembaran koran di kanvas A4.",
            "Klik tombol 'Simpan Tata Letak Edisi' untuk mengunci susunan layout."
        ],
        output_desc="Layout edisi koran tersimpan lengkap dalam struktur JSON terstruktur siap cetak."
    )

    add_step_card(
        step_num="6",
        title="Pencetakan & Distribusi Fisik (Print-to-Paper / PDF)",
        actor="Super Admin / Divisi Percetakan",
        input_desc="Lembar kerja layout edisi koran yang telah disetujui Pemred.",
        action_steps=[
            "Pada kanvas Desainer Koran, klik tombol 'Cetak Koran (Print / PDF)'.",
            "Dialog cetak peramban akan muncul; pada kolom Printer, pilih 'Save as PDF' atau pilih mesin cetak fisik.",
            "Pastikan Paper Size diatur ke 'A4' dan margins diset ke 'None / Default'.",
            "Centang opsi 'Background graphics' agar elemen warna dan banner koran tercetak sempurna.",
            "Klik tombol 'Save' atau 'Print'. Hasil file PDF siap diserahkan ke percetakan mitra."
        ],
        output_desc="Dokumen PDF siap cetak dengan layout koran 4 kolom profesional standar industri cetak."
    )

    doc.add_page_break()

    # =========================================================================
    # BAB IV: PANDUAN PENGOPERASIAN RUNUT PER ROLE
    # =========================================================================
    add_heading_styled("BAB IV: PANDUAN PENGOPERASIAN RUNUT PER ROLE", level=1)
    
    p_role_intro = doc.add_paragraph(
        "Bab ini merupakan panduan praktis langkah-demi-langkah (step-by-step) yang disusun "
        "khusus untuk setiap peran (role). Setiap tindakan dilengkapi dengan instruksi yang teruji, "
        "peringatan keamanan, serta kotak penyisipan tangkapan layar (screenshot)."
    )
    p_role_intro.paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------------------
    # 4.1 SUPER ADMIN / OWNER
    # -------------------------------------------------------------------------
    add_heading_styled("4.1 Role 1: Super Admin / Owner (Akses Penuh Sistem)", level=2)
    p_sa = doc.add_paragraph(
        "Super Admin atau Owner memegang kunci kendali tertinggi atas kelangsungan ekosistem Jurnal Polisi. "
        "Tugas utama meliputi manajemen akun staf, pengaturan identitas portal, supervisi hak akses, "
        "hingga pencetakan koran fisik."
    )
    p_sa.paragraph_format.space_after = Pt(4)

    # 4.1.1 Login & Dashboard
    add_heading_styled("4.1.1 Prosedur Masuk Sistem & Tinjauan Dasbor Utama", level=3)
    p_sa_log = doc.add_paragraph(
        "1. Buka peramban dan arahkan ke alamat URL: http://localhost:3000/admin/login (atau domain resmi Anda).\n"
        "2. Masukkan Username (misal: 'agung' atau 'superadmin') dan Kata Sandi yang telah diberikan.\n"
        "3. Klik tombol 'Masuk ke Dashboard'. Sistem akan memvalidasi kredensial dan menerbitkan cookie sesi JWT aman.\n"
        "4. Setelah berhasil masuk, Anda akan diarahkan ke Dashboard Utama yang memuat ringkasan total artikel, "
        "total kategori, banner aktif, dan total akun terdaftar."
    )
    add_image_placeholder(
        img_id="Gambar 4.1.1",
        caption="Layar Login & Tampilan Dasbor Utama Super Admin",
        description="Tangkapan layar antarmuka halaman login gelap elegan (/admin/login) serta halaman utama Dashboard Admin Presisi dengan kartu metrik statistik.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # 4.1.2 Manajemen Pengguna
    add_heading_styled("4.1.2 Manajemen Pengguna & Pembagian Peran Personel", level=3)
    p_sa_user = doc.add_paragraph(
        "Super Admin memiliki wewenang eksklusif untuk menambah, menyunting, mereset sandi, dan menonaktifkan pengguna:\n"
        "1. Klik menu 'Pengguna & Akses' pada sidebar kiri (/admin/pengguna).\n"
        "2. Untuk menambah personel baru: Klik tombol '+ Tambah Pengguna'.\n"
        "3. Isi formulir pop-up: Nama Lengkap (contoh: Briptu Rian Syahputra), Username (rian.syah), "
        "Email resmi, Kata Sandi awal (minimal 8 karakter), dan pilih Peran yang sesuai (Owner, Pemred, Editor, Wartawan, atau Manajer Iklan).\n"
        "4. Klik 'Simpan Akun'. Sistem akan meng-hash sandi dengan Bcrypt secara otomatis.\n"
        "5. Mengubah Peran / Sandi: Klik ikon pensil untuk mengubah data, atau klik ikon Kunci untuk me-reset password personel yang lupa sandi.\n"
        "6. Menonaktifkan Akses: Klik tombol status (Aktif/Nonaktif) untuk memblokir personel tanpa menghapus riwayat berita buatannya."
    )
    add_image_placeholder(
        img_id="Gambar 4.1.2",
        caption="Antarmuka Manajemen Pengguna & Modal Tambah Pengguna",
        description="Tangkapan layar tabel daftar pengguna sistem beserta modal pop-up formulir penambahan personel baru beserta pilihan dropdown Super Grup dan Peran.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # 4.1.3 Kategori Berita
    add_heading_styled("4.1.3 Manajemen Kategori Berita & Etalase Kategori Cepat", level=3)
    p_sa_kat = doc.add_paragraph(
        "Kategori mengelompokkan konten berita agar pembaca mudah menemukan topik spesifik:\n"
        "1. Klik menu 'Kategori Berita' (/admin/kategori).\n"
        "2. Klik '+ Tambah Kategori'. Masukkan Nama Kategori (misal: 'Hukum & Keadilan'), Slug (hukum-keadilan), "
        "dan Tagline inspiratif (misal: 'Menegakkan Keadilan Tanpa Pandang Bulu').\n"
        "3. Opsi 'Tampilkan di Kategori Cepat': Centang opsi ini jika kategori tersebut ingin dimunculkan sebagai kartu navigasi cepat di beranda publik (maksimal 3 kategori terbaik).\n"
        "4. Klik 'Simpan Kategori'."
    )
    add_image_placeholder(
        img_id="Gambar 4.1.3",
        caption="Halaman Pengelolaan Kategori Berita & Kartu Kategori Cepat",
        description="Tangkapan layar daftar kategori berita di admin, menampilkan nama kategori, slug URL, tagline, dan switch penayangan di Beranda Cepat.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # 4.1.4 Pengaturan Portal
    add_heading_styled("4.1.4 Konfigurasi Identitas Portal & Kontak Redaksi", level=3)
    p_sa_set = doc.add_paragraph(
        "1. Buka menu 'Pengaturan Portal' (/admin/pengaturan).\n"
        "2. Sesuaikan Nama Portal Berita ('JURNAL POLISI') dan Slogan Resmi.\n"
        "3. Masukkan Alamat Kantor Redaksi, Nomor Hotline Pengaduan / Redaksi, dan Alamat Email Resmi.\n"
        "4. Masukkan tautan sosial media resmi (Instagram, Facebook, YouTube, TikTok).\n"
        "5. Klik tombol 'Simpan Pengaturan'. Perubahan akan langsung tercermin pada footer portal publik."
    )
    add_image_placeholder(
        img_id="Gambar 4.1.4",
        caption="Formulir Pengaturan Portal & Informasi Kontak Resmi",
        description="Tangkapan layar formulir pengaturan identitas situs, alamat markas redaksi, kontak pengaduan hotline presisi, dan tautan jejaring sosial.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # 4.1.5 Halaman Statis
    add_heading_styled("4.1.5 Pengelolaan Halaman Statis & Pedoman Media Siber", level=3)
    p_sa_hal = doc.add_paragraph(
        "Sesuai regulasi Dewan Pers, portal berita wajib memuat halaman transparansi:\n"
        "1. Buka menu 'Halaman Statis' (/admin/halaman).\n"
        "2. Pilih halaman yang ingin diperbarui: 'Susunan Redaksi', 'Pedoman Pemberitaan Media Siber', atau 'Syarat & Ketentuan (ToS)'.\n"
        "3. Sunting isi pasal atau susunan dewan pembina dan redaktur menggunakan editor teks.\n"
        "4. Klik 'Perbarui Halaman'."
    )
    add_image_placeholder(
        img_id="Gambar 4.1.5",
        caption="Halaman Manajemen Konten Statis Regulasi Dewan Pers",
        description="Tangkapan layar modul pengeditan dokumen statis portal (Susunan Redaksi, Pedoman Media Siber, dan Ketentuan Layanan).",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # -------------------------------------------------------------------------
    # 4.2 PEMIMPIN REDAKSI (PEMRED)
    # -------------------------------------------------------------------------
    add_heading_styled("4.2 Role 2: Pemimpin Redaksi (Pemred)", level=2)
    p_pem = doc.add_paragraph(
        "Pemimpin Redaksi bertindak sebagai penanggung jawab tertinggi materi jurnalisme. "
        "Pemred memastikan seluruh naskah yang terbit sesuai dengan UU Pers, Kode Etik Jurnalistik (KEJ), "
        "serta menentukan naskah mana yang layak menjadi etalase utama (Headline)."
    )
    p_pem.paragraph_format.space_after = Pt(4)

    add_heading_styled("4.2.1 Supervisi Naskah & Tinjauan Metrik Redaksi", level=3)
    p_pem_rev = doc.add_paragraph(
        "1. Masuk ke menu 'Kelola Berita' (/admin/berita).\n"
        "2. Amati kolom statistik pembaca (Views) dan status naskah (Published, Draft, Archived).\n"
        "3. Evaluasi produktivitas wartawan dan kecepatan tim editor dalam memproses rilis liputan."
    )
    add_image_placeholder(
        img_id="Gambar 4.2.1",
        caption="Tinjauan Tabel Berita & Metrik Pembaca untuk Pemimpin Redaksi",
        description="Tangkapan layar tabel berita komprehensif menampilkan judul naskah, kategori, penulis/wartawan, jumlah tayang (views), dan status publikasi.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.2.2 Menetapkan Berita Utama (Hero Slider) & Berita Pilihan", level=3)
    p_pem_head = doc.add_paragraph(
        "Penetapan berita headline dilakukan dengan kurasi ketat:\n"
        "1. Pada daftar berita, klik 'Edit' pada berita yang memiliki nilai berita (news value) nasional atau viral positif.\n"
        "2. Di panel sebelah kanan ('Konfigurasi Publikasi'), temukan opsi:\n"
        "   - 'Berita Utama (Headline Slider)': Centang opsi ini agar berita tampil pada tayangan geser (slider) paling atas beranda.\n"
        "   - 'Berita Pilihan (Featured)': Centang opsi ini agar artikel masuk pada kotak 4 kolom berita rekomendasi redaksi.\n"
        "3. Klik 'Perbarui Berita'. Tampilan beranda portal akan langsung menampilkan banner berita utama tersebut secara visual memukau."
    )
    add_image_placeholder(
        img_id="Gambar 4.2.2",
        caption="Pengaturan Berita Utama (Headline Slider) & Berita Pilihan",
        description="Tangkapan layar panel samping kanan formulir berita dengan checkbox 'Berita Utama' dan 'Berita Pilihan' yang diaktifkan oleh Pemred.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.2.3 Pengarsipan Naskah (Hak Koreksi / Takedown)", level=3)
    p_pem_arch = doc.add_paragraph(
        "Apabila ada permohonan hak jawab, koreksi fatal, atau naskah kadaluarsa:\n"
        "1. Buka naskah terkait di formulir berita.\n"
        "2. Ubah dropdown Status dari 'PUBLISHED' menjadi 'ARCHIVED'.\n"
        "3. Berita yang diarsipkan akan otomatis lenyap dari pencarian dan beranda publik, namun datanya tetap aman tersimpan di database sebagai arsip legalitas pers."
    )
    add_image_placeholder(
        img_id="Gambar 4.2.3",
        caption="Pengubahan Status Menjadi ARCHIVED untuk Pengarsipan Naskah",
        description="Tangkapan layar opsi pemilihan status ARCHIVED pada formulir artikel untuk mengamankan rekam jejak berita tanpa menghapus data permanen.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # -------------------------------------------------------------------------
    # 4.3 EDITOR REDAKSI
    # -------------------------------------------------------------------------
    add_heading_styled("4.3 Role 3: Editor Redaksi", level=2)
    p_ed = doc.add_paragraph(
        "Editor Redaksi merupakan palang pintu kualitas naskah sebelum dikonsumsi publik. "
        "Editor bertugas memeriksa kepatuhan tata bahasa, ketepatan gelar/pangkat, "
        "kualitas foto sampul, hingga optimalisasi mesin pencari (SEO)."
    )
    p_ed.paragraph_format.space_after = Pt(4)

    add_heading_styled("4.3.1 Memeriksa Antrean Naskah Draf dari Wartawan", level=3)
    p_ed_draft = doc.add_paragraph(
        "1. Masuk ke menu 'Kelola Berita'.\n"
        "2. Filter daftar berita dengan memilih status 'DRAFT'.\n"
        "3. Klik tombol pensil (Sunting) pada naskah yang dikirim oleh wartawan lapangan."
    )
    add_image_placeholder(
        img_id="Gambar 4.3.1",
        caption="Antrean Draf Berita Wartawan Siap Sunting oleh Editor",
        description="Tangkapan layar tabel antrean naskah yang berstatus 'DRAFT' yang siap diverifikasi dan diedit oleh tim editor redaksi.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.3.2 Menyunting Naskah dengan Formatter Visual (CKEditor)", level=3)
    p_ed_cke = doc.add_paragraph(
        "1. Koreksi Judul Berita: Buat judul tetap menarik namun tidak menyesatkan (clickbait berlebihan dilarang).\n"
        "2. Format Naskah di CKEditor: Manfaatkan toolbar pengolah kata:\n"
        "   - Heading 2 / Heading 3 untuk sub-judul antar bagian naskah.\n"
        "   - Bold / Italic untuk penekanan istilah khusus atau kutipan pernyataan narasumber.\n"
        "   - Bullet & Numbering untuk daftar data atau butir-butir kronologi.\n"
        "   - Blockquote untuk kutipan resmi pejabat kepolisian.\n"
        "3. Periksa Lead Paragraf pada kotak 'Ringkasan / Excerpt' agar memikat saat muncul di kartu media sosial."
    )
    add_image_placeholder(
        img_id="Gambar 4.3.2",
        caption="Antarmuka Formatter Visual CKEditor pada Penyuntingan Berita",
        description="Tangkapan layar area pengeditan teks kaya (rich-text editor) lengkap dengan deretan ikon styling, blockquote, tabel, dan pemformat naskah berita.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.3.3 Verifikasi Foto Sampul & Pengaturan Tag SEO", level=3)
    p_ed_seo = doc.add_paragraph(
        "1. Periksa foto sampul berita. Jika foto dari wartawan buram atau terdistorsi, Editor dapat mengunggah foto pengganti berkualitas tinggi melalui tombol 'Unggah Gambar'.\n"
        "2. Masukkan kata kunci pencarian pada kolom 'Tag Berita' (pisahkan dengan koma, contoh: 'Humas Polri, Patroli Presisi, Ditlantas, Jakarta'). Tag mempermudah indeksasi mesin pencari Google."
    )
    add_image_placeholder(
        img_id="Gambar 4.3.3",
        caption="Panel Pengaturan Gambar Sampul & Input Tagar Berita",
        description="Tangkapan layar komponen pengunggahan file foto sampul, pratinjau thumbnail gambar 16:9, dan kotak pengisian tagar (tags) berita.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.3.4 Memberikan Catatan Evaluasi & Menerbitkan Berita", level=3)
    p_ed_pub = doc.add_paragraph(
        "1. Jika naskah belum lengkap: Klik tombol 'Lihat Komentar' di bar atas. Tulis catatan untuk wartawan (misal: 'Tolong tambahkan nama lengkap Kasat Reskrim').\n"
        "2. Jika naskah telah memenuhi syarat standar redaksi: Ubah Status Berita menjadi 'PUBLISHED'.\n"
        "3. Klik 'Perbarui Berita'. Artikel akan seketika live dan dapat dibaca oleh seluruh masyarakat."
    )
    add_image_placeholder(
        img_id="Gambar 4.3.4",
        caption="Penerbitan Berita (Status: PUBLISHED) & Kolom Komentar Evaluasi",
        description="Tangkapan layar tombol aksi perubahan status ke 'PUBLISHED' serta modul kotak komentar evaluasi internal redaksi di bawah formulir artikel.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # -------------------------------------------------------------------------
    # 4.4 WARTAWAN / REPORTER LAPANGAN
    # -------------------------------------------------------------------------
    add_heading_styled("4.4 Role 4: Wartawan / Reporter Lapangan", level=2)
    p_wart = doc.add_paragraph(
        "Wartawan atau Reporter bertindak sebagai ujung tombak peliputan informasi di lapangan. "
        "Sistem Jurnal Polisi dirancang secara khusus untuk memberikan antarmuka yang bersih, "
        "cepat, dan terfokus pada penulisan draf tanpa distraksi pengaturan sistem yang rumit."
    )
    p_wart.paragraph_format.space_after = Pt(4)

    add_heading_styled("4.4.1 Tampilan Dasbor Terfokus Khusus Wartawan", level=3)
    p_wart_dash = doc.add_paragraph(
        "1. Login dengan username dan password wartawan yang diberikan oleh Super Admin.\n"
        "2. Pada antarmuka wartawan, sidebar hanya menampilkan menu 'Dashboard' dan 'Kelola Berita'. "
        "Wartawan hanya dapat melihat dan menyunting naskah miliknya sendiri, menjaga kerahasiaan draf liputan."
    )
    add_image_placeholder(
        img_id="Gambar 4.4.1",
        caption="Tampilan Dasbor Khusus Wartawan yang Bersih & Fokus Naskah",
        description="Tangkapan layar antarmuka dashboard wartawan dengan menu yang disederhanakan, hanya berfokus pada ringkasan artikel pribadi dan tombol tulis berita.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.4.2 Menulis Naskah Liputan Baru", level=3)
    p_wart_write = doc.add_paragraph(
        "1. Klik menu 'Kelola Berita', lalu klik tombol '+ Tambah Berita' di pojok kanan atas.\n"
        "2. Isi Judul Artikel: Gunakan kalimat aktif yang jelas dan lugas (contoh: 'Polres Metro Jakpus Gelar Patroli Skala Besar Amankan Obvit Nasional').\n"
        "3. Isi Ringkasan / Excerpt: Tulis 2 sampai 3 kalimat intisari berita yang memuat unsur What, Who, Where, When.\n"
        "4. Tulis Naskah Lengkap di area editor: Uraikan kronologi kejadian, kutipan narasumber resmi kepolisian, dan fakta penunjang."
    )
    add_image_placeholder(
        img_id="Gambar 4.4.2",
        caption="Formulir Penulisan Naskah Liputan Baru untuk Wartawan",
        description="Tangkapan layar formulir pembuatan naskah baru, menampilkan kolom pengisian judul artikel, ringkasan lead, dan lembar naskah utama.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.4.3 Mengunggah Foto Dokumentasi Kejadian", level=3)
    p_wart_pic = doc.add_paragraph(
        "1. Pada panel kanan, temukan kotak 'Gambar Sampul Berita'.\n"
        "2. Klik tombol 'Pilih File' atau seret gambar ke area upload.\n"
        "3. Pastikan foto memiliki orientasi mendatar (Landscape / Rasio 16:9) dengan resolusi minimal 1200x675 piksel.\n"
        "4. Foto akan langsung diunggah ke server dan pratinjaunya langsung tampil di layar."
    )
    add_image_placeholder(
        img_id="Gambar 4.4.3",
        caption="Pengunggahan Foto Dokumentasi Liputan Lapangan",
        description="Tangkapan layar pratinjau foto dokumentasi yang berhasil diunggah wartawan ke dalam formulir berita.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.4.4 Memilih Kategori, Menyimpan Draf & Memantau Evaluasi", level=3)
    p_wart_save = doc.add_paragraph(
        "1. Pilih Kategori yang relevan pada kotak pilihan (misal: Sosial & Kamtibmas).\n"
        "2. Pastikan status berada pada 'DRAFT'.\n"
        "3. Klik tombol hijau 'Simpan Berita'. Naskah kini telah masuk ke antrean editor redaksi.\n"
        "4. Memantau Status: Wartawan dapat memeriksa apakah naskah telah berstatus 'PUBLISHED' atau jika editor mengirimkan catatan perbaikan pada kolom komentar di bagian bawah naskah."
    )
    add_image_placeholder(
        img_id="Gambar 4.4.4",
        caption="Penyimpanan Draf & Notifikasi Keberhasilan Pengiriman Naskah",
        description="Tangkapan layar konfirmasi penyimpanan draf artikel berhasil dan kembalinya wartawan ke tabel antrean berita miliknya.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # -------------------------------------------------------------------------
    # 4.5 MANAJER IKLAN / TIM SPONSORSHIP
    # -------------------------------------------------------------------------
    add_heading_styled("4.5 Role 5: Manajer Iklan / Tim Sponsorship", level=2)
    p_ad = doc.add_paragraph(
        "Manajer Iklan bertanggung jawab mengelola banner promosi mitra, ucapan selamat, "
        "iklan layanan masyarakat kepolisian, dan banner komersial yang tayang di portal Jurnal Polisi."
    )
    p_ad.paragraph_format.space_after = Pt(4)

    add_heading_styled("4.5.1 Struktur Penempatan Slot Iklan (Placement Slots)", level=3)
    p_ad_slots = doc.add_paragraph(
        "Portal Jurnal Polisi menyediakan 4 posisi strategis untuk tayangan banner iklan:"
    )
    
    ad_pos_data = [
        ["SIDEBAR", "Bilah Samping Beranda & Berita", "Banner vertikal / persegi di samping Berita Terbaru.", "300 x 250 px / 300 x 600 px"],
        ["HOME_STRIP", "Strip Melintang Beranda Tengah", "Banner horizontal besar membelah seksi berita pilihan.", "970 x 250 px / 1200 x 300 px"],
        ["ARTICLE_TOP", "Atas Judul Konten Berita", "Banner prestisius tepat di bawah judul artikel berita.", "728 x 90 px / 800 x 120 px"],
        ["FOOTER", "Bagian Bawah Menjelang Footer", "Banner penutup sebelum footer resmi portal.", "970 x 90 px / 1200 x 200 px"]
    ]
    add_styled_table(["Posisi Penempatan", "Letak Tampilan", "Karakteristik Tampilan", "Rekomendasi Dimensi"], ad_pos_data, col_widths=[1.5, 1.8, 2.0, 1.2])

    add_heading_styled("4.5.2 Prosedur Pemasangan Banner Iklan Baru", level=3)
    p_ad_add = doc.add_paragraph(
        "1. Masuk ke menu 'Banner Iklan' (/admin/iklan).\n"
        "2. Klik tombol '+ Tambah Iklan Baru'.\n"
        "3. Isi Judul Iklan (contoh: 'Ucapan HUT Bhayangkara PT Mitra Sejahtera').\n"
        "4. Unggah gambar banner desain yang telah disiapkan melalui tombol 'Unggah Banner'.\n"
        "5. Masukkan Tautan / Link Tujuan (contoh: https://mitrasejahtera.co.id) agar saat pembaca mengeklik banner, mereka langsung diarahkan ke situs mitra.\n"
        "6. Pilih Penempatan Iklan (SIDEBAR, HOME_STRIP, ARTICLE_TOP, atau FOOTER).\n"
        "7. Masukkan Urutan Tayang (angka prioritas posisi).\n"
        "8. Klik 'Simpan Iklan'. Banner akan seketika aktif tayang di portal publik."
    )
    add_image_placeholder(
        img_id="Gambar 4.5.1",
        caption="Modal Pendaftaran Banner Iklan Baru & Pemilihan Penempatan",
        description="Tangkapan layar formulir pop-up tambah iklan, menampilkan input judul iklan, upload foto banner, URL tautan mitra, dan dropdown 4 posisi penempatan.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.5.3 Mengatur Saklar Status Tayang & Penghapusan Iklan", level=3)
    p_ad_tog = doc.add_paragraph(
        "1. Menghentikan Sementara Iklan: Cukup klik saklar (toggle switch) pada baris iklan tersebut. Warna hijau menunjukkan aktif, abu-abu menunjukkan nonaktif.\n"
        "2. Menghapus Banner Kadaluarsa: Klik ikon tempat sampah merah. Dialog konfirmasi akan muncul; klik 'Ya, Hapus Iklan' untuk menghapus banner secara permanen."
    )
    add_image_placeholder(
        img_id="Gambar 4.5.2",
        caption="Pengaturan Saklar Status Tayang (Active/Inactive) Banner Iklan",
        description="Tangkapan layar daftar banner iklan dengan indikator tombol switch status tayang dan tombol hapus dengan konfirmasi dialog modal.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    # -------------------------------------------------------------------------
    # 4.6 PENGGUNA PUBLIK / PEMBACA UMUM
    # -------------------------------------------------------------------------
    add_heading_styled("4.6 Role 6: Pengguna Publik / Pembaca Umum", level=2)
    p_pub = doc.add_paragraph(
        "Pengguna publik mencakup masyarakat umum, aparat kepolisian, jurnalis mitra, "
        "dan instansi pemerintah yang mengakses portal berita Jurnal Polisi untuk mendapatkan informasi kredibel."
    )
    p_pub.paragraph_format.space_after = Pt(4)

    add_heading_styled("4.6.1 Menjelajahi Beranda Utama & Fitur Dark Mode", level=3)
    p_pub_nav = doc.add_paragraph(
        "1. Akses Halaman Depan: Buka alamat web portal. Pengguna disambut oleh Header Merah Maroon Presisi dengan Swoosh Oranye dekoratif.\n"
        "2. Menikmati Hero Slider: Berita utama berputar secara otomatis; klik dot navigasi untuk memilih slide secara manual.\n"
        "3. Berita Pilihan & Kategori Cepat: Gulir ke bawah untuk melihat rangkuman berita terpenting dalam kartu modern beresolusi tinggi.\n"
        "4. Mode Gelap (Dark Mode): Klik ikon Bulan / Matahari di kanan atas header untuk beralih antara tema gelap (latar hitam elegan) dan tema terang."
    )
    add_image_placeholder(
        img_id="Gambar 4.6.1",
        caption="Tampilan Beranda Portal Berita Jurnal Polisi (Mode Terang & Gelap)",
        description="Tangkapan layar etalase beranda utama menampilkan logo presisi, navbar pill, hero slider utama, daftar berita terbaru, dan tombol toggle dark mode.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.6.2 Fitur Pencarian & Halaman Kategori Berita", level=3)
    p_pub_search = doc.add_paragraph(
        "1. Melakukan Pencarian: Klik kolom pencarian di header, ketik kata kunci yang dicari (contoh: 'SIM Keliling' atau 'Kapolri'), lalu tekan Enter. Hasil pencarian akan menampilkan daftar artikel yang relevan secara instan.\n"
        "2. Filter per Kategori: Klik menu 'Kategori' di navbar atas untuk memilih rubrik berita (seperti Politik, Hukum, Sosial, atau Kriminal)."
    )
    add_image_placeholder(
        img_id="Gambar 4.6.2",
        caption="Antarmuka Fitur Pencarian Berita & Navigasi Kategori",
        description="Tangkapan layar halaman hasil pencarian artikel berita (/cari) dan halaman arsip kategori berita (/kategori/[slug]) dengan kartu berita responsif.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("4.6.3 Membaca Berita Lengkap, Bagikan (Share) & Hubungi Redaksi", level=3)
    p_pub_read = doc.add_paragraph(
        "1. Membaca Artikel: Klik kartu berita mana saja. Halaman detail menyajikan teks lengkap, tanggal rilis, nama jurnalis, dan foto dokumentasi.\n"
        "2. Bagikan Berita: Gunakan tombol 'Bagikan ke WhatsApp' atau media sosial untuk menyebarkan informasi positif ke grup komunikasi.\n"
        "3. Mengirim Aduan / Kontak: Di bagian paling bawah (footer), terdapat formulir 'Hubungi Redaksi'. Masyarakat dapat memasukkan Nama, Email, dan Pesan Informasi/Aduan yang akan langsung diterima oleh redaksi."
    )
    add_image_placeholder(
        img_id="Gambar 4.6.3",
        caption="Halaman Baca Berita Lengkap & Formulir Kontak Pengaduan Masyarakat",
        description="Tangkapan layar halaman membaca artikel berita (/berita/[slug]) lengkap dengan tombol share medsos dan formulir kontak pesan redaksi di footer.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    doc.add_page_break()

    # =========================================================================
    # BAB V: PANDUAN MODUL CETAK KORAN DIGITAL (DESAINER A4 ELEKTRONIK)
    # =========================================================================
    add_heading_styled("BAB V: PANDUAN MODUL CETAK KORAN DIGITAL (DESAINER A4 ELEKTRONIK)", level=1)
    
    p_kor_intro = doc.add_paragraph(
        "Modul 'Cetak Koran PDF' (/admin/koran) merupakan inovasi unggulan Jurnal Polisi. "
        "Modul ini menjembatani dunia digital dan cetak dengan memungkinkan redaksi menyusun "
        "layout surat kabar format A4 multi-halaman berstandar percetakan pers langsung dari browser "
        "hanya dengan metode klik dan pilih (tanpa memerlukan Adobe InDesign)."
    )
    p_kor_intro.paragraph_format.space_after = Pt(6)

    add_heading_styled("5.1 Pengenalan Kanvas Koran A4 & Preset Tata Letak", level=2)
    p_kor_pres = doc.add_paragraph(
        "Desainer Koran Jurnal Polisi mendukung multi-halaman dengan preset baku grafika pers:\n"
        "• Halaman 1 (Cover Koran): Dilengkapi Banner Kepala Koran (Masthead 'JURNAL POLISI'), "
        "Nomor Edisi, Tanggal Terbit, Slogan, Berita Utama 3 Kolom dengan Foto Sampul Megah, "
        "serta Berita Sorotan di sisi samping/bawah.\n"
        "• Halaman 2 (Jendela Redaksi & Opini): Memuat Box Susunan Pengasuh Redaksi, "
        "Artikel Tajuk Rencana / Opini Kebijakan Kamtibmas, Berita Nasional 2-3 Kolom, dan Kolom Edukasi Hukum."
    )
    add_image_placeholder(
        img_id="Gambar 5.1",
        caption="Antarmuka Desainer Tata Letak Cetak Koran Presisi Format A4",
        description="Tangkapan layar antarmuka modul cetak koran (/admin/koran) menampilkan kanvas A4 visual surat kabar, panel kontrol edisi, dan tombol print dialog.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("5.2 Alur Pemilihan Berita Portal ke Lembar Koran", level=2)
    p_kor_flow = doc.add_paragraph(
        "Prosedur perakitan koran edisi baru:\n"
        "1. Masuk ke menu 'Cetak Koran PDF' sebagai Super Admin atau Pemred.\n"
        "2. Di panel 'Edisi Tersimpan', pilih edisi yang ingin diedit, atau klik '+ Edisi Baru' lalu beri nama (misal: 'Edisi 01 - Patroli Gabungan Nusantara').\n"
        "3. Buka tab panel kanan 'Pilih Berita Portal'. Sistem otomatis menyajikan 25 berita terbaru berstatus PUBLISHED dari database portal.\n"
        "4. Klik tombol 'Gunakan di Cover' pada berita yang ingin dijadikan headline lembar koran. Teks, foto, ringkasan, dan tanggal akan otomatis mengisi kanvas koran.\n"
        "5. Klik tombol 'Gunakan di Halaman 2' untuk menempatkan berita pada kolom editorial lembar kedua.\n"
        "6. Klik 'Simpan Perubahan Edisi' agar konfigurasi tata letak tersimpan permanen."
    )
    add_image_placeholder(
        img_id="Gambar 5.2",
        caption="Panel Pengambilan Berita Portal ke Kanvas Koran Otomatis",
        description="Tangkapan layar panel samping kanan yang menampilkan daftar berita portal dengan tombol aksi 'Gunakan di Cover' dan 'Gunakan di Halaman 2'.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    add_heading_styled("5.3 Prosedur Pencetakan & Unduh Dokumen PDF Beresolusi Tinggi", level=2)
    p_kor_print = doc.add_paragraph(
        "1. Setelah tata letak dirasa rapi, klik tombol merah 'Cetak Koran (Print / PDF)' di toolbar atas.\n"
        "2. Pengaturan Jendela Cetak Peramban:\n"
        "   - Destination (Tujuan): Pilih printer fisik atau 'Save as PDF'.\n"
        "   - Pages: Pilih 'All' (Semua Halaman) atau tentukan halaman 1-2.\n"
        "   - Layout: Portrait (Tegak).\n"
        "   - Paper Size: Pastikan memilih 'A4'.\n"
        "   - Margins: Pilih 'None' atau 'Default' (sistem CSS koran sudah memiliki margin presisi 10mm).\n"
        "   - Options: Wajib mencentang 'Background graphics' agar warna header koran, garis pemisah kolom, dan badge tercetak jelas.\n"
        "3. Klik 'Save' atau 'Print'. Hasil lembar koran memiliki kualitas cetak tajam, siap didistribusikan ke jajaran polda, polres, dan masyarakat mitra."
    )
    add_image_placeholder(
        img_id="Gambar 5.3",
        caption="Jendela Pengaturan Cetak Browser (Print Preview to PDF A4)",
        description="Tangkapan layar jendela dialog print peramban Chrome/Edge yang memperlihatkan pratinjau lembaran koran A4 siap diekspor menjadi file PDF.",
        recommended_size="1200 x 675 px (Rasio 16:9)"
    )

    doc.add_page_break()

    # =========================================================================
    # BAB VI: PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING & FAQ)
    # =========================================================================
    add_heading_styled("BAB VI: PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING & FAQ)", level=1)
    
    p_tb_intro = doc.add_paragraph(
        "Tabel berikut merangkum potensi kendala operasional yang mungkin dialami personel beserta "
        "langkah penyelesaian teknis mandiri secara cepat dan teruji:"
    )
    p_tb_intro.paragraph_format.space_after = Pt(6)

    trouble_data = [
        ["Gejala Kendala", "Kemungkinan Penyebab", "Solusi Tindakan Personel"],
        ["Gagal Login ('Username atau password salah')", "Salah ketik kredensial atau huruf kapital aktif (Caps Lock).", "Periksa Caps Lock. Jika lupa kata sandi, hubungi Super Admin untuk melakukan reset kata sandi lewat menu Pengguna."],
        ["Sesi Tiba-Tiba Keluar (Logout Otomatis)", "Masa berlaku token JWT (15 menit) habis dan refresh token kadaluarsa.", "Masuk kembali melalui halaman login /admin/login. Selalu simpan draf naskah secara berkala saat menulis berita."],
        ["Gagal Mengunggah Foto Sampul Berita", "Ukuran berkas melebihi batas (maks 5MB) atau format tidak didukung.", "Kompres foto terlebih dahulu (disarankan format JPG/WebP ukuran di bawah 1MB) sebelum diunggah kembali."],
        ["Berita Sudah 'PUBLISHED' Tapi Tidak Muncul di Beranda", "Chache peramban lokal atau berita tergeser urutan waktu terbit.", "Lakukan refresh keras peramban (tekan Ctrl + F5). Periksa apakah naskah tidak sengaja berstatus ARCHIVED."],
        ["Iklan Banner Tidak Muncul di Sisi Samping", "Saklar iklan dalam status nonaktif atau posisi penempatan keliru.", "Buka menu Banner Iklan, pastikan saklar berwarna hijau (aktif) dan posisi tersetting pada 'SIDEBAR'."],
        ["Tampilan Koran Terpotong Saat Dicetak ke PDF", "Pengaturan kertas bukan A4 atau margin peramban diset ke 'Custom'.", "Pada jendela print dialog, ubah Paper Size ke 'A4' dan set Margin ke 'None / Default'. Centang 'Background graphics'."]
    ]
    add_styled_table(["Gejala Kendala", "Kemungkinan Penyebab", "Solusi Tindakan Personel"], trouble_data, col_widths=[2.0, 2.0, 2.5])

    add_heading_styled("Frequently Asked Questions (FAQ Seputar Pengoperasian)", level=2)
    
    faqs = [
        ("Apakah wartawan bisa mengedit berita setelah diterbitkan oleh editor?",
         "Wartawan hanya dapat menyunting draf berita miliknya yang berstatus DRAFT. Begitu naskah telah berstatus PUBLISHED, penyuntingan lanjutan hanya dapat dilakukan oleh Editor Redaksi, Pemred, atau Super Admin demi menjaga integritas berita."),
        
        ("Apakah logo koran pada lembar cetak koran bisa diganti secara mandiri?",
         "Ya, banner kepala koran dan logo bulat dapat disesuaikan melalui direktori /public/images/ atau dikonfigurasi melalui modul Desainer Koran oleh Super Admin."),
        
        ("Berapa lama masa aktif sesi login admin bertahan?",
         "Access Token berlangsung selama 15 menit dan secara otomatis diperpanjang hingga 7 hari selama perangkat aktif dan tidak melakukan 'Keluar Akun (Logout)'.")
    ]
    for q, a in faqs:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(6)
        p_q.paragraph_format.space_after = Pt(2)
        r_q = p_q.add_run(f"Tanya: {q}")
        r_q.bold = True
        r_q.font.color.rgb = RGBColor(127, 0, 0)
        
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(0)
        p_a.paragraph_format.space_after = Pt(4)
        p_a.paragraph_format.left_indent = Inches(0.2)
        r_a = p_a.add_run(f"Jawab: {a}")
        r_a.font.color.rgb = RGBColor(55, 65, 81)

    doc.add_page_break()

    # =========================================================================
    # BAB VII: LEMBAR PENGESAHAN & CATATAN PERUBAHAN
    # =========================================================================
    add_heading_styled("BAB VII: LEMBAR PENGESAHAN & CATATAN PERUBAHAN", level=1)
    
    p_sah_desc = doc.add_paragraph(
        "Buku Panduan Pengguna (User Manual) Portal Berita Jurnal Polisi Edisi 1.0 ini "
        "telah diperiksa, diverifikasi, dan disahkan oleh Dewan Redaksi serta Pimpinan Teknologi Informasi "
        "untuk dijadikan acuan operasional resmi seluruh personel redaksi."
    )
    p_sah_desc.paragraph_format.space_after = Pt(12)

    # Signature Table
    sig_table = doc.add_table(rows=2, cols=3)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(sig_table, color="D1D5DB", sz="4", val="single")
    
    col_w = [2.1, 2.1, 2.1]
    
    headers_sig = ["Disusun Oleh:", "Diperiksa Oleh:", "Disahkan Oleh:"]
    for i, h in enumerate(headers_sig):
        cell = sig_table.cell(0, i)
        cell.width = Inches(col_w[i])
        set_cell_background(cell, "7F0000")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    sig_bodies = [
        "Tim Pengembang TI Presisi\n\n\n\n_________________________\nDivisi Teknologi Informasi\nTanggal: 02 November 2026",
        "Koordinator Redaksi\n\n\n\n_________________________\nBripka Hendra Wijaya\nTanggal: 02 November 2026",
        "Pemimpin Redaksi / Owner\n\n\n\n_________________________\nAgung / Dewan Redaksi\nTanggal: 02 November 2026"
    ]
    for i, b in enumerate(sig_bodies):
        cell = sig_table.cell(1, i)
        cell.width = Inches(col_w[i])
        set_cell_background(cell, "FFFFFF")
        set_cell_margins(cell, top=140, bottom=140, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(b)
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(31, 41, 55)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(16)
    p_sp.paragraph_format.space_after = Pt(4)

    add_heading_styled("Riwayat Versi Dokumen (Document Changelog)", level=2)
    change_history = [
        ["1.0", "02 November 2026", "Rilis perdana Buku Panduan Pengguna Jurnal Polisi lengkap 6 peran, alur end-to-end, modul koran digital A4, dan placeholder tangkapan layar."]
    ]
    add_styled_table(["Versi", "Tanggal Rilis", "Keterangan Catatan Perubahan"], change_history, col_widths=[0.8, 1.5, 4.2])

    output_path = "BUKU_PANDUAN_PENGGUNA_JURNAL_POLISI.docx"
    doc.save(output_path)
    print(f"Manual book successfully created at: {output_path}")

if __name__ == "__main__":
    create_manual()
