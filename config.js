import * as path from "path";
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
            "docx",
            "txt",
        ],
    },
    git: {
        targetFolder: "/assets"
    }
};