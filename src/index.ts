#!/usr/bin/env node

import chalk from "chalk";
import { userInputSchema } from "./validate.js";
import { getUserInputs } from "./prompts.js";
import { getUsername, ensureRepo, checkRateLimit } from "./github.js";
import { makeCommits } from "./git.js";
import { logError, cleanupTempRepo } from "./utils.js";
// import { renderGraphPreview, renderGraphFromRepo } from "./graph.js";
import inquirer from "inquirer";

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
      batchSize,
      dryRun,
      autoCleanup
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

    // ────────────────
    // DRY RUN PREVIEW
    // ────────────────
    console.log(chalk.yellow("\n🚧 Dry Run Preview:\n"));
    console.table(schedule.map(s => ({ Date: s.isoDay, Commit: `Commit #${s.index}` })));
    // renderGraphPreview(schedule, "ascii");

    if (dryRun) {
      console.log(chalk.gray("\nNo commits were made. Dry-run completed.\n"));

      // Ask if user wants to execute the same schedule on the real repo
      const { proceed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "proceed",
          message: chalk.yellow(
            "Do you want to apply this same commit schedule to the real repository?\n" +
            "This will create real commits and push to your GitHub repository."
          ),
          default: false
        }
      ]);

      if (!proceed) {
        console.log(chalk.red("❌ Operation cancelled by user. Exiting."));
        return;
      }

      console.log(chalk.green("\n✅ Proceeding to real commits...\n"));
    }

    const username = await getUsername(token);
    await ensureRepo(token, username, repoName);

    console.log(chalk.gray("\nGenerating preview graph...\n"));
    // renderGraphPreview(schedule, "ascii");

    const repoPath = await makeCommits({
      token,
      username,
      repoName,
      schedule,
      commitTemplate,
      batchSize,
      dryRun: false // now committing for real
    });

    console.log(chalk.gray("\nFetching updated contribution graph...\n"));
    // await renderGraphFromRepo(repoName, startDate, endDate, "ascii");

    cleanupTempRepo(repoPath, autoCleanup);

  } catch (err: any) {
    logError(err.message || err);
    process.exit(1);
  }
}

main();
