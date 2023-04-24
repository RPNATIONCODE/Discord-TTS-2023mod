'use strict';

console.log('Loading libraries...');

const { Routes } = require('discord-api-types/v9');
const { Client, Intents } = require("discord.js");

const { REST } = require('@discordjs/rest');
const { readdirSync } = require('fs');

const { updateStatus } = require('./src/shared/updateStatus.js');
const botToken = process.env.BOT_TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
client.commands = new Map();

const commands = [];
const commandFiles = readdirSync('./src/commands').filter((file) =>
  file.endsWith('.js')
);

// The rest of your code


for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);

  console.log(`Loaded command ${file}!`);
}

client.on('ready', async () => {
  const rest = new REST({ version: '9' }).setToken(botToken);

  await rest
    .put(Routes.applicationCommands(client.user.id), {
      body: commands,
    })
    .then(() => {
      console.log('Ready for action!');
      updateStatus(client);
    })
    .catch(console.error);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction
      .reply('An error occurred while executing the command!')
      .catch(console.error);
  }
});

client.login(botToken).catch(console.error);
