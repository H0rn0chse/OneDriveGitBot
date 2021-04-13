import * as path from "path";
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import { config } from "../config.js";
import { GitManager } from "./GitManager.js";
import { OneDriveManager } from "./OneDriveManager.js";

class _CommandManager {
    constructor () {
        // tbd
    }

    execCommand (discordMessage, command, args) {
        console.log(`command: ${command}, args: ${JSON.stringify(args)}`)
    }

    async dummyCommand () {
        console.log("starting dummy command");

        const oldFolderInfo = await OneDriveManager.readFolderInfo();
        console.log("folderInfo (old) fetch done");

        const newFolderInfo = await OneDriveManager.getAllFiles();
        await OneDriveManager.writeFolderInfo(newFolderInfo);
        OneDriveManager.checkTimestamps(oldFolderInfo, newFolderInfo);
        console.log("folderInfo (new) fetch done");

        await OneDriveManager.downloadAllFiles(newFolderInfo);
        console.log("download done");

        // copy
        const gitFolder = path.join(config.outdir, "repo", config.git.targetFolder);
        const oneDriveFolder = path.join(config.outdir, "folder");

        await this._iterateFiles(newFolderInfo, "", async (fileInfo, currentDir) => {
            const gitLastModified = await GitManager.getFileLastModified(path.join(currentDir, fileInfo.name));

            if (fileInfo.lastModified > gitLastModified) {
                const sourcePath = path.join(oneDriveFolder, currentDir, fileInfo.name);
                const targetFolder = path.join(gitFolder, currentDir);
                const targetPath = path.join(targetFolder, fileInfo.name);

                if (!fs.existsSync(targetFolder)) {
                    await fsPromises.mkdir(targetFolder, { recursive: true });
                }

                await fsPromises.copyFile(sourcePath, targetPath);
            }
        });
        console.log("copy done");

        await GitManager.commitAll();
        console.log("commit done");
    }

    async _iterateFiles (folderInfo, currentDir, fnHandler) {
        for (let i=0; i < folderInfo.files.length; i++) {
            const fileInfo = folderInfo.files[i];
            await fnHandler(fileInfo, currentDir);
        }

        for (let i=0; i < folderInfo.folders.length; i++) {
            const folder = folderInfo.folders[i];
            await this._iterateFiles(folder, path.join(currentDir, folder.name), fnHandler);
        }
    }
}

export const CommandManager = new _CommandManager();
