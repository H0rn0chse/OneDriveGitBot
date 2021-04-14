import * as path from "path";
import * as fs from "fs";
import { config } from "../../config.js";
import { Debug } from "../Debug.js";
import { GitManager } from "../GitManager.js";
import { OneDriveManager } from "../OneDriveManager.js";
import { iterateFiles } from "./common.js";

export async function sync () {
    const commandName =  "Sync Files";
    Debug.log(`starting ${commandName}`, COMPONENT);

    const oldFolderInfo = await OneDriveManager.readFolderInfo();
    Debug.log(`${commandName} | folderInfo (old) fetch done`, COMPONENT);

    const newFolderInfo = await OneDriveManager.getAllFiles();
    await OneDriveManager.writeFolderInfo(newFolderInfo);
    OneDriveManager.checkTimestamps(oldFolderInfo, newFolderInfo);
    Debug.log(`${commandName} | folderInfo (new) fetch done`, COMPONENT);

    await OneDriveManager.downloadAllFiles(newFolderInfo);
    Debug.log(`${commandName} | download done`, COMPONENT);

    // copy
    const gitFolder = path.join(config.outdir, "repo", config.git.targetFolder);
    const oneDriveFolder = path.join(config.outdir, "folder");

    await iterateFiles(newFolderInfo, "", async (fileInfo, currentDir) => {
        const gitLastModified = await GitManager.getFileLastModified(path.join(currentDir, fileInfo.name));

        if (fileInfo.lastModified > gitLastModified) {
            const sourcePath = path.join(oneDriveFolder, currentDir, fileInfo.name);
            const targetFolder = path.join(gitFolder, currentDir);
            const targetPath = path.join(targetFolder, fileInfo.name);

            if (!fs.existsSync(targetFolder)) {
                await fs.promises.mkdir(targetFolder, { recursive: true });
            }

            await fs.promises.copyFile(sourcePath, targetPath);
        }
    });
    Debug.log(`${commandName} | copy done`, COMPONENT);

    await GitManager.commitAll();
    Debug.log(`${commandName} | commit done`, COMPONENT);

    Debug.log(`finished ${commandName}`, COMPONENT);
}