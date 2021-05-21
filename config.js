import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

export const config  = {
    outdir: path.join(dirname, "/out"),
    onedrive: {
        folderId: process.env.FOLDER_ID,
        drive: "personal",
        driveId: process.env.DRIVE_ID,
        allowedExtension: [
            "jpg",
            "jpeg",
            "png",
            "json",
            "tmx",
            "tsx",
            "txt",
        ],
    },
    git: {
        targetFolder: "/client/assets"
    }
};

if (!fs.existsSync(config.outdir)) {
    fs.mkdirSync(config.outdir);
}