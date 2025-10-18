import fs from "fs";
import { execSync } from "child_process";
import chalk from "chalk";

export function retry(fn, retries = 3, delayMs = 3000) {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await fn();
        return resolve(result);
      } catch (err) {
        if (attempt === retries) return reject(err);
        console.log(chalk.yellow(`⚠️  Attempt ${attempt} failed. Retrying in ${delayMs / 1000}s...`));
        await delay(delayMs);
      }
    }
  });
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function logError(message) {
  console.error(chalk.red(`❌ Error: ${message}`));
}

export function logInfo(message) {
  console.log(chalk.green(`✅ Info: ${message}`));
}

export function logSuccess(message) {
  console.log(chalk.green(`✅ Success: ${message}`));
}

export function logWarning(message) {
  console.warn(chalk.yellow(`⚠️ Warning: ${message}`));
}

export function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export function runCommand(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe" }).toString().trim();
  } catch (err) {
    console.error(chalk.red(`❌ Command failed: ${cmd}`));
    throw err;
  }
}

export function writeFile(path, content) {
  fs.writeFileSync(path, content, "utf-8");
}
