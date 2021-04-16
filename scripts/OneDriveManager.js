import * as fs from "fs";
import * as path from "path";
import * as oneDriveAPI from "onedrive-api";
import { config } from "../config.js";
import { Deferred } from "./Deferred.js";
import { Debug } from "./Debug.js";

const folderInfoPath = path.join(config.outdir, "folderInfo.json");
const folderPath = path.join(config.outdir, "folder");
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
}

const COMPONENT = "OneDriveManager";

class _OneDriveManager {
    constructor () {
        this.extensionFilter = null;
    }

    async login (oauth) {
        this.oauth = oauth;
    }

    getExtensionFilter () {
        if (this.extensionFilter) {
            return this.extensionFilter;
        }

        this.extensionFilter = "";
        config.onedrive.allowedExtension.forEach((extension, index, arr) => {
            this.extensionFilter += `endswith(name, '.${extension}') eq true`
            if (index < arr.length - 1) {
                this.extensionFilter += " or "
            }
        });

        return this.extensionFilter;
    }

    checkTimestamps (oldInfo, newInfo) {
        this.checkFolderTimestamps(oldInfo, newInfo);
    }

    checkFolderTimestamps (oldInfo, newInfo) {
        newInfo.files.forEach((newFile) => {
            const oldFile = oldInfo.files.find((oldFile) => {
                return oldFile.id === newFile.id;
            });
            const lastModified = oldFile?.lastModified || 0;
            newFile.updateRequired = lastModified < newFile.lastModified;
        });

        newInfo.folders.forEach((newFolder) => {
            const oldFolder = oldInfo.folders.find((oldFolder) => {
                return oldFolder.id === newFolder.id;
            });
            if (oldFolder) {
                this.checkFolderTimestamps(oldFolder, newFolder);
            }
        })
    }

    async readFolderInfo () {
        if (!fs.existsSync(folderInfoPath)) {
            return {
                folders: [],
                files: []
            };
        }
        const result = await fs.promises.readFile(folderInfoPath, "utf-8");
        return JSON.parse(result);
    }

    async writeFolderInfo (folderInfo) {
        const json = JSON.stringify(folderInfo, null, 2);
        await fs.promises.writeFile(folderInfoPath, json);
    }

    async downloadAllFiles (folderInfo) {
        return this.downloadFolder(folderInfo, folderPath);
    }

    async downloadFolder (folderInfo, currentDir) {
        for (let i=0; i < folderInfo.files.length; i++) {
            const fileInfo = folderInfo.files[i];
            const fileExists = fs.existsSync(path.join(currentDir, fileInfo.name));

            if (!fileExists || fileInfo.updateRequired) {
                await this.downloadFile(fileInfo.id, fileInfo.name, currentDir);
            }
        }

        for (let i=0; i < folderInfo.folders.length; i++) {
            const folder = folderInfo.folders[i];
            const folderPath = path.join(currentDir, folder.name);

            if (!fs.existsSync(folderPath)){
                await fs.promises.mkdir(folderPath, { recursive: true });
            }
            await this.downloadFolder(folder, folderPath);
        }
    }

    async downloadFile (itemId, fileName, dir) {
        return new Promise(async (resolve, reject) => {
            const filePath = path.join(dir, fileName);
            Debug.log(`started: ${filePath}`, COMPONENT);

            const token = await this.oauth.getAccessToken();

            const writeStream = fs.createWriteStream(filePath)
            const fileStream = oneDriveAPI.items.download({
                accessToken: token,
                itemId: itemId,
                drive: config.onedrive.drive,
                driveId: config.onedrive.driveId,
            });

            fileStream.pipe(writeStream);
            fileStream.on("end", resolve);
            fileStream.on("error", reject);
        })
        .catch(() => {
            Debug.error(`Download failed!\nid: ${itemId},\nname:${fileName},\ndir: ${dir}`, COMPONENT);
            console.error(err);
            return this.downloadFile(itemId, fileName, dir);
        });
    }

    async getAllFiles () {
        const files = await this.getFolderInfo(config.onedrive.folderId);
        return files;
    }

    async getFolderInfo (folderId) {
        const result = {
            folders: [],
            files: [],
        };

        const token = await this.oauth.getAccessToken();

        const response = await oneDriveAPI.items.listChildren({
            accessToken: token,
            itemId: folderId,
            drive: config.onedrive.drive,
            driveId: config.onedrive.driveId,
            query: "?$filter=" + encodeURIComponent(`folder ne null or ${this.getExtensionFilter()}`),
        });
        const entities = Object.values(response.value);

        for (let i=0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity.file) {
                result.files.push({
                    id: entity.id,
                    name: entity.name,
                    lastModified: utcToTimestamp(entity.fileSystemInfo.lastModifiedDateTime),
                });
            } else if (entity.folder) {
                const folderInfo = await this.getFolderInfo(entity.id);
                folderInfo.name = entity.name;
                folderInfo.id = entity.id;

                // only track non empty folders
                if (folderInfo.folders.length > 0 || folderInfo.files.length > 0) {
                    result.folders.push(folderInfo);
                }
            }
        }

        return result;
    }
}

function utcToTimestamp (utcTime) {
    const ms = new Date(utcTime).getTime();
    return Math.floor(ms / 1000);
}

export const OneDriveManager = new _OneDriveManager();
