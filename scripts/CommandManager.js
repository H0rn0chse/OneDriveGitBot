class _CommandManager {
    constructor () {
        // tbd
    }

    execCommand (discordMessage, command, args) {
        console.log(`command: ${command}, args: ${JSON.stringify(args)}`)
    }
}

export const CommandManager = new _CommandManager();
