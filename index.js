import { DiscordManager } from "./scripts/DiscordManager.js";
import * as dotenv from "dotenv";

dotenv.config();

DiscordManager.login(process.env.DISCORD_TOKEN).then(() => {
    console.log("Discord login successful!");
});