import { DiscordManager } from "./scripts/DiscordManager.js";
import { OneDriveManager } from "./scripts/OneDriveManager.js";
import * as dotenv from "dotenv";
import { ClientManager } from "./scripts/ClientManager.js";
import { OAuthHandler } from "./scripts/OAuthHandler.js";
import { GitManager } from "./scripts/GitManager.js";
import { Debug } from "./scripts/Debug.js";

dotenv.config();

ClientManager.start().then(() => {
    const OAuth = new OAuthHandler(process.env.MICROSOFT_CLIENTID, process.env.MICROSOFT_APPTOKEN);


    DiscordManager.login(process.env.DISCORD_TOKEN)
        .then(() => {
            console.log("Discord login successful!");
        })
        .then(() => {
            return Promise.all([
                OneDriveManager.login(OAuth).then(() => {
                    console.log("OneDrive login successful!");
                }),
                GitManager.init(process.env.GIT_REPO).then(() => {
                    console.log("Git init successful!");
                }),
            ]);
        })
        .then(() => {
            Debug.log("All Managers were started successfully!");
        });
});
