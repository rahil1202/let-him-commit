import inquirer from "inquirer";
import chalk from "chalk";
import { CONFIG } from "./config.js";
import { UserInput } from "./validate.js";
import { promptDryRun, promptAutoCleanup } from "./utils.js";

export async function getUserInputs(): Promise<UserInput & { dryRun: boolean; autoCleanup: boolean }> {
  console.log(chalk.magentaBright(`
      ██╗  ██╗███████╗██╗     ██╗      ██████╗ 
      ██║  ██║██╔════╝██║     ██║     ██╔═══██╗
      ███████║█████╗  ██║     ██║     ██║   ██║
      ██╔══██║██╔══╝  ██║     ██║     ██║   ██║
      ██║  ██║███████╗███████╗███████╗╚██████╔╝
      ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝ 
  `));

  console.log(chalk.yellowBright.bold("Let Him Commit — by Rahil Vahora"));
  console.log(chalk.gray("Time to polish git history — time to flex 😎\n"));

  console.log(chalk.bgRed.white.bold("  WARNING  "));
  console.log(chalk.red(`
    THIS TOOL IS FOR EDUCATIONAL PURPOSES ONLY.
    You are about to create commits and push to your GitHub repository.
    Do NOT misuse this tool. Make sure you use your own account.
  `));

  const { accepted } = await inquirer.prompt<{ accepted: boolean }>([
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

 const inputs = await inquirer.prompt<UserInput>([
  {
    type: "password",
    name: "token",
    mask: "*",
    message: chalk.yellow(
      "Paste your GitHub Personal Access Token:\n\n" +
      chalk.whiteBright("💡 Steps to get a Personal Access Token (PAT):\n") +
      "1. Go to your GitHub settings: " +
      chalk.cyan("https://github.com/settings/tokens") + "\n" +
      "2. In the sidebar, click " + chalk.bold("Developer settings → Personal access tokens → Tokens (classic)") + "\n" +
      "3. Click " + chalk.bold("Generate new token → Generate new token (classic)") + "\n" +
      "4. Give your token a descriptive note, leave expiration as desired.\n" +
      "5. Under " + chalk.bold("Select scopes") + ", check:\n" +
      "   • " + chalk.bgBlue.white("repo") + " → Full control of private repositories\n" +
      "   • " + chalk.bgBlue.white("user") + " → Access user profile info\n" +
      "6. Scroll down and click " + chalk.bold("Generate token") + "\n\n" +
      chalk.whiteBright("Paste the token here:")
    )
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


  // Dry run and auto-clean prompts
  const dryRun = await promptDryRun();
  const autoCleanup = await promptAutoCleanup();

  return { ...inputs, dryRun, autoCleanup };
}
