import inquirer from "inquirer";
import chalk from "chalk";
import { CONFIG } from "./config.js";
export async function getUserInputs() {
    console.log(chalk.magentaBright(`
      ██╗  ██╗███████╗██╗     ██╗      ██████╗ 
      ██║  ██║██╔════╝██║     ██║     ██╔═══██╗
      ███████║█████╗  ██║     ██║     ██║   ██║
      ██╔══██║██╔══╝  ██║     ██║     ██║   ██║
      ██║  ██║███████╗███████╗███████╗╚██████╔╝
      ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝ 
  `));
    console.log(chalk.yellowBright.bold("GitBack — by Rahil Vahora"));
    console.log(chalk.gray("Time to polish git history — time to flex 😎\n"));
    console.log(chalk.bgRed.white.bold("  WARNING  "));
    console.log(chalk.red(`
    THIS TOOL IS FOR EDUCATIONAL PURPOSES ONLY.
    You are about to create commits and push to your GitHub repository.
    Do NOT misuse this tool. Make sure you use your own account.
  `));
    const { accepted } = await inquirer.prompt([
        {
            type: "confirm",
            name: "accepted",
            message: chalk.yellow("I understand and accept the terms."),
            default: false
        }
    ]);
    if (!accepted) {
        console.log(chalk.red("❌ Operation aborted by user."));
        process.exit(0);
    }
    const inputs = await inquirer.prompt([
        {
            type: "password",
            name: "token",
            mask: "*",
            message: chalk.yellow("Paste your GitHub Personal Access Token:")
        },
        {
            type: "input",
            name: "repoName",
            message: "Enter repository name:",
            default: "let-him-cook"
        },
        {
            type: "input",
            name: "startDate",
            message: "Start date (YYYY-MM-DD):"
        },
        {
            type: "input",
            name: "endDate",
            message: "End date (YYYY-MM-DD):"
        },
        {
            type: "number",
            name: "minCommitsPerDay",
            message: "Minimum commits per day:",
            default: CONFIG.DEFAULT_MIN_COMMITS_PER_DAY
        },
        {
            type: "number",
            name: "maxCommitsPerDay",
            message: "Maximum commits per day:",
            default: CONFIG.DEFAULT_MAX_COMMITS_PER_DAY
        },
        {
            type: "number",
            name: "batchSize",
            message: "Push batch size:",
            default: CONFIG.DEFAULT_BATCH_SIZE
        },
        {
            type: "input",
            name: "commitTemplate",
            message: "Commit message template:",
            default: "Commit for {date} #{index}"
        }
    ]);
    return inputs;
}
