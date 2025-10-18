#!/usr/bin/env node

import chalk from "chalk";
import { userInputSchema } from "./validate.js";
import { getUserInputs } from "./prompts.js";
import { getUsername, ensureRepo, checkRateLimit } from "./github.js";
import { makeCommits } from "./git.js";
import { logError } from "./utils.js";

interface CommitScheduleItem {
  isoDay: string;
  index: number;
}

async function main(): Promise<void> {
  try {
    const inputs = await getUserInputs();
    const parsed = userInputSchema.safeParse(inputs);

    if (!parsed.success) {
      console.error(chalk.red(`❌ Validation failed:`));
      console.error(parsed.error.format());
      process.exit(1);
    }

    const {
      token,
      repoName,
      startDate,
      endDate,
      minCommitsPerDay,
      maxCommitsPerDay,
      commitTemplate,
      batchSize
    } = parsed.data;

    await checkRateLimit(token);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const numDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    const schedule: CommitScheduleItem[] = [];

    for (let day = 0; day < numDays; day++) {
      const cur = new Date(start.getTime() + day * 86400000);
      const isoDay = cur.toISOString().slice(0, 10);
      const commitsToday =
        Math.floor(Math.random() * (maxCommitsPerDay - minCommitsPerDay + 1)) + minCommitsPerDay;

      for (let c = 0; c < commitsToday; c++) {
        schedule.push({ isoDay, index: c + 1 });
      }
    }

    console.log(
      chalk.cyan(
        `📅 Total commits to make: ${schedule.length} (range ${minCommitsPerDay}-${maxCommitsPerDay}/day)`
      )
    );

    const username = await getUsername(token);
    await ensureRepo(token, username, repoName);
    await makeCommits({ token, username, repoName, schedule, commitTemplate, batchSize });

  } catch (err: any) {
    logError(err.message || err);
    process.exit(1);
  }
}

main();
