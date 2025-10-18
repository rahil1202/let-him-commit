import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import cliProgress from "cli-progress";
import { retry, logInfo, logSuccess, delay } from "./utils.js";
export async function makeCommits({ token, username, repoName, schedule, commitTemplate, batchSize }) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-commit-"));
    const repoPath = path.join(tmpDir, repoName);
    const cloneUrl = `https://${token}@github.com/${username}/${repoName}.git`;
    logInfo("Cloning repository...");
    retry(() => execSync(`git clone ${cloneUrl} ${repoPath}`, { stdio: "inherit" }));
    const readme = path.join(repoPath, "README.md");
    if (!fs.existsSync(readme))
        fs.writeFileSync(readme, "# Backdated commits\n\n");
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(schedule.length, 0);
    for (let i = 0; i < schedule.length; i++) {
        const { isoDay, index } = schedule[i];
        fs.appendFileSync(readme, `- Commit for ${isoDay}\n`);
        const msg = commitTemplate.replace("{date}", isoDay).replace("{index}", index.toString());
        const gitDate = `${isoDay}T12:00:00+00:00`;
        const env = { ...process.env, GIT_AUTHOR_DATE: gitDate, GIT_COMMITTER_DATE: gitDate };
        try {
            execSync(`git add README.md && git commit -m "${msg}" --quiet`, { cwd: repoPath, env });
        }
        catch (e) {
            console.log(`⚠️ Skipped commit ${isoDay} due to: ${e.message}`);
        }
        if ((i + 1) % batchSize === 0 || i === schedule.length - 1) {
            await retry(() => execSync(`git push origin main`, { cwd: repoPath, stdio: "inherit" }), 3, 5000);
            await delay(1000);
        }
        bar.update(i + 1);
    }
    bar.stop();
    logSuccess("All commits pushed successfully!");
    fs.rmSync(tmpDir, { recursive: true, force: true });
}
