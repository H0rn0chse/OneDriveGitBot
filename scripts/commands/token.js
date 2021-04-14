import { config } from "../../config.js";
import { Debug } from "../Debug.js";
import { OneDriveManager } from "../OneDriveManager.js";

export async function setToken (discordMessage, refreshToken) {
    const token = {
        refresh_token: refreshToken,
        expires_in: 1,
        expires_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    };
    await OneDriveManager.oauth.loadTokenFromObject(token);
}

export async function checkToken () {
    const result = await OneDriveManager.getFolderInfo(config.onedrive.folderId);
    Debug.log(result);
}