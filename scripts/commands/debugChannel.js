import { DiscordManager } from "../DiscordManager.js";

export async function addDebug (discordMessage) {
    if (!Array.isArray(this.config.debugChannels)) {
        this.config.debugChannels = [];
    }

    this.config.debugChannels.push(discordMessage.channel.id);
    await this.saveConfig();
}

export async function removeDebug (discordMessage) {
    if (!Array.isArray(this.config.debugChannels)) {
        return;
    }
    const index = this.config.debugChannels.findIndex((channel) => {
        return channel === discordMessage.channel.id;
    });
    if (index > -1) {
        this.config.debugChannels.splice(index, 1);
    }
    await this.saveConfig();
}

export async function sendDebug (msg) {
    if (!Array.isArray(this.config.debugChannels)) {
        return;
    }
    this.config.debugChannels.forEach((channel) => {
        DiscordManager.send(channel, msg);
    });
}

