import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";

export async function retry<T>(fn: () => Promise<T> | T, retries = 3, delayMs = 3000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(chalk.yellow(`⚠️ Attempt ${attempt} failed. Retrying in ${delayMs / 1000}s...`));
      await delay(delayMs);
    }
  }
  throw new Error("Retry failed");
}

export function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function logError(message: string): void {
  console.error(chalk.red(`❌ ${message}`));
}

export function logInfo(message: string): void {
  console.log(chalk.blue(message));
}

export function logSuccess(message: string): void {
  console.log(chalk.green(`✅ ${message}`));
}

export function logWarning(message: string): void {
  console.log(chalk.yellow(`⚠️  ${message}`));
}

// Dry run prompt
export async function promptDryRun(): Promise<boolean> {
  const { dryRun } = await inquirer.prompt([
    {
      type: "confirm",
      name: "dryRun",
      message: chalk.yellow(
        "🧪 Dry Run Mode: Preview commits without pushing.\n" +
        "Simulates commit schedule but won't push to GitHub."
      ),
      default: false,
    },
  ]);
  return dryRun;
}

// Auto cleanup prompt
export async function promptAutoCleanup(): Promise<boolean> {
  const { autoCleanup } = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoCleanup",
      message: chalk.yellow(
        "🧹 Auto Cleanup: Delete temporary cloned repo after commits?\n" +
        "Keeps your system clean from leftover temp files."
      ),
      default: true,
    },
  ]);
  return autoCleanup;
}

// Cleanup temp repo
export function cleanupTempRepo(repoPath: string, autoCleanup: boolean): void {
  if (!autoCleanup) return;
  if (fs.existsSync(repoPath)) {
    fs.rmSync(repoPath, { recursive: true, force: true });
    console.log(chalk.green("🧹 Temporary repo folder deleted!"));
  }
}
