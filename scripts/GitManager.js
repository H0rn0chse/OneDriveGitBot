import * as fs from "fs";
import * as path from "path";
import simpleGit from "simple-git";
import { config } from "../config.js";

const folderPath = path.join(config.outdir, "repo");
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
}

const git = simpleGit(folderPath);

class _GitManager {
    constructor () {
        this.repoPath = null;
    }

    async init (repoPath) {
        this.repoPath = repoPath;
        await this.reset();
    }

    /**
     * Resets the repository to the current most recent state
     */
    async reset () {
        let isGitRepo = fs.existsSync(path.join(folderPath, ".git"));

        if (isGitRepo) {
            const config = await git.listConfig();
            const currentRepoPath = config.all["remote.origin.url"];

            if (currentRepoPath !== this.repoPath) {
                fs.rmdirSync(folderPath, { recursive: true });
                fs.mkdirSync(folderPath);
                isGitRepo = false;
            }
        }

        if (!isGitRepo) {
            await git.clone(this.repoPath, folderPath);
        } else {
            await git.pull();
        }
    }

    async commitAll () {
        const commitMessage = "[BOT] Added resources";

        const status = await git.status();

        if (status.files.length === 0) {
            return;
        }

        await git.raw(["add", "-A"]);
        await git.commit(commitMessage)
        await git.push();
    }

    async getFileLastModified (filePath) {
        if (!fs.existsSync(path.join(folderPath, config.git.targetFolder, filePath))) {
            return 0;
        }
        const log = await git.raw(["log", "-1", `--pretty="format:%ci" ${filePath}`]);
        const isoTime = log.split("\"")[1];
        const ms = new Date(isoTime).getTime();
        return Math.floor(ms / 1000);
    }
}

export const GitManager = new _GitManager();
