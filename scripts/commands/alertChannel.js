import { DiscordManager } from "../DiscordManager.js";

export async function addAlert (discordMessage) {
    const channelId = discordMessage.channel.id;
    if (!Array.isArray(this.config.alertChannels)) {
        this.config.alertChannels = [];
    }

    if (!this.config.alertChannels.includes(channelId)) {
        this.config.alertChannels.push(channelId);
    }
    await this.saveConfig();
}

export async function removeAlert (discordMessage) {
    const channelId = discordMessage.channel.id;
    if (!Array.isArray(this.config.alertChannels)) {
        return;
    }
    const index = this.config.alertChannels.findIndex((channel) => {
        return channel === channelId;
    });
    if (index > -1) {
        this.config.alertChannels.splice(index, 1);
    }
    await this.saveConfig();
}

export async function sendAlert (msg) {
    if (!Array.isArray(this.config.alertChannels)) {
        return;
    }
    this.config.alertChannels.forEach((channel) => {
        DiscordManager.send(channel, msg);
    });
}