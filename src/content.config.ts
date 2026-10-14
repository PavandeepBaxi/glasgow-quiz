import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday",
              "Friday", "Saturday", "Sunday"] as const;

const AREAS = ["City Centre", "Merchant City", "West End", "Finnieston",
               "Southside", "East End", "North"] as const;

const quizzes = defineCollection({
  loader: file("src/data/quizzes.json"),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and hyphens only"),
    pub: z.string().trim().min(1).max(100),
    address: z.string().trim().min(5).max(200),
    area: z.enum(AREAS),

    // Rough box around Glasgow: catches swapped or mistyped coordinates
    lat: z.number().min(55.75).max(55.95),
    lng: z.number().min(-4.5).max(-4.0),

    day: z.enum(DAYS),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "use 24-hour HH:MM, e.g. 20:00"),
    frequency: z.enum(["weekly", "fortnightly", "monthly"]),

    entryFeePence: z.number().int().min(0).max(5000),
    entryBasis: z.enum(["per person", "per team"]).optional(),
    maxTeamSize: z.number().int().min(1).max(20).optional(),
    format: z.enum(["paper", "app", "mixed"]),

    prize: z.string().trim().min(1).max(200),
    jackpot: z.object({
      description: z.string().trim().min(1).max(200),
      currentAmountPence: z.number().int().min(0).optional(),
    }).strict().optional(),

        // Up to 4 labelled links; https only (blocks javascript:, data:, http:)
    links: z.array(
      z.object({
        label: z.string().trim().min(1).max(30),
        url: z.string().url()
          .refine((u) => u.startsWith("https://"), "links must start with https://"),
      }).strict()
    ).max(4).optional(),
        lastVerified: z.coerce.date().max(new Date(), "can't be in the future"),
    verifiedHow: z.enum(["attended", "organiser", "pub website", "social media"]),
  }).strict().refine(
    (q) => q.entryFeePence === 0 || q.entryBasis !== undefined,
    { message: "entryBasis is required when there's an entry fee", path: ["entryBasis"] }
  ),
});

export const collections = { quizzes };