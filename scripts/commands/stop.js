import { DiscordManager } from "../DiscordManager.js";

export function stop () {
    DiscordManager.logoff();
    process.exit();
}