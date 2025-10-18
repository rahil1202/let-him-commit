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

  console.log(chalk.yellowBright.bold("GB not GB road ! Git-Back — by Rahil Vahora"));
  console.log(chalk.gray("Time to polish git history — time to flex 😎\n"));

  console.log(chalk.bgRed.white.bold("  WARNING  "));
  console.log(chalk.red.bold(`
    THIS TOOL IS FOR EDUCATIONAL PURPOSES ONLY.
    You are about to create commits and push to a GitHub repository in your account.
    Do NOT use this to impersonate others or deceive. Always use your own account.
    Make sure the repository is private if you don't want these changes public.
`));
  console.log(chalk.gray("By proceeding you accept responsibility for the changes made by this tool.\n"));

  const { accepted } = await inquirer.prompt([
    {
      type: "confirm",
      name: "accepted",
      message: chalk.yellow("I understand this is for education and I will use it responsibly"),
      default: false
    }
  ]);

  if (!accepted) {
    console.log(chalk.red("\nAborted — please read the warning and run again when ready."));
    process.exit(0);
  }

  console.log(chalk.green("\nPreparing BackCommit — getting things ready...\n"));

  const { token } = await inquirer.prompt([
    {
      type: "password",
      name: "token",
      mask: "*",
      message: chalk.yellow("Paste your GitHub Personal Access Token (repo scope):")
    }
  ]);

  const { repoName } = await inquirer.prompt([
    {
      type: "input",
      name: "repoName",
      message: "Enter repository name:",
      default: "let-him-cook"
    }
  ]);

  const { startDate, endDate } = await inquirer.prompt([
    {
      type: "input",
      name: "startDate",
      message: "Start date (YYYY-MM-DD):"
    },
    {
      type: "input",
      name: "endDate",
      message: "End date (YYYY-MM-DD):"
    }
  ]);

  console.log(chalk.cyan(`
    🧱 STEP 4: Commits per Day Range
    To mimic natural behavior, commits will vary daily within your selected range.
  `));

  const { minCommitsPerDay, maxCommitsPerDay } = await inquirer.prompt([
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
    }
  ]);

  const { batchSize } = await inquirer.prompt([
    {
      type: "number",
      name: "batchSize",
      message: "Push batch size:",
      default: CONFIG.DEFAULT_BATCH_SIZE
    }
  ]);

  const { commitTemplate } = await inquirer.prompt([
    {
      type: "input",
      name: "commitTemplate",
      message: "Commit message template:",
      default: "Commit for {date} #{index}"
    }
  ]);

  console.log(chalk.yellowBright("\n🧾 SUMMARY OF YOUR CONFIGURATION\n"));
  console.log(
    chalk.cyan(`------------------------------------------------------`)
  );
  console.log(`${chalk.white.bold("Repo Name:")}          ${chalk.green(repoName)}`);
  console.log(`${chalk.white.bold("Start Date:")}         ${chalk.green(startDate)}`);
  console.log(`${chalk.white.bold("End Date:")}           ${chalk.green(endDate)}`);
  console.log(`${chalk.white.bold("Commits/Day Range:")}  ${chalk.green(`${minCommitsPerDay} - ${maxCommitsPerDay}`)}`);
  console.log(`${chalk.white.bold("Batch Size:")}         ${chalk.green(batchSize)}`);
  console.log(`${chalk.white.bold("Commit Template:")}    ${chalk.green(commitTemplate)}`);
  console.log(`${chalk.white.bold("Repo Visibility:")}    ${chalk.yellow("Private (auto)")}`);
  console.log(
    chalk.cyan(`------------------------------------------------------`)
  );

  console.log(chalk.gray("Review your settings carefully before continuing...\n"));

  const { confirmProceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmProceed",
      message: chalk.yellow("Proceed with these settings?"),
      default: true
    }
  ]);

  if (!confirmProceed) {
    console.log(chalk.red("❌ Operation cancelled by user."));
    process.exit(0);
  }

  console.log(chalk.greenBright(`
    ✅ All inputs collected successfully!
    Starting validation and GitHub setup...
  `));

  return { token, repoName, startDate, endDate, minCommitsPerDay, maxCommitsPerDay, batchSize, commitTemplate };
}
