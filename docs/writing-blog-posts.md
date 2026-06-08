# Panduan Menulis Blog Post Markdown

Panduan ini dipakai untuk membuat tulisan blog di website `wildanisme`. Strukturnya mengambil inspirasi dari dokumentasi AstroPaper, lalu disesuaikan dengan implementasi project ini.

> [!NOTE]
> Di AstroPaper, path folder bisa ikut membentuk URL post. Di project ini URL blog dikontrol oleh field `slug` di frontmatter, bukan oleh lokasi subfolder.

## Ringkasan Cepat

1. Buat file Markdown di `src/content/blog/`.
2. Isi frontmatter sesuai schema blog.
3. Mulai isi artikel dari heading `##`.
4. Pakai code fence dengan bahasa untuk syntax highlighting.
5. Pakai callout seperti `> [!NOTE]` jika butuh catatan khusus.
6. Jalankan `npm run build` sebelum publish.

## Lokasi File

Semua post blog disimpan di:

```txt
src/content/blog/
```

Contoh file:

```txt
src/content/blog/checklist-maintenance-website-lama.md
src/content/blog/seo-teknis-untuk-company-profile.md
src/content/blog/deploy-aplikasi-ke-vps-kecil.md
```

Gunakan huruf kecil dan tanda hubung. Hindari spasi, huruf besar, dan karakter aneh.

## URL Post

URL post mengikuti `slug`, bukan nama file.

```md
---
slug: "checklist-maintenance-website-lama"
---
```

Hasil URL:

```txt
/blog/checklist-maintenance-website-lama/
```

Contoh mapping:

```txt
src/content/blog/checklist-maintenance.md
slug: "checklist-maintenance-website-lama"
URL: /blog/checklist-maintenance-website-lama/
```

Rekomendasi: samakan nama file dengan slug supaya tidak bikin bingung.

## Subfolder

Content collection mendukung file Markdown di subfolder karena memakai pattern `**/*.{md,mdx}`.

Contoh:

```txt
src/content/blog/seo/technical-seo-audit.md
```

Namun URL tetap mengikuti `slug`:

```md
---
slug: "technical-seo-audit"
---
```

Hasil:

```txt
/blog/technical-seo-audit/
```

Gunakan subfolder hanya untuk merapikan file, bukan untuk membentuk URL.

## Draft

Untuk draft:

```yaml
isPublished: false
```

Draft tetap divalidasi saat build, tapi tidak muncul di halaman blog dan tidak dibuat sebagai route publik.

## Frontmatter Wajib

Setiap post wajib punya frontmatter di bagian paling atas.

```md
---
title: "Judul Post"
slug: "judul-post"
description: "Ringkasan pendek untuk SEO, kartu blog, dan meta description."
publishedAt: 2026-06-07
updatedAt: 2026-06-07
tags: ["SEO", "Web Development"]
category: "SEO"
isPublished: true
isFeatured: false
author: "Wildan Taufiq Abdul Aziz"
---
```

Field yang tersedia:

| Field | Wajib | Fungsi |
|---|---:|---|
| `title` | Ya | Judul post yang tampil di halaman blog dan meta title. |
| `slug` | Ya | URL post. Contoh: `/blog/judul-post/`. |
| `description` | Ya | Ringkasan untuk SEO, social preview, dan kartu post. |
| `publishedAt` | Ya | Tanggal publikasi. Format: `YYYY-MM-DD`. |
| `updatedAt` | Tidak | Tanggal update terakhir. Pakai kalau artikel direvisi. |
| `tags` | Ya | Daftar tag. Format array string. |
| `category` | Ya | Kategori utama post. |
| `coverImage` | Tidak | Path gambar cover, misalnya `/images/blog/nama-file.webp`. |
| `isPublished` | Ya | `true` untuk tampil, `false` untuk draft. |
| `isFeatured` | Ya | `true` agar bisa tampil sebagai post unggulan. |
| `author` | Ya | Nama penulis. |

## Mapping dari AstroPaper

Kalau membaca panduan AstroPaper, ini padanan field-nya di project ini:

| AstroPaper | Project ini | Catatan |
|---|---|---|
| `pubDatetime` | `publishedAt` | Project ini cukup pakai `YYYY-MM-DD`. |
| `modDatetime` | `updatedAt` | Opsional. |
| `featured` | `isFeatured` | Boolean. |
| `draft` | `isPublished` | Kebalikannya. `draft: true` berarti `isPublished: false`. |
| `ogImage` | `coverImage` | Saat ini dipakai juga untuk preview post. |
| `canonicalURL` | Belum tersedia | Bisa ditambahkan nanti jika butuh repost/canonical eksternal. |
| `hideEditPost` | Tidak dipakai | Website ini belum punya tombol edit post. |
| `timezone` | Tidak dipakai | Tanggal memakai Date bawaan Astro/build. |

## Template Post Baru

```md
---
title: "Judul yang Jelas dan Tidak Sok Bijak"
slug: "judul-yang-jelas"
description: "Ringkasan pendek berisi masalah, konteks, dan manfaat artikel."
publishedAt: 2026-06-07
updatedAt: 2026-06-07
tags: ["Web Development", "Maintenance"]
category: "Web development"
coverImage: "/images/blog/judul-yang-jelas.webp"
isPublished: true
isFeatured: false
author: "Wildan Taufiq Abdul Aziz"
---

## Jawaban singkat

Tulis jawaban utama dalam 1-2 paragraf. Jangan muter-muter.

## Table of contents

- [Masalah yang sering kejadian](#masalah-yang-sering-kejadian)
- [Cara saya biasanya menangani](#cara-saya-biasanya-menangani)
- [Catatan teknis](#catatan-teknis)

## Masalah yang sering kejadian

Jelaskan konteks masalahnya.

## Cara saya biasanya menangani

1. Cek gejala.
2. Cari akar masalah.
3. Bereskan yang paling berdampak.
4. Tulis catatan supaya tidak mengulang tebak-tebakan.

## Catatan teknis

Tambahkan detail teknis, command, snippet, atau checklist.

## Penutup

Tutup dengan kesimpulan praktis.
```

## Table of Contents

Project ini belum membuat TOC otomatis seperti beberapa theme blog. Jika butuh TOC, tulis manual.

```md
## Table of contents

- [Jawaban singkat](#jawaban-singkat)
- [Checklist awal](#checklist-awal)
- [Command dasar](#command-dasar)
```

Slug heading biasanya dibuat dari teks heading:

```txt
## Checklist awal -> #checklist-awal
## Command dasar -> #command-dasar
```

Gunakan TOC hanya untuk artikel panjang. Untuk artikel pendek, tidak perlu.

## Heading

Layout blog sudah memakai `title` dari frontmatter sebagai `h1`. Jadi isi artikel sebaiknya mulai dari `##`.

```md
## Heading utama bagian artikel

### Subbagian

#### Sub-subbagian
```

Jangan pakai `#` di body post kecuali memang ada alasan kuat. Ini penting untuk aksesibilitas dan SEO.

## Paragraf

Tulis pendek-pendek.

```md
Satu paragraf cukup berisi satu ide.

Kalau sudah mulai panjang, pecah. Pembaca blog teknis biasanya scanning dulu, baru membaca detail.
```

## List

Unordered list:

```md
- Maintenance website
- Bug fix
- Optimasi performa
- SEO teknis
```

Ordered list:

```md
1. Backup dulu.
2. Reproduksi error.
3. Cek log.
4. Fix.
5. Deploy.
```

Checklist:

```md
- [x] Build lokal berhasil
- [x] Metadata sudah diisi
- [ ] Screenshot belum dibuat
```

## Link

Link eksternal:

```md
[Astro](https://astro.build)
```

Link internal:

```md
[Lihat layanan](/services/)
[Lihat project](/projects/)
```

Gunakan teks link yang deskriptif. Hindari `klik di sini`.

## Gambar

### Opsi 1: `public/` (direkomendasikan untuk saat ini)

Simpan gambar di:

```txt
public/images/blog/
```

Contoh:

```txt
public/images/blog/deploy-flow.webp
```

Pakai di Markdown:

```md
![Diagram deploy sederhana](/images/blog/deploy-flow.webp)
```

Kelebihan:

- sederhana;
- path stabil;
- cocok untuk Markdown biasa;
- mudah dipakai untuk `coverImage`.

Kekurangan:

- Astro tidak otomatis mengoptimasi gambar di `public/`;
- ukuran file perlu dikompres manual.

### Opsi 2: `src/assets/`

AstroPaper merekomendasikan `src/assets/` karena Astro bisa mengoptimasi asset. Untuk project ini, pakai opsi ini hanya jika sudah dites di Markdown dan memang butuh optimasi otomatis.

Contoh umum:

```md
![Diagram deploy sederhana](../../assets/images/deploy-flow.webp)
```

Untuk sekarang, jalur paling aman tetap `public/images/blog/`.

### Alt Text

Alt text wajib jelas.

```md
![Diagram alur deploy dari GitHub ke Cloudflare Pages](/images/blog/deploy-flow.webp)
```

Hindari:

```md
![image](/images/blog/deploy-flow.webp)
![screenshot](/images/blog/deploy-flow.webp)
![gambar](/images/blog/deploy-flow.webp)
```

## Cover Image dan OG Image

Jika post punya gambar utama, isi `coverImage`.

```yaml
coverImage: "/images/blog/checklist-maintenance.webp"
```

Saat ini `coverImage` dipakai untuk:

- cover di halaman detail post;
- kartu post;
- meta image lewat layout blog.

Rekomendasi ukuran:

```txt
1200 x 630 px
```

Format yang disarankan:

```txt
webp
jpg
png
```

Sebelum commit, kompres gambar. Jangan upload gambar 4 MB hanya untuk cover blog.

## Inline Code dan Code Block

Inline code:

```md
Jalankan `npm run build` sebelum deploy.
```

Code block tanpa bahasa:

````md
```
npm run build
```
````

Code block dengan bahasa untuk syntax highlighting:

````md
```bash
npm install
npm run build
```
````

Contoh TypeScript:

````md
```ts
type Service = {
  title: string;
  slug: string;
  isPublished: boolean;
};
```
````

Contoh Astro:

````md
```astro
---
const title = "wildanisme";
---

<h1>{title}</h1>
```
````

Bahasa yang umum dipakai:

```txt
bash
sh
txt
ts
tsx
js
jsx
json
astro
html
css
md
yaml
diff
```

## Syntax Highlighting

Astro sudah menyediakan syntax highlighting untuk fenced code block. Kuncinya: tulis nama bahasa setelah tiga backtick.

````md
```ts
const message: string = "Deploy jangan bikin deg-degan";
```
````

Kalau tidak diberi bahasa, code tetap tampil, tapi highlighting tidak spesifik.

Untuk command terminal, pakai `bash`:

````md
```bash
npm run build
```
````

Untuk output terminal, pakai `txt`:

````md
```txt
Build completed in 1.2s
```
````

Untuk patch, pakai `diff`:

````md
```diff
- deploy manual
+ deploy pakai checklist
```
````

## Callout `[!NOTE]`

Website ini mendukung callout gaya GitHub.

Format:

```md
> [!NOTE]
> Ini catatan tambahan. Cocok untuk konteks yang membantu, tapi bukan inti artikel.
```

Hasilnya akan tampil sebagai box callout.

Tipe yang didukung:

```md
> [!NOTE]
> Catatan tambahan.

> [!TIP]
> Saran praktis.

> [!IMPORTANT]
> Hal penting yang jangan dilewatkan.

> [!WARNING]
> Risiko atau hal yang perlu dicek dulu.

> [!CAUTION]
> Peringatan keras. Pakai secukupnya.
```

Callout bisa berisi beberapa paragraf:

```md
> [!WARNING]
> Jangan langsung deploy ke production kalau build lokal belum lewat.
>
> Kedengarannya sepele, tapi banyak masalah dimulai dari "cuma ubah dikit".
```

Callout juga bisa berisi list:

```md
> [!TIP]
> Sebelum bug fix:
>
> - reproduksi error;
> - cek log;
> - catat langkah rollback.
```

Gunakan callout seperlunya. Kalau semua hal diberi callout, tidak ada yang terasa penting.

## Blockquote Biasa

Untuk kutipan biasa:

```md
> Deploy yang baik bukan yang paling canggih, tapi yang bisa diulang tanpa panik.
```

Kalau ingin callout, pakai format `[!NOTE]`.

## Tabel

```md
| Masalah | Gejala | Aksi awal |
|---|---|---|
| Halaman lambat | LCP tinggi | Cek gambar dan JS |
| Deploy rawan | Rollback tidak jelas | Buat checklist |
| SEO lemah | Title duplikat | Rewrite metadata |
```

Tabel cocok untuk:

- perbandingan;
- checklist teknis;
- ringkasan audit;
- prioritas kerja.

Jangan pakai tabel untuk layout visual. Pakai tabel hanya untuk data tabular.

## HTML di Markdown

Markdown bisa berisi HTML sederhana:

```md
<kbd>Cmd</kbd> + <kbd>K</kbd>
```

Tetapi gunakan seperlunya. Untuk layout yang kompleks, lebih baik buat komponen Astro/MDX khusus nanti.

## Komentar

Komentar HTML bisa dipakai untuk catatan internal:

```md
<!-- TODO: tambah screenshot setelah deploy staging -->
```

Jangan tinggalkan komentar internal di post yang sudah publish kecuali memang aman dibaca publik di source.

## Struktur Artikel SEO-Friendly

Pola yang disarankan:

```md
## Jawaban singkat

Jawab pertanyaan utama dalam 40-80 kata.

## Kenapa ini penting

Jelaskan dampaknya.

## Langkah praktis

Beri checklist atau step-by-step.

## Contoh

Tambahkan snippet, command, atau case kecil.

## Kesimpulan

Tutup dengan rangkuman praktis.
```

Untuk AI SEO dan search engine, bagian `Jawaban singkat` membantu mesin memahami inti artikel dengan cepat.

## Gaya Bahasa

Gunakan gaya `wildanisme`:

- Santai.
- Teknis, tapi tidak sok rumit.
- Boleh nyeleneh sedikit.
- Jangan terlalu rapi seperti brosur AI.
- Hindari klaim berlebihan.
- Kalau belum yakin, tulis sebagai pengalaman atau pendekatan, bukan hukum alam.

Contoh yang cocok:

```md
Deploy manual itu tidak selalu salah. Tapi kalau setiap rilis bikin tahan napas, berarti ada yang perlu dirapikan.
```

Contoh yang dihindari:

```md
Kami menghadirkan solusi transformatif end-to-end yang memberdayakan akselerasi digital bisnis Anda.
```

## VS Code Snippet Opsional

Kalau ingin bikin snippet sendiri, buat file:

```txt
.vscode/wildanisme.code-snippets
```

Isi contoh:

```json
{
  "Blog post frontmatter": {
    "prefix": "blogpost",
    "body": [
      "---",
      "title: \"$1\"",
      "slug: \"$2\"",
      "description: \"$3\"",
      "publishedAt: ${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}",
      "updatedAt: ${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}",
      "tags: [\"$4\"]",
      "category: \"$5\"",
      "isPublished: true",
      "isFeatured: false",
      "author: \"Wildan Taufiq Abdul Aziz\"",
      "---",
      "",
      "## Jawaban singkat",
      "",
      "$0"
    ],
    "description": "Insert wildanisme blog post frontmatter"
  }
}
```

Catatan: `.vscode/` saat ini masuk `.gitignore`. Kalau snippet ingin dibagikan ke repo, ubah `.gitignore` dulu.

## Validasi Sebelum Commit

Jalankan:

```bash
npm run build
```

Build akan mengecek:

- frontmatter valid atau tidak;
- tanggal bisa diparse atau tidak;
- route post berhasil dibuat atau tidak;
- Markdown bisa dirender atau tidak.

## Checklist Sebelum Publish

- [ ] File ada di `src/content/blog/`.
- [ ] Nama file mirip dengan `slug`.
- [ ] `title` jelas.
- [ ] `description` tidak terlalu panjang.
- [ ] `publishedAt` benar.
- [ ] `updatedAt` diisi kalau artikel direvisi.
- [ ] `tags` relevan.
- [ ] `category` terisi.
- [ ] `coverImage` diisi jika butuh social preview yang kuat.
- [ ] `isPublished: true`.
- [ ] Heading mulai dari `##`.
- [ ] TOC manual ditambahkan jika artikel panjang.
- [ ] Code block punya bahasa jika butuh syntax highlighting.
- [ ] Gambar punya alt text.
- [ ] Gambar sudah dikompres.
- [ ] Callout dipakai secukupnya.
- [ ] `npm run build` berhasil.

## Contoh Post Lengkap

````md
---
title: "Checklist Maintenance Website Lama"
slug: "checklist-maintenance-website-lama"
description: "Checklist praktis untuk mengecek website lama sebelum bug kecil berubah jadi kerja bakti."
publishedAt: 2026-06-07
updatedAt: 2026-06-07
tags: ["Maintenance", "Web Development", "Bug Fix"]
category: "Web development"
coverImage: "/images/blog/checklist-maintenance-website-lama.webp"
isPublished: true
isFeatured: false
author: "Wildan Taufiq Abdul Aziz"
---

## Jawaban singkat

Maintenance website lama sebaiknya dimulai dari hal yang kelihatan dulu: error, performa, dependency, dan proses deploy. Jangan langsung bongkar total kalau masalahnya belum jelas.

## Table of contents

- [Checklist awal](#checklist-awal)
- [Command dasar](#command-dasar)
- [Contoh catatan temuan](#contoh-catatan-temuan)

> [!NOTE]
> Kalau website masih menghasilkan uang atau masih dipakai client, jangan eksperimen langsung di production.

## Checklist awal

1. Jalankan build lokal.
2. Cek error console.
3. Cek halaman utama di mobile.
4. Cek ukuran gambar.
5. Cek dependency yang terlalu tua.

## Command dasar

```bash
npm install
npm run build
```

## Contoh patch kecil

```diff
- deploy manual tanpa catatan
+ deploy dengan checklist rollback
```

## Contoh catatan temuan

| Area | Temuan | Prioritas |
|---|---|---|
| Build | Masih berhasil | Rendah |
| Image | Hero terlalu besar | Sedang |
| Deploy | Rollback belum jelas | Tinggi |

> [!WARNING]
> Kalau rollback belum jelas, jangan anggap deploy sudah aman. Itu cuma optimis dengan kostum teknis.

## Penutup

Website lama tidak selalu harus ditulis ulang. Kadang cukup dibereskan pelan-pelan, asal tahu bagian mana yang paling sering bikin masalah.
````

## Referensi

- AstroPaper: Adding new posts in AstroPaper theme: https://astro-paper.pages.dev/posts/adding-new-posts-in-astropaper-theme/
- Astro Markdown documentation: https://docs.astro.build/en/guides/markdown-content/
