import { DiscordManager } from "./scripts/DiscordManager.js";
import { OneDriveManager } from "./scripts/OneDriveManager.js";
import * as dotenv from "dotenv";
import { ClientManager } from "./scripts/ClientManager.js";

dotenv.config();

ClientManager.start().then(() => {
    DiscordManager.login(process.env.DISCORD_TOKEN).then(() => {
        console.log("Discord login successful!");
    });

    OneDriveManager.login(process.env.MICROSOFT_CLIENTID, process.env.MICROSOFT_APPTOKEN).then(() => {
        console.log("OneDrive login successful!");
    });
});
