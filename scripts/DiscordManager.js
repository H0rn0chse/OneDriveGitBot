import { Client } from "discord.js";
import { CommandManager } from "./CommandManager.js";
import { Deferred } from "./Deferred.js";

const botName = "!gj";

class _DiscordManager {
    constructor () {
        this.sentMessages = [];
        this.readyDeferred = new Deferred();

        this.client = new Client();

        this.client.once("ready", () => {
            this.readyDeferred.resolve();
            this.client.on("message", this.onMessage);
        });
    }

    login (token) {
        this.client.login(token);
        return this.readyDeferred.promise;
    }

    onMessage (message) {
        // ignore dms
		if (!message.guild) {
			return;
		}

		if (message.content.startsWith(botName)) {
            let start, command, args;
			[start, command, ...args] = message.content.split(" ");

            CommandManager.execCommand(message, command, args);

			return message.delete({ timeout: 1000 });
		}
    }

    async send (channel, message, timeout) {
        const sentMessage = await channel.send(message);
        if (timeout) {
            return sentMessage.delete({ timeout: timeout * 1000 });
        } else if (timeout !== false) {
            this.sentMessages.push(sentMessage);
        }
    }

    async dm (user, message) {
        const channel = await user.createDM();
	    return this.send(channel, message, false);
    }

    async deleteAllMessages () {
        if (this.sentMessages.length === 0) {
            return;
        }

        for (let i=0; i < this.sentMessages.length; i++) {
            const message = this.sentMessages[i];
            await message.delete();
        }
        this.sentMessages = [];
    }
}

export const DiscordManager = new _DiscordManager();
