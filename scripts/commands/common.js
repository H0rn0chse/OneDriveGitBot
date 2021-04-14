import * as path from "path";

export async function iterateFiles (folderInfo, currentDir, fnHandler) {
    for (let i=0; i < folderInfo.files.length; i++) {
        const fileInfo = folderInfo.files[i];
        await fnHandler(fileInfo, currentDir);
    }

    for (let i=0; i < folderInfo.folders.length; i++) {
        const folder = folderInfo.folders[i];
        await iterateFiles(folder, path.join(currentDir, folder.name), fnHandler);
    }
}