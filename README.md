# Executioner Bot

A simple bot designated specially for doing little, fun and harmless cyberbullying on my discord server :)

## Configuration

You may want to configure this bot. If so, then edit the `config.json` file. Default configuration:

````json
{
  "checkRole": "true",
  "execution": {
    "totalDuration": 30,
    "muteDuration": 3,
    "muteTimeout": 1
  }
}
````

Create a `.env` file:

````dotenv
TOKEN=[BOT_TOKEN_HERE]
CLIENT_ID=[CLIENT_ID_HERE]
GUILD_ID=[GUILD_ID_HERE]
ROLE_ID=[ROLE_ID_HERE]
````

`ROLE_ID` contains the id of the role that has access to use this bot. Also, it may be null, if in `config.json` file
`checkRole` will be `false`. In that case `ROLE_ID` variable in `.env` file may be null.

## Starting the Bot

### Requirements

* [Node.js](https://nodejs.org/) 16.9.0 or newer
* [Discord](https://discord.com/)

0. Go to [Discord application page](https://discord.com/developers/applications) and create a bot
1. Clone this repository locally
2. Run `npm install`
3. Create the `.env` file and configure the bot
4. Run `node deploy-commands.js` (only once when deploying)
5. Run `node index.js`

## Commands

| Name                      | Description                             |
|---------------------------|:----------------------------------------|
| `/execution start <user>` | Starts the execution on specified user  |
| `/execution stop <user>`  | Stops the execution                     |
| `/execution stopall`      | Stops execution on all users            |
| `/execution list`         | Displays all users under punishment     |

## License

This project is MIT licensed.