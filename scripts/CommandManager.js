import * as path from "path";
import * as fs from "fs";
import { Debug } from "./Debug.js";
import { sync } from "./commands/sync.js";
import { addDebug, removeDebug, sendDebug } from "./commands/debugChannel.js";
import { DiscordManager } from "./DiscordManager.js";
import { config } from "../config.js";

const configFile = path.join(config.outdir, "command.json");

const COMPONENT = "CommandManager";

class _CommandManager {
    constructor () {
        this.channelCommands = {
            sync,
            addDebug,
            removeDebug,
        };

        this.dmCommands = {

        };

        this.invokeCommands = {
            sendDebug
        };

        this.config = null;

        this.currentCommand = null;

        this.loadConfig();
    }

    async loadConfig () {
        if (!fs.existsSync(configFile)) {
            this.config = {};
            return;
        }

        const json = await fs.promises.readFile(configFile);
        this.config = JSON.parse(json);
    }

    async saveConfig () {
        const json = JSON.stringify(this.config, null, 2);
        await fs.promises.writeFile(configFile, json);
    }

    async invokeCommand (command, ...args) {
        const handler = this.invokeCommands[command];

        if (!handler) {
            return;
        }

        await handler.apply(this, args);
    }

    async execCommand (discordMessage, command, args, isDM) {
        Debug.log(`command: ${command}, args: ${JSON.stringify(args)}`, COMPONENT);

        if (this.currentCommand) {
            DiscordManager.reply(discordMessage, "There is already a command running! Please wait until it's done and submit your command again");
            return;
        }


        const handler = isDM ? this.dmCommands[command] : this.channelCommands[command];

        if (!handler) {
            DiscordManager.reply(discordMessage, `The command "${command}" does not exist or is not enabled for this scope`);
            return;
        }

        this.currentCommand = command;

        await handler.call(this, discordMessage, ...args);

        this.currentCommand = null;
    }
}

export const CommandManager = new _CommandManager();
