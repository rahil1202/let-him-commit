import { execSync } from "child_process";
import chalk from "chalk";

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

export function runGitCommand(command: string, repoPath: string): string {
  return execSync(`git -C "${repoPath}" ${command}`, { encoding: "utf-8" }).trim();
}
