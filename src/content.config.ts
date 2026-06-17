import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projectLinks = z
  .array(
    z.object({
      label: z.string(),
      url: z.url()
    })
  )
  .default([]);

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        slug: z.string().refine((value) => value !== "personal", {
          message: "Project slug `personal` is reserved for /projects/personal"
        }),
        clientSlug: z.string().optional(),
        isPublished: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        summary: z.string().optional(),
        role: z.array(z.string()).default([]),
        stack: z.array(z.string()).default([]),
        year: z.number(),
        industry: z.array(z.string()).default([]),
        coverImage: image().optional(),
        gallery: z
          .array(
            z.object({
              image: image(),
              caption: z.string().optional()
            })
          )
          .default([]),
        demoUrl: z.url().optional(),
        links: projectLinks
      })
      .refine((data) => data.slug.length > 0, {
        message: "Project slug is required"
      })
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string(),
    coverImage: z.string().optional(),
    isPublished: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    author: z.string()
  })
});

const services = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.string(),
    summary: z.string(),
    description: z.string(),
    deliverables: z.array(z.string()).default([]),
    idealFor: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    order: z.number().default(0),
    isPublished: z.boolean().default(true),
    isFeatured: z.boolean().default(false)
  })
});

const clients = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/clients" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      logo: image().optional(),
      industry: z.string(),
      website: z.string().default(""),
      relationship: z.string(),
      testimonial: z.string().default(""),
      order: z.number().default(0),
      isPublic: z.boolean().default(true),
      isPublished: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
      coverImage: image().optional()
    })
});

export const collections = { projects, blog, services, clients };
