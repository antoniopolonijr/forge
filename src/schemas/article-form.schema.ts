import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  content: z.string().min(1, "Content is required"),
});

export type ArticleFormData = z.infer<typeof articleSchema>;
