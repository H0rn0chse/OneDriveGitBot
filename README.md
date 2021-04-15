# OneDriveGitBot

 * [Commands](#commands)
 * [Bot Setup](#bot-setup)
 * [Libraries](#libraries)

This discord bot syncs a OneDrive folder with a git repository. This is useful for projects with users, which don't have a technical background and have issues with using git. The bot is limited to a one directional sync. This limits the use cases: e.g game dev projects, where each artists works on its own artworks and no sync from git to OneDrive is required.

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

The bot is configured via the [config](/config.js) and the local .env. You can find here an example of the required names: [.env.example](/.env.example).

### Discord
The [discord.js guide](https://www.discordjs.guide) contains a very good documentation on [how to create a bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html) and [how to add one to a server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html). It also explains [where to get your token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token) and how to handle it properly.

### Microsoft
Follow the [documentation](https://docs.microsoft.com/en-us/onedrive/developer/rest-api/getting-started/msa-oauth?view=odsp-graph-online) and create your application. You can create a secret/apptoken in the "Certificates & secrets" tab. You can easily fetch your OneDrive folderId from the url parameters when viewing it in the browser. The driveId is typically the part before the `!` or `%21` in the folderId. You can check your íds via the [graph explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) and the GET request `https://graph.microsoft.com/v1.0/drives/<DRIVE_ID>/items/<FOLDER_ID>`.

### Git
Please ensure you use [ssh on your system](https://docs.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account). You might need to change some parts in case you want to use http/ OAuth instead.

## Libraries
 * discord.js: [github.com/discordjs/discord.js](https://github.com/discordjs/discord.js)
 * Simpel Git: [github.com/steveukx/git-js](https://github.com/steveukx/git-js)
 * Simple OAuth2: [github.com/lelylan/simple-oauth2](https://github.com/lelylan/simple-oauth2)
 * onedrive-api: [github.com/dkatavic/onedrive-api](https://github.com/dkatavic/onedrive-api)
 * express: [github.com/expressjs/express](https://github.com/expressjs/express)
 * dotenv: [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv)

