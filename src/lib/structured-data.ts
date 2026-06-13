import { site } from "@data/site";

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.owner,
    alternateName: site.brand,
    url: site.url,
    jobTitle: "Independent Web Developer, Sysadmin/DevOps, and SEO Specialist",
    knowsAbout: [
      "Web Development",
      "Website Maintenance",
      "Bug Fixing",
      "Web Performance Optimization",
      "Sysadmin",
      "DevOps",
      "Application Deployment",
      "Server Hardening",
      "Technical SEO"
    ]
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.brand,
    url: site.url,
    inLanguage: "id-ID",
    description: site.description,
    publisher: {
      "@type": "Person",
      name: site.owner
    }
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
