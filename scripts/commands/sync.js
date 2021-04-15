import * as path from "path";
import * as fs from "fs";
import { config } from "../../config.js";
import { Debug } from "../Debug.js";
import { GitManager } from "../GitManager.js";
import { OneDriveManager } from "../OneDriveManager.js";
import { iterateFiles } from "./common.js";
import { DiscordManager } from "../DiscordManager.js";

export async function sync (discordMessage) {
    const commandName =  "Sync Files";

    Debug.log(`starting`, commandName);
    await DiscordManager.setStatus("fetching infos");

    const oldFolderInfo = await OneDriveManager.readFolderInfo();
    Debug.log(`folderInfo (old) fetch done`, commandName);

    const newFolderInfo = await OneDriveManager.getAllFiles();
    await OneDriveManager.writeFolderInfo(newFolderInfo);
    OneDriveManager.checkTimestamps(oldFolderInfo, newFolderInfo);
    Debug.log(`folderInfo (new) fetch done`, commandName);

    await DiscordManager.setStatus("downloading files");
    await OneDriveManager.downloadAllFiles(newFolderInfo);
    Debug.log(`download done`, commandName);

    await DiscordManager.setStatus("copying files");
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
    Debug.log(`copy done`, commandName);

    await DiscordManager.setStatus("committing files");
    const committedNewFiles = await GitManager.commitAll();
    Debug.log(`commit done`, commandName);

    await DiscordManager.setStatus();
    Debug.log(`finished`, commandName);

    if (committedNewFiles) {
        await DiscordManager.reply(discordMessage, "Successfully synced your new files!", false)
    } else {
        await DiscordManager.reply(discordMessage, "No Sync: There were no newer files", false);
    }
}
