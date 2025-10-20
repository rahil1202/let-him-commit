import { z } from "zod";
import { CONFIG } from "./config.js";

export const userInputSchema = z.object({
  token: z.string().min(10, "Invalid GitHub token."),
  repoName: z.string().min(1, "Repository name required."),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date."),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date."),
  minCommitsPerDay: z.coerce.number().min(1, "Minimum commits must be at least 1."),
  maxCommitsPerDay: z.coerce.number().min(1, "Maximum commits must be at least 1."),
  batchSize: z.coerce.number().min(1).max(500, "Batch size must be ≤ 500."),
  commitTemplate: z.string().min(1, "Commit message template required."),
  dryRun: z.boolean().default(false),
  autoCleanup: z.boolean().default(false)
})
.refine((data) => data.maxCommitsPerDay >= data.minCommitsPerDay, {
  message: "Max commits per day must be ≥ Min commits per day.",
  path: ["maxCommitsPerDay"]
})
.refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= CONFIG.MAX_DATE_RANGE_DAYS;
}, {
  message: "Date range invalid or exceeds maximum days."
});

export type UserInput = z.infer<typeof userInputSchema>;
