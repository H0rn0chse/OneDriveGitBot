import * as fs from "fs";
import * as path from "path";
import simpleGit from "simple-git";
import { config } from "../config.js";

const gitPath = path.join(config.outdir, "repo");
if (!fs.existsSync(gitPath)) {
    fs.mkdirSync(gitPath);
}

const git = simpleGit(gitPath);

class _GitManager {
    constructor () {
        //tbd
    }

    async init (repoPath) {
        let isGitRepo = fs.existsSync(path.join(gitPath, ".git"));

        if (isGitRepo) {
            const config = await git.listConfig();
            const currentRepoPath = config.all["remote.origin.url"];

            if (currentRepoPath !== repoPath) {
                fs.rmdirSync(gitPath, { recursive: true });
                fs.mkdirSync(gitPath);
                isGitRepo = false;
            }
        }

        if (!isGitRepo) {
            await git.clone(repoPath, gitPath);
        } else {
            await git.pull();
            const filePath = "/Readme.md";
            const lastModified = await this.getFileLastModified(filePath);
            console.log(lastModified);
        }
    }

    async getFileLastModified (filePath) {
        const log = await git.raw(["log", "-1", `--pretty="format:%ci" ${filePath}`]);
        const isoTime = log.split("\"")[1];
        const ms = new Date(isoTime).getTime();
        return Math.floor(ms / 1000);
    }
}

export const GitManager = new _GitManager();
