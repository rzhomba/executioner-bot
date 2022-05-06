# Executioner Bot

A simple bot designated specially for doing little, fun and harmless cyberbullying on my discord server :)
*P.S. No one was offended.*

## Configuration

Create a `.env` file:

````dotenv
TOKEN=[BOT_TOKEN_HERE]
CLIENT_ID=[CLIENT_ID_HERE]
GUILD_ID=[GUILD_ID_HERE]
# role id (optional)
ROLE_ID=[ROLE_ID_HERE]
````

`ROLE_ID` contains the id of the role that has access to use this bot. Also, it may be not specified, if you don't want
to restrict usage of the bot to a certain role.

If you want to configure this bot, edit the `config.json` file. Default configuration:

````json
{
  "execution": {
    "totalDuration": 30,
    "muteDuration": 3,
    "muteTimeout": 1
  },
  "deportation": {
    "moveCount": 10,
    "moveTimeout": 0.75
  }
}
````

## Starting the Bot

### Requirements

* [Node.js](https://nodejs.org/) 16.9.0 or newer
* [Discord](https://discord.com/)

0. Go to [Discord application page](https://discord.com/developers/applications) and create a bot, then invite it to
   your server
1. Clone this repository locally
2. Run `npm install`
3. Create the `.env` file and configure the bot
4. Run `node deploy-commands.js` (only once when deploying)
5. Run `node bot.js`

## Commands

| Name                        | Description                                                    |
|-----------------------------|:---------------------------------------------------------------|
| `/execution start <user>`   | Starts muting and unmuting specified user for a period of time |
| `/execution stop <user>`    | Stops the execution on specified user                          |
| `/execution stopall`        | Stops the execution on all users                               |
| `/execution list`           | Displays all users under execution                             |
| `/deportation start <user>` | Starts moving specified users between server's voice channels  |
| `/deportation clear`        | Stops the deportation of all users                             |

## License

This project is MIT licensed.