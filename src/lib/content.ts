import type { CollectionEntry } from "astro:content";

type ClientEntry = CollectionEntry<"clients">;

export function getPublishedProjects(projects: CollectionEntry<"projects">[]) {
  return projects
    .filter((project) => project.data.isPublished)
    .sort((a, b) => b.data.year - a.data.year);
}

export function getFeaturedProjects(projects: CollectionEntry<"projects">[]) {
  return getPublishedProjects(projects).filter((project) => project.data.isFeatured);
}

export function getPersonalProjects(projects: CollectionEntry<"projects">[]) {
  return getPublishedProjects(projects).filter((project) => !project.data.clientSlug);
}

export function getPublishedServices(services: CollectionEntry<"services">[]) {
  return services
    .filter((service) => service.data.isPublished)
    .sort((a, b) => a.data.order - b.data.order);
}

export function getFeaturedServices(services: CollectionEntry<"services">[]) {
  return getPublishedServices(services).filter((service) => service.data.isFeatured);
}

export function getPublishedClients(clients: ClientEntry[]) {
  return clients
    .filter((client) => client.data.isPublished)
    .sort((a, b) => a.data.order - b.data.order);
}

export function getFeaturedClients(clients: ClientEntry[]) {
  return getPublishedClients(clients).filter((client) => client.data.isFeatured);
}

export function getPublishedPosts(posts: CollectionEntry<"blog">[]) {
  return posts
    .filter((post) => post.data.isPublished)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function getClient(clients: ClientEntry[], clientSlug?: string) {
  if (!clientSlug) return undefined;
  return clients.find((client) => client.data.slug === clientSlug && client.data.isPublished);
}

export function getClientLabel(clients: ClientEntry[], clientSlug?: string) {
  const client = getClient(clients, clientSlug);
  if (!client) return "Proyek personal";
  return client.data.isPublic ? client.data.name : "Klien confidential";
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}
