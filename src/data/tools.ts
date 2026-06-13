export type ToolCategory = "DNS" | "Domain" | "SSL" | "HTTP" | "Email" | "IP" | "Utility";

export interface ToolDefinition {
  slug: string;
  title: string;
  category: ToolCategory;
  summary: string;
  description: string;
  bestFor: string[];
  inputs: string[];
  checks: string[];
  output: string[];
  nodeRuntime: string[];
  astroNote: string;
  exampleCode: string;
  limitations: string[];
}

export const tools: ToolDefinition[] = [
  {
    slug: "link-to-qr-code",
    title: "Link to QR Code",
    category: "Utility",
    summary: "Ubah URL menjadi QR code yang bisa diunduh sebagai PNG atau SVG.",
    description:
      "Tool kecil untuk membuat QR code dari sebuah link. Cocok untuk poster, kartu nama, brosur, slide presentasi, atau kebutuhan share URL tanpa ngetik panjang-panjang.",
    bestFor: ["Membuat QR untuk link website", "Menyiapkan QR event atau materi promosi", "Download QR sebagai PNG/SVG"],
    inputs: ["URL lengkap, contoh: https://wildanisme.com"],
    checks: ["Validasi URL", "Generate QR di browser", "Download PNG", "Download SVG"],
    output: ["Preview QR code", "File PNG", "File SVG", "URL yang dipakai sebagai isi QR"],
    nodeRuntime: ["qrcode", "HTMLCanvasElement", "Blob", "URL.createObjectURL()"],
    astroNote:
      "Tool ini berjalan client-side di browser. Astro tetap membuat halaman cepat dan SEO-friendly, sementara proses QR tidak perlu menyentuh endpoint server.",
    exampleCode: `import QRCode from "qrcode";

const canvas = document.querySelector("canvas");
await QRCode.toCanvas(canvas, "https://wildanisme.com", {
  width: 360,
  margin: 2,
  errorCorrectionLevel: "M"
});`,
    limitations: [
      "QR hanya merepresentasikan link, bukan memvalidasi keamanan link tersebut.",
      "Semakin panjang URL, QR makin padat dan lebih sulit discan.",
      "Download PNG/SVG bergantung pada dukungan browser pengguna."
    ]
  },
  {
    slug: "dns-lookup",
    title: "DNS Lookup",
    category: "DNS",
    summary: "Cek record A, AAAA, NS, MX, TXT, CAA, dan SOA seperti nslookup versi web.",
    description:
      "Tool dasar untuk melihat DNS record sebuah domain. Cocok untuk cek domain baru, migrasi DNS, email setup, atau memastikan record tidak salah ketik.",
    bestFor: [
      "Cek IP tujuan domain",
      "Melihat nameserver aktif",
      "Audit MX/TXT untuk email",
      "Cek CAA sebelum pasang SSL"
    ],
    inputs: ["Domain utama atau subdomain, contoh: wildanisme.com"],
    checks: ["A", "AAAA", "NS", "MX", "TXT", "CAA", "SOA"],
    output: ["Daftar record", "TTL jika tersedia dari resolver", "Error DNS yang mudah dibaca"],
    nodeRuntime: ["node:dns/promises", "Resolver", "resolve4", "resolve6", "resolveNs", "resolveMx", "resolveTxt"],
    astroNote:
      "Jalan lewat Astro endpoint dengan runtime Node. Untuk deploy publik, gunakan adapter server/serverless, bukan static export murni.",
    exampleCode: `import { Resolver } from "node:dns/promises";

const resolver = new Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

export async function lookupDns(domain: string) {
  return {
    a: await resolver.resolve4(domain).catch(() => []),
    aaaa: await resolver.resolve6(domain).catch(() => []),
    ns: await resolver.resolveNs(domain).catch(() => []),
    mx: await resolver.resolveMx(domain).catch(() => []),
    txt: await resolver.resolveTxt(domain).catch(() => [])
  };
}`,
    limitations: [
      "Hasil bisa beda antar resolver.",
      "TXT record sering berupa array bertingkat.",
      "DNS cache bisa membuat perubahan tidak langsung terlihat."
    ]
  },
  {
    slug: "dns-propagation",
    title: "DNS Propagation",
    category: "DNS",
    summary: "Bandingkan hasil DNS dari beberapa resolver publik.",
    description:
      "Tool untuk melihat apakah perubahan DNS sudah terbaca dari resolver berbeda. Ini berguna setelah ganti IP, pindah nameserver, atau update MX/TXT.",
    bestFor: ["Migrasi hosting", "Ganti nameserver", "Cek record baru sudah menyebar", "Membandingkan resolver"],
    inputs: ["Domain", "Jenis record", "Daftar resolver opsional"],
    checks: ["Cloudflare DNS", "Google DNS", "Quad9", "OpenDNS"],
    output: ["Resolver", "Record yang terbaca", "Status sama/beda", "Error per resolver"],
    nodeRuntime: ["node:dns/promises", "Resolver.setServers()"],
    astroNote:
      "Endpoint Astro menjalankan beberapa resolver secara paralel dengan timeout agar request tidak menggantung.",
    exampleCode: `import { Resolver } from "node:dns/promises";

const resolvers = {
  cloudflare: "1.1.1.1",
  google: "8.8.8.8",
  quad9: "9.9.9.9"
};

export async function compareARecord(domain: string) {
  return Promise.all(
    Object.entries(resolvers).map(async ([name, server]) => {
      const resolver = new Resolver();
      resolver.setServers([server]);

      return {
        resolver: name,
        records: await resolver.resolve4(domain).catch(() => [])
      };
    })
  );
}`,
    limitations: [
      "Propagation bukan proses global yang bisa dipastikan 100 persen.",
      "Resolver publik bisa punya cache masing-masing.",
      "Butuh rate limit jika tool dibuka untuk publik."
    ]
  },
  {
    slug: "domain-age",
    title: "Domain Age",
    category: "Domain",
    summary: "Hitung umur domain dari data registrasi RDAP.",
    description:
      "Tool untuk melihat kapan domain pertama kali diregistrasikan dan berapa umurnya. Berguna untuk audit trust, SEO, dan due diligence domain.",
    bestFor: ["Audit SEO awal", "Cek domain bekas", "Validasi trust domain", "Riset kompetitor"],
    inputs: ["Domain root, contoh: example.com"],
    checks: ["RDAP domain", "Event registration", "Registrar", "Status domain"],
    output: ["Tanggal registrasi", "Umur dalam hari/tahun", "Registrar", "Status domain"],
    nodeRuntime: ["fetch()", "RDAP HTTPS API"],
    astroNote:
      "Endpoint memakai RDAP lewat fetch server-side karena formatnya lebih rapi daripada WHOIS port 43.",
    exampleCode: `export async function getDomainAge(domain: string) {
  const response = await fetch(\`https://rdap.org/domain/\${domain}\`, {
    headers: { accept: "application/rdap+json, application/json" }
  });

  if (!response.ok) return null;

  const rdap = await response.json();
  const registration = rdap.events?.find(
    (event: { eventAction: string }) => event.eventAction === "registration"
  );

  return registration?.eventDate ?? null;
}`,
    limitations: [
      "Sebagian TLD menyembunyikan atau membatasi data.",
      "Tanggal registrasi tidak selalu sama dengan umur website.",
      "RDAP response antar registry tidak selalu identik."
    ]
  },
  {
    slug: "rdap-whois",
    title: "RDAP / WHOIS Lookup",
    category: "Domain",
    summary: "Cek registrar domain atau data network IP memakai RDAP.",
    description:
      "Alternatif WHOIS yang lebih rapi karena formatnya JSON. Cocok untuk melihat informasi domain atau IP tanpa parsing teks WHOIS yang bentuknya suka beda-beda.",
    bestFor: ["Cek registrar", "Cek domain status", "Cek nameserver dari registry", "Cek pemilik/network IP"],
    inputs: ["Domain root atau IP publik"],
    checks: ["RDAP events", "Domain status", "Entities", "Nameservers", "Network range"],
    output: ["Registrar atau network owner", "Nameserver domain", "Status EPP", "Range IP", "Tanggal penting"],
    nodeRuntime: ["fetch()", "RDAP bootstrap/service"],
    astroNote:
      "Endpoint memakai rdap.org sebagai proxy publik untuk MVP. Untuk versi serius, gunakan IANA RDAP bootstrap agar request langsung ke registry yang benar.",
    exampleCode: `export async function lookupRdap(domain: string) {
  const response = await fetch(\`https://rdap.org/domain/\${domain}\`, {
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error("RDAP lookup failed");
  }

  return response.json();
}`,
    limitations: [
      "WHOIS mentah tidak disarankan untuk MVP karena output tidak konsisten.",
      "RDAP bisa terkena rate limit.",
      "Data kontak biasanya disembunyikan karena privacy."
    ]
  },
  {
    slug: "ssl-expiry",
    title: "SSL Expiry Checker",
    category: "SSL",
    summary: "Cek issuer, valid from, valid to, dan sisa hari sertifikat SSL.",
    description:
      "Tool untuk memastikan sertifikat SSL domain belum dekat masa expired. Ini penting untuk website bisnis, aplikasi internal, dan domain yang jarang dicek manual.",
    bestFor: ["Monitoring SSL", "Audit sebelum launch", "Cek sertifikat staging", "Troubleshooting HTTPS"],
    inputs: ["Hostname", "Port opsional, default 443"],
    checks: ["Peer certificate", "valid_from", "valid_to", "issuer", "subject"],
    output: ["Tanggal expired", "Sisa hari", "Issuer", "Common name"],
    nodeRuntime: ["node:tls", "tls.connect()", "getPeerCertificate()"],
    astroNote:
      "Jalan di runtime Node server karena browser tidak bisa membuka koneksi TLS mentah untuk membaca sertifikat.",
    exampleCode: `import tls from "node:tls";

export function getSslCertificate(hostname: string) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(443, hostname, { servername: hostname }, () => {
      const certificate = socket.getPeerCertificate();
      socket.end();
      resolve(certificate);
    });

    socket.on("error", reject);
    socket.setTimeout(8000, () => {
      socket.destroy();
      reject(new Error("SSL check timeout"));
    });
  });
}`,
    limitations: [
      "Beberapa host butuh SNI yang benar.",
      "Firewall atau rate limit bisa menolak koneksi.",
      "Sertifikat wildcard perlu interpretasi tambahan."
    ]
  },
  {
    slug: "http-header-check",
    title: "HTTP Header Check",
    category: "HTTP",
    summary: "Cek status code, redirect chain, security header, dan cache header.",
    description:
      "Tool untuk melihat perilaku HTTP sebuah URL. Cocok untuk debug redirect, cache, CDN, security header, dan cek apakah halaman benar-benar bisa diakses.",
    bestFor: ["Cek redirect www/non-www", "Audit security header", "Cek cache CDN", "Debug status 4xx/5xx"],
    inputs: ["URL lengkap, contoh: https://wildanisme.com"],
    checks: ["Status code", "Location", "Cache-Control", "HSTS", "CSP", "X-Frame-Options"],
    output: ["Final URL", "Redirect chain", "Header penting", "Status request"],
    nodeRuntime: ["fetch()", "Response.headers"],
    astroNote:
      "Fetch dari endpoint Astro menghindari CORS client-side dan membuat hasil lebih konsisten.",
    exampleCode: `export async function checkHttp(url: string) {
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(8000)
  });

  return {
    status: response.status,
    location: response.headers.get("location"),
    cacheControl: response.headers.get("cache-control"),
    strictTransportSecurity: response.headers.get("strict-transport-security"),
    contentSecurityPolicy: response.headers.get("content-security-policy")
  };
}`,
    limitations: [
      "Redirect chain perlu loop manual dengan limit.",
      "Beberapa server memblokir user-agent default.",
      "Hasil dari server bisa beda dengan browser pengguna."
    ]
  },
  {
    slug: "email-auth-check",
    title: "Email Auth Check",
    category: "Email",
    summary: "Cek SPF, DMARC, dan petunjuk DKIM dari DNS TXT.",
    description:
      "Tool untuk audit deliverability email domain. Fokusnya mengecek apakah domain punya SPF dan DMARC yang masuk akal, serta membantu mencari selector DKIM umum.",
    bestFor: ["Setup email domain", "Audit deliverability", "Cek DMARC sebelum campaign", "Troubleshooting email masuk spam"],
    inputs: ["Domain", "Selector DKIM opsional"],
    checks: ["SPF TXT", "_dmarc TXT", "selector._domainkey TXT"],
    output: ["SPF record", "DMARC policy", "DKIM record jika selector diketahui", "Catatan risiko"],
    nodeRuntime: ["node:dns/promises", "resolveTxt()"],
    astroNote:
      "Jalan di endpoint server karena lookup DNS tidak tersedia langsung dari browser.",
    exampleCode: `import { resolveTxt } from "node:dns/promises";

export async function checkEmailAuth(domain: string, selector = "default") {
  const txt = await resolveTxt(domain).catch(() => []);
  const dmarc = await resolveTxt(\`_dmarc.\${domain}\`).catch(() => []);
  const dkim = await resolveTxt(\`\${selector}._domainkey.\${domain}\`).catch(() => []);

  return { txt, dmarc, dkim };
}`,
    limitations: [
      "DKIM tidak bisa ditebak sempurna tanpa tahu selector.",
      "SPF include chain perlu parser tambahan jika ingin validasi lengkap.",
      "DMARC policy perlu dibaca bersama kebutuhan bisnis."
    ]
  },
  {
    slug: "reverse-dns",
    title: "Reverse DNS",
    category: "IP",
    summary: "Cek PTR hostname dari sebuah IP address.",
    description:
      "Tool untuk melihat reverse DNS sebuah IP. Umumnya dipakai untuk audit mail server, server hosting, dan identifikasi IP.",
    bestFor: ["Audit mail server", "Cek identitas IP server", "Debug reputasi email", "Validasi PTR"],
    inputs: ["IPv4 atau IPv6"],
    checks: ["PTR record via reverse lookup"],
    output: ["Hostname PTR", "Status lookup", "Catatan jika tidak ada PTR"],
    nodeRuntime: ["node:dns/promises", "reverse()"],
    astroNote:
      "Jalan di runtime Node server. Validasi input IP wajib agar endpoint tidak menjadi alat abuse.",
    exampleCode: `import { reverse } from "node:dns/promises";

export async function reverseDns(ip: string) {
  return reverse(ip).catch(() => []);
}`,
    limitations: [
      "Tidak semua IP punya PTR.",
      "PTR yang ada belum tentu berarti server valid.",
      "Untuk email, PTR perlu dicek bersama forward DNS."
    ]
  },
  {
    slug: "ip-asn-lookup",
    title: "IP ASN Lookup",
    category: "IP",
    summary: "Cek pemilik IP, ASN, network range, dan registry.",
    description:
      "Tool untuk melihat informasi jaringan dari IP address. Berguna saat investigasi traffic, audit hosting, atau memastikan IP berada di provider yang benar.",
    bestFor: ["Audit hosting", "Investigasi IP", "Cek provider jaringan", "Debug akses firewall"],
    inputs: ["IPv4 atau IPv6"],
    checks: ["RDAP IP", "ASN", "Network range", "Registry"],
    output: ["ASN", "Nama network", "CIDR/range", "Registry", "Country jika tersedia"],
    nodeRuntime: ["fetch()", "RDAP IP API"],
    astroNote:
      "Endpoint memakai fetch server-side ke RDAP IP agar informasi jaringan bisa dicek dari satu form.",
    exampleCode: `export async function lookupIpRdap(ip: string) {
  const response = await fetch(\`https://rdap.org/ip/\${ip}\`, {
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) return null;

  return response.json();
}`,
    limitations: [
      "RDAP IP tidak selalu memuat detail geolokasi.",
      "IP cloud/CDN bisa dipakai banyak tenant.",
      "ASN bukan bukti kepemilikan aplikasi."
    ]
  }
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
