import axios from "axios";
import chalk from "chalk";
import { retry, logInfo, logSuccess } from "./utils.js";
export async function getUsername(token) {
    const headers = { Authorization: `token ${token}` };
    const res = await retry(() => axios.get("https://api.github.com/user", { headers }));
    logInfo(`Fetched GitHub username: ${res.data.login}`);
    return res.data.login;
}
export async function checkRateLimit(token) {
    const headers = { Authorization: `token ${token}` };
    const res = await axios.get("https://api.github.com/rate_limit", { headers });
    const remaining = res.data.rate.remaining;
    if (remaining < 50)
        console.log(chalk.yellow(`⚠️ Warning: only ${remaining} GitHub API calls left`));
    else
        logInfo(`API Rate limit OK (${remaining} calls remaining)`);
}
export async function ensureRepo(token, username, repoName) {
    const headers = { Authorization: `token ${token}` };
    const repoUrl = `https://api.github.com/repos/${username}/${repoName}`;
    try {
        await axios.get(repoUrl, { headers });
        logInfo(`Repo "${repoName}" exists`);
    }
    catch {
        logInfo(`Creating repo "${repoName}"...`);
        await retry(() => axios.post("https://api.github.com/user/repos", { name: repoName, private: true }, { headers }));
        logSuccess(`Created new private repo "${repoName}"`);
    }
}
