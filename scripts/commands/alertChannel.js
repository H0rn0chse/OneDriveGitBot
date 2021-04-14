import { DiscordManager } from "../DiscordManager.js";

export async function addAlert (discordMessage) {
    if (!Array.isArray(this.config.alertChannels)) {
        this.config.alertChannels = [];
    }

    this.config.alertChannels.push(discordMessage.channel.id);
    await this.saveConfig();
}

export async function removeAlert (discordMessage) {
    if (!Array.isArray(this.config.alertChannels)) {
        return;
    }
    const index = this.config.alertChannels.findIndex((channel) => {
        return channel === discordMessage.channel.id;
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