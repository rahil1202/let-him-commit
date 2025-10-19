import chalk from "chalk";
import { execSync } from "child_process";

type DayCount = Record<string, number>;

export interface GraphOptions {
  title?: string;
  mode?: "ascii" | "github";
}

/**
 * Render a contribution-style graph in the terminal.
 */
export function renderAsciiGraph(
  dayCounts: DayCount,
  title = "Contribution Graph",
  mode: "ascii" | "github" = "github"
) {
  console.log(chalk.cyan(`\n📊 ${title}\n`));

  const days = Object.keys(dayCounts).sort();
  if (days.length === 0) {
    console.log(chalk.gray("No commits scheduled.\n"));
    return;
  }

  const startDate = new Date(days[0]);
  const endDate = new Date(days[days.length - 1]);
  const numDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

  const grid: number[][] = [];
  for (let i = 0; i < 7; i++) grid[i] = [];

  for (let d = 0; d < numDays; d++) {
    const cur = new Date(startDate.getTime() + d * 86400000);
    const iso = cur.toISOString().slice(0, 10);
    const weekDay = cur.getDay(); // 0=Sun, 6=Sat
    const week = Math.floor(d / 7);
    const count = dayCounts[iso] || 0;
    grid[weekDay][week] = count;
  }

  console.log("Su Mo Tu We Th Fr Sa");

  for (let day = 0; day < 7; day++) {
    const row = grid[day]
      .map((count) => getBlock(count, mode))
      .join(" ");
    console.log(row);
  }

  console.log();
}

/**
 * Pick visual block style based on commit count.
 */
function getBlock(count: number, mode: "ascii" | "github") {
  if (mode === "ascii") {
    if (count === 0) return chalk.gray("░");
    if (count <= 2) return chalk.green("▒");
    if (count <= 5) return chalk.greenBright("▓");
    return chalk.bold.green("█");
  } else {
    // GitHub green gradient style
    if (count === 0) return chalk.bgGray("  ");
    if (count <= 2) return chalk.bgGreen("  ");
    if (count <= 5) return chalk.bgGreenBright("  ");
    return chalk.bgHex("#00FF00")("  ");
  }
}

/**
 * Preview graph based on commit schedule.
 */
export function renderGraphPreview(schedule: { isoDay: string }[], mode: "ascii" | "github" = "github") {
  const counts: DayCount = {};
  for (const { isoDay } of schedule) counts[isoDay] = (counts[isoDay] || 0) + 1;
  renderAsciiGraph(counts, "🧱 Simulated Contribution Graph (Preview)", mode);
}

/**
 * Generate actual graph from git logs after committing.
 */
export function renderGraphFromRepo(repoPath: string, startDate: string, endDate: string, mode: "ascii" | "github" = "github") {
  try {
    const output = execSync(
      `git -C ${repoPath} log --pretty=format:%cs --since=${startDate} --until=${endDate}`,
      { stdio: ["pipe", "pipe", "ignore"] }
    ).toString();
    const commits = output.split("\n").filter(Boolean);
    const counts: DayCount = {};
    for (const date of commits) counts[date] = (counts[date] || 0) + 1;

    renderAsciiGraph(counts, "🌱 Actual Contribution Graph (After Commit)", mode);
  } catch (err) {
    console.log(chalk.red("⚠️ Unable to render graph from repo commits."));
  }
}
