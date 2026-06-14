import { Resolver, lookup, reverse } from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";

type DnsRecordType = "A" | "AAAA" | "NS" | "MX" | "TXT" | "CAA" | "SOA";
type ExternalLookupResult<T> =
  | { ok: true; data: T; source: string }
  | { ok: false; error: string; sources: string[] };

const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const HOST_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/i;
const RESOLVERS = {
  cloudflare: "1.1.1.1",
  google: "8.8.8.8",
  quad9: "9.9.9.9",
  opendns: "208.67.222.222"
};
const RDAP_IP_SERVERS = [
  "https://rdap.arin.net/registry/ip/",
  "https://rdap.apnic.net/ip/",
  "https://rdap.db.ripe.net/ip/",
  "https://rdap.lacnic.net/rdap/ip/",
  "https://rdap.afrinic.net/rdap/ip/"
];
const IANA_RDAP_DNS_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";

function fail(message: string, status = 400): never {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  throw error;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request gagal.";
}

function isSecurityBlock(error: unknown) {
  const message = getErrorMessage(error);
  return message.includes("private/internal") || message.includes("localhost") || message.includes("diblokir");
}

function normalizeDomain(input: string) {
  const value = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");
  if (!DOMAIN_PATTERN.test(value)) fail("Masukkan domain valid, contoh: wildanisme.com");
  return value;
}

function normalizeHost(input: string) {
  const value = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");
  if (!HOST_PATTERN.test(value) && !net.isIP(value)) fail("Masukkan hostname atau IP valid.");
  return value;
}

function normalizeIp(input: string) {
  const value = input.trim();
  if (!net.isIP(value)) fail("Masukkan IP address valid.");
  return value;
}

function normalizePort(input: string | null | undefined) {
  if (!input) return 443;
  const port = Number(input);
  if (!Number.isInteger(port) || port < 1 || port > 65535) fail("Port harus angka 1-65535.");
  return port;
}

function isPrivateIp(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0
    );
  }

  const value = ip.toLowerCase();
  return value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
}

function assertPublicHost(host: string) {
  const lower = host.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".localhost") || lower.endsWith(".local")) {
    fail("Target internal seperti localhost tidak diizinkan.");
  }

  if (net.isIP(lower) && isPrivateIp(lower)) {
    fail("IP private/internal tidak diizinkan.");
  }
}

async function assertHostResolvesPublic(host: string) {
  assertPublicHost(host);
  if (net.isIP(host)) return;

  const addresses = await withTimeout(lookup(host, { all: true }), 8000);
  if (addresses.some((address) => isPrivateIp(address.address))) {
    fail("Host mengarah ke IP private/internal, request diblokir.");
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout>;
  const timer = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("Request timeout.")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timer]);
  } finally {
    clearTimeout(timeout!);
  }
}

async function safe<T>(callback: () => Promise<T>) {
  try {
    return { ok: true, data: await withTimeout(callback(), 8000) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Lookup gagal." };
  }
}

function createResolver(server?: string) {
  const resolver = new Resolver();
  if (server) resolver.setServers([server]);
  return resolver;
}

async function resolveRecord(domain: string, type: DnsRecordType, server?: string) {
  const resolver = createResolver(server);

  switch (type) {
    case "A":
      return resolver.resolve4(domain);
    case "AAAA":
      return resolver.resolve6(domain);
    case "NS":
      return resolver.resolveNs(domain);
    case "MX":
      return resolver.resolveMx(domain);
    case "TXT":
      return resolver.resolveTxt(domain);
    case "CAA":
      return resolver.resolveCaa(domain);
    case "SOA":
      return resolver.resolveSoa(domain);
  }
}

function getAge(createdAt?: string) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  const days = Math.floor((Date.now() - created.getTime()) / 86_400_000);

  return {
    createdAt: created.toISOString(),
    days,
    years: Number((days / 365.25).toFixed(2))
  };
}

function getEntityName(entity: any) {
  const vcard = entity?.vcardArray?.[1];
  const fn = Array.isArray(vcard) ? vcard.find((item) => item?.[0] === "fn") : undefined;
  return fn?.[3] ?? entity?.handle ?? null;
}

async function fetchJson(url: string, timeoutMs = 8000) {
  const response = await fetch(url, {
    headers: { accept: "application/rdap+json, application/json" },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) fail(`Request gagal dengan status ${response.status}.`, response.status);
  return response.json();
}

async function tryFetchJson(url: string, timeoutMs = 6000): Promise<ExternalLookupResult<any>> {
  try {
    return { ok: true, data: await fetchJson(url, timeoutMs), source: url };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error), sources: [url] };
  }
}

async function getRdapDomainSources(domain: string) {
  const sources = [`https://rdap.org/domain/${domain}`];
  const tld = domain.split(".").at(-1);
  if (!tld) return sources;

  try {
    const bootstrap = await fetchJson(IANA_RDAP_DNS_BOOTSTRAP_URL, 5000);
    const services = Array.isArray(bootstrap.services) ? bootstrap.services : [];
    const service = services.find((item: unknown) => {
      const [tlds] = Array.isArray(item) ? item : [];
      return Array.isArray(tlds) && tlds.some((value) => String(value).toLowerCase() === tld);
    });
    const [, urls] = Array.isArray(service) ? service : [];
    if (Array.isArray(urls)) {
      sources.push(
        ...urls
          .filter((url) => typeof url === "string" && url.startsWith("https://"))
          .map((url) => `${url.endsWith("/") ? url : `${url}/`}domain/${domain}`)
      );
    }
  } catch {
    // rdap.org remains the primary fallback when IANA bootstrap is unavailable.
  }

  return [...new Set(sources)];
}

async function fetchRdapDomain(domain: string): Promise<ExternalLookupResult<any>> {
  const sources = await getRdapDomainSources(domain);
  const errors: string[] = [];

  for (const source of sources) {
    const result = await tryFetchJson(source);
    if (result.ok) return result;
    errors.push(`${source}: ${result.error}`);
  }

  return {
    ok: false,
    error: errors.at(-1) ?? "RDAP domain lookup gagal.",
    sources
  };
}

async function fetchRdapIp(ip: string): Promise<ExternalLookupResult<any>> {
  const sources = RDAP_IP_SERVERS.map((server) => `${server}${ip}`);
  const lookups = sources.map((source) => tryFetchJson(source));
  const results = await Promise.all(lookups);
  const success = results.find((result): result is { ok: true; data: any; source: string } => result.ok);

  if (success) return success;

  return {
    ok: false,
    error: results.find((result) => !result.ok)?.error ?? "RDAP IP lookup gagal.",
    sources
  };
}

function externalFallback(kind: string, target: string, lookup: { error: string; sources: string[] }) {
  return {
    available: false,
    fallback: true,
    target,
    message: `${kind} sedang tidak bisa mengambil data dari sumber eksternal. Coba ulang beberapa saat lagi.`,
    error: lookup.error,
    triedSources: lookup.sources
  };
}

function normalizeUrl(input: string) {
  const raw = input.trim();
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);

  if (!["http:", "https:"].includes(url.protocol)) {
    fail("URL harus memakai http atau https.");
  }

  return url;
}

function pickHeaders(headers: Headers) {
  return {
    location: headers.get("location"),
    cacheControl: headers.get("cache-control"),
    contentType: headers.get("content-type"),
    server: headers.get("server"),
    strictTransportSecurity: headers.get("strict-transport-security"),
    contentSecurityPolicy: headers.get("content-security-policy"),
    xFrameOptions: headers.get("x-frame-options"),
    xContentTypeOptions: headers.get("x-content-type-options")
  };
}

export async function runToolCheck(
  slug: string,
  input: {
    target: string;
    record?: string | null;
    selector?: string | null;
    port?: string | null;
  }
) {
  const startedAt = Date.now();
  const result = await runTool(slug, input);

  return {
    tool: slug,
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    result
  };
}

async function runTool(slug: string, input: { target: string; record?: string | null; selector?: string | null; port?: string | null }) {
  switch (slug) {
    case "dns-lookup":
      return checkDnsLookup(input.target);
    case "dns-propagation":
      return checkDnsPropagation(input.target, input.record);
    case "domain-age":
      return checkDomainAge(input.target);
    case "rdap-whois":
      return checkRdapWhois(input.target);
    case "ssl-expiry":
      return checkSslExpiry(input.target, input.port);
    case "http-header-check":
      return checkHttpHeaders(input.target);
    case "email-auth-check":
      return checkEmailAuth(input.target, input.selector);
    case "reverse-dns":
      return checkReverseDns(input.target);
    case "ip-asn-lookup":
      return checkIpAsn(input.target);
    default:
      fail("Tool tidak ditemukan.", 404);
  }
}

async function checkDnsLookup(target: string) {
  const domain = normalizeDomain(target);
  const records = {
    a: await safe(() => resolveRecord(domain, "A")),
    aaaa: await safe(() => resolveRecord(domain, "AAAA")),
    ns: await safe(() => resolveRecord(domain, "NS")),
    mx: await safe(() => resolveRecord(domain, "MX")),
    txt: await safe(() => resolveRecord(domain, "TXT")),
    caa: await safe(() => resolveRecord(domain, "CAA")),
    soa: await safe(() => resolveRecord(domain, "SOA"))
  };

  return { domain, records };
}

async function checkDnsPropagation(target: string, recordInput?: string | null) {
  const domain = normalizeDomain(target);
  const record = (recordInput || "A").toUpperCase() as DnsRecordType;
  if (!["A", "AAAA", "NS", "MX", "TXT", "CAA", "SOA"].includes(record)) fail("Jenis record tidak didukung.");

  const resolvers = await Promise.all(
    Object.entries(RESOLVERS).map(async ([name, server]) => ({
      name,
      server,
      result: await safe(() => resolveRecord(domain, record, server))
    }))
  );

  return { domain, record, resolvers };
}

async function checkDomainAge(target: string) {
  const domain = normalizeDomain(target);
  const lookup = await fetchRdapDomain(domain);
  if (!lookup.ok) {
    return {
      domain,
      age: null,
      registrar: null,
      status: [],
      events: [],
      external: externalFallback("RDAP domain", domain, lookup)
    };
  }

  const rdap = lookup.data;
  const registration = rdap.events?.find((event: any) => event.eventAction === "registration");
  const registrar = rdap.entities?.find((entity: any) => entity.roles?.includes("registrar"));

  return {
    domain,
    source: lookup.source,
    age: getAge(registration?.eventDate),
    registrar: getEntityName(registrar),
    status: rdap.status ?? [],
    events: rdap.events ?? []
  };
}

async function checkRdapWhois(target: string) {
  const rawTarget = target.trim();

  if (net.isIP(rawTarget)) {
    const ip = normalizeIp(rawTarget);
    if (isPrivateIp(ip)) fail("IP private/internal tidak diizinkan.");

    const lookup = await fetchRdapIp(ip);
    if (!lookup.ok) {
      return {
        type: "ip",
        ip,
        handle: null,
        name: null,
        networkType: null,
        country: null,
        startAddress: null,
        endAddress: null,
        parentHandle: null,
        entities: [],
        events: [],
        external: externalFallback("RDAP IP", ip, lookup)
      };
    }

    const rdap = lookup.data;
    return {
      type: "ip",
      ip,
      source: lookup.source,
      handle: rdap.handle,
      name: rdap.name,
      networkType: rdap.type,
      country: rdap.country,
      startAddress: rdap.startAddress,
      endAddress: rdap.endAddress,
      parentHandle: rdap.parentHandle,
      entities: rdap.entities?.map((entity: any) => ({
        handle: entity.handle,
        roles: entity.roles,
        name: getEntityName(entity)
      })) ?? [],
      events: rdap.events ?? []
    };
  }

  const domain = normalizeDomain(rawTarget);
  const lookup = await fetchRdapDomain(domain);
  if (!lookup.ok) {
    return {
      type: "domain",
      domain,
      handle: null,
      registrar: null,
      nameservers: [],
      status: [],
      events: [],
      external: externalFallback("RDAP domain", domain, lookup)
    };
  }

  const rdap = lookup.data;

  return {
    type: "domain",
    domain,
    source: lookup.source,
    handle: rdap.handle,
    registrar: getEntityName(rdap.entities?.find((entity: any) => entity.roles?.includes("registrar"))),
    nameservers: rdap.nameservers?.map((nameserver: any) => nameserver.ldhName ?? nameserver.unicodeName) ?? [],
    status: rdap.status ?? [],
    events: rdap.events ?? []
  };
}

async function checkSslExpiry(target: string, portInput?: string | null) {
  const hostname = normalizeHost(target);
  const port = normalizePort(portInput);
  try {
    await assertHostResolvesPublic(hostname);

    const certificate = await withTimeout(
      new Promise<tls.PeerCertificate>((resolve, reject) => {
        const socket = tls.connect(port, hostname, { servername: hostname }, () => {
          const peerCertificate = socket.getPeerCertificate();
          socket.end();
          resolve(peerCertificate);
        });

        socket.on("error", reject);
        socket.setTimeout(8000, () => {
          socket.destroy();
          reject(new Error("SSL check timeout."));
        });
      }),
      9000
    );

    const validTo = new Date(certificate.valid_to);
    return {
      hostname,
      port,
      subject: certificate.subject,
      issuer: certificate.issuer,
      validFrom: certificate.valid_from,
      validTo: certificate.valid_to,
      daysRemaining: Math.floor((validTo.getTime() - Date.now()) / 86_400_000),
      subjectAltName: certificate.subjectaltname
    };
  } catch (error) {
    if (isSecurityBlock(error)) throw error;

    return {
      hostname,
      port,
      subject: null,
      issuer: null,
      validFrom: null,
      validTo: null,
      daysRemaining: null,
      subjectAltName: null,
      external: externalFallback("SSL certificate", `${hostname}:${port}`, {
        error: getErrorMessage(error),
        sources: [`${hostname}:${port}`]
      })
    };
  }
}

async function checkHttpHeaders(target: string) {
  let currentUrl = normalizeUrl(target);
  const chain = [];
  const sources = [];

  for (let index = 0; index < 6; index += 1) {
    const source = currentUrl.toString();
    sources.push(source);

    try {
      await assertHostResolvesPublic(currentUrl.hostname);

      const response = await fetch(currentUrl, {
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        headers: { "user-agent": "wildanisme-tools/1.0" }
      });

      const item = {
        url: source,
        status: response.status,
        headers: pickHeaders(response.headers)
      };
      chain.push(item);
      await response.body?.cancel();

      const location = response.headers.get("location");
      if (!location || response.status < 300 || response.status > 399) break;
      currentUrl = new URL(location, currentUrl);
    } catch (error) {
      if (isSecurityBlock(error)) throw error;

      return {
        input: target,
        finalUrl: chain.at(-1)?.url ?? null,
        redirectCount: Math.max(0, chain.length - 1),
        chain,
        external: externalFallback("HTTP header", source, {
          error: getErrorMessage(error),
          sources
        })
      };
    }
  }

  return {
    input: target,
    finalUrl: chain.at(-1)?.url,
    redirectCount: Math.max(0, chain.length - 1),
    chain
  };
}

async function checkEmailAuth(target: string, selectorInput?: string | null) {
  const domain = normalizeDomain(target);
  const selector = (selectorInput || "default").trim();
  if (!/^[a-z0-9._-]{1,63}$/i.test(selector)) fail("Selector DKIM tidak valid.");

  const txt = await safe(() => resolveRecord(domain, "TXT"));
  const dmarc = await safe(() => resolveRecord(`_dmarc.${domain}`, "TXT"));
  const dkim = await safe(() => resolveRecord(`${selector}._domainkey.${domain}`, "TXT"));
  const flatten = (value: unknown) => (Array.isArray(value) ? value.map((row) => (Array.isArray(row) ? row.join("") : row)) : []);

  return {
    domain,
    selector,
    spf: flatten(txt.ok ? txt.data : []).filter((record) => typeof record === "string" && record.toLowerCase().startsWith("v=spf1")),
    dmarc: flatten(dmarc.ok ? dmarc.data : []),
    dkim: flatten(dkim.ok ? dkim.data : []),
    raw: { txt, dmarc, dkim }
  };
}

async function checkReverseDns(target: string) {
  const ip = normalizeIp(target);
  const hostnames = await safe(() => reverse(ip));
  return { ip, hostnames };
}

async function checkIpAsn(target: string) {
  const ip = normalizeIp(target);
  if (isPrivateIp(ip)) fail("IP private/internal tidak diizinkan.");

  const lookup = await fetchRdapIp(ip);
  if (!lookup.ok) {
    return {
      ip,
      handle: null,
      name: null,
      type: null,
      country: null,
      startAddress: null,
      endAddress: null,
      parentHandle: null,
      entities: [],
      external: externalFallback("RDAP IP", ip, lookup)
    };
  }

  const rdap = lookup.data;
  return {
    ip,
    source: lookup.source,
    handle: rdap.handle,
    name: rdap.name,
    type: rdap.type,
    country: rdap.country,
    startAddress: rdap.startAddress,
    endAddress: rdap.endAddress,
    parentHandle: rdap.parentHandle,
    entities: rdap.entities?.map((entity: any) => ({
      handle: entity.handle,
      roles: entity.roles,
      name: getEntityName(entity)
    })) ?? []
  };
}
