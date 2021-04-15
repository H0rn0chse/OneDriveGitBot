import { DiscordManager } from "../DiscordManager.js";

export async function addDebug (discordMessage) {
    const channelId = discordMessage.channel.id;
    if (!Array.isArray(this.config.debugChannels)) {
        this.config.debugChannels = [];
    }

    if (!this.config.debugChannels.includes(channelId)) {
        this.config.debugChannels.push(discordMessage.channel.id);
    }
    await this.saveConfig();
}

export async function removeDebug (discordMessage) {
    const channelId = discordMessage.channel.id;
    if (!Array.isArray(this.config.debugChannels)) {
        return;
    }
    const index = this.config.debugChannels.findIndex((channel) => {
        return channel === channelId;
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

