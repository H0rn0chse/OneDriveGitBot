# OneDriveGitBot

 * [Commands](#commands)
 * [Bot Setup](#bot-setup)

This discord bot syncs a OneDrive folder with a git repository. This is useful for projects with users, which don't have a technical background and have issues with using git. The bot is limited to a one directional sync. This is for example in game dev projects useful, where each artists works on its own pieces and no sync from git to OneDrive is required.

## Commands
The commands need to start with !gj. Due to concurrency issues only one command can run at once.

### addAlert (DM only)
Adds you to the alert notification list. As soon an error is triggered all channels in the list are notified.

### addDebug (channel only)
Adds the channel to the debug notification list. As soon any debug output (log, warning, error) is triggered all channels in the list are notified.

### checkToken (DM only)
Uses the microsoft token by fetching the (toplevel) folders and files of the OneDrive folder.

### removeAlert (DM only)
Removes you from the alert notification list. [see addAlert](#addalert-dm-only)

### removeDebug (channel only)
Removes you from the debug notification list. [see addDebug](#adddebug-channel-only)

### setToken <refresh_token> (DM only)
Sets and refreshes the microsoft token with a refresh_token.

### sync (channel only)
Fetches the current stat of the OneDrive folder and pushes new files into the git repository.

## Bot Setup

 * __How to register and your bot to your server?__<br>
The [discord.js guide](https://www.discordjs.guide) contains a very good documentation on [how to create a bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html) and [how to add one to a server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html). This project uses [dotenv](https://github.com/motdotla/dotenv) for managing secrets locally.
