import { execSync } from "child_process";
import chalk from "chalk";
export async function retry(fn, retries = 3, delayMs = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            if (attempt === retries)
                throw err;
            console.log(chalk.yellow(`⚠️ Attempt ${attempt} failed. Retrying in ${delayMs / 1000}s...`));
            await delay(delayMs);
        }
    }
    throw new Error("Retry failed");
}
export function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
export function logError(message) {
    console.error(chalk.red(`❌ ${message}`));
}
export function logInfo(message) {
    console.log(chalk.blue(message));
}
export function logSuccess(message) {
    console.log(chalk.green(`✅ ${message}`));
}
export function logWarning(message) {
    console.log(chalk.yellow(`⚠️  ${message}`));
}
export function runGitCommand(command, repoPath) {
    return execSync(`git -C "${repoPath}" ${command}`, { encoding: "utf-8" }).trim();
}
