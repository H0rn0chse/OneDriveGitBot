import { DiscordManager } from "./scripts/DiscordManager.js";
import { OneDriveManager } from "./scripts/OneDriveManager.js";
import * as dotenv from "dotenv";
import { ClientManager } from "./scripts/ClientManager.js";
import { OAuthHandler } from "./scripts/OAuthHandler.js";
import { GitManager } from "./scripts/GitManager.js";

dotenv.config();

ClientManager.start().then(() => {
    DiscordManager.login(process.env.DISCORD_TOKEN).then(() => {
        console.log("Discord login successful!");
    });

    const OAuth = new OAuthHandler(process.env.MICROSOFT_CLIENTID, process.env.MICROSOFT_APPTOKEN);
    OneDriveManager.login(OAuth).then(() => {
        console.log("OneDrive login successful!");
    });

    GitManager.init(process.env.GIT_REPO).then(() => {
        console.log("Git init successful!");
    });
});
