require('dotenv').config()

const ffmpeg = require('ffmpeg-static');
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot está online!");
});

app.listen(process.env.PORT || 3000);

const { 
  Client, 
  GatewayIntentBits 
} = require('discord.js')

const cron = require('node-cron')

const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus,
  getVoiceConnection
} = require('@discordjs/voice')

const config = require('./config.json')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
})

/* =========================
   FUNÇÃO PRINCIPAL DE ALERTA
========================= */

async function sendAlert(message, soundFile) {

  const guild = client.guilds.cache.get(config.guildId)
  if (!guild) return console.log("❌ Guild não encontrada")

  const channel = guild.channels.cache.get(config.textChannelId)
  if (!channel) return console.log("❌ Canal não encontrado")

  const role = guild.roles.cache.get(config.roleId)
  if (!role) return console.log("❌ Cargo não encontrado")

  await channel.send(`<@&${config.roleId}> ${message}`)

  const memberInVoice = role.members.find(m => m.voice.channel)

  if (!memberInVoice) {
    console.log("⚠️ Nenhum membro com cargo está na call.")
    return
  }

  console.log("🔊 Tocando áudio na call:", memberInVoice.voice.channel.name)

  const connection = joinVoiceChannel({
    channelId: memberInVoice.voice.channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  })

  const player = createAudioPlayer()
  const resource = createAudioResource(`./sounds/${soundFile}`)

  player.play(resource)
  connection.subscribe(player)

  // 🔥 Limite individual de 30 segundos
  const timeout = setTimeout(() => {
    console.log("⏹ Parando áudio por limite de 30s")
    player.stop()
  }, 30000)

  player.on(AudioPlayerStatus.Idle, () => {
    clearTimeout(timeout)
    connection.destroy()
  })
}

/* =========================
   BOT ONLINE
========================= */

client.once('clientReady', async () => {
  console.log(`✅ Bot online como ${client.user.tag}`)
  console.log("📌 Servidores:", client.guilds.cache.map(g => g.id))

  /* =========================
     AGENDAMENTOS
  ========================= */

  cron.schedule('0 0 22 * * *', () => {
    sendAlert("🦖 Voce gosta do som do seu animal favorito?? 🦖", "1hora.mp3")
  }, { timezone: "America/Sao_Paulo" })

  cron.schedule('0 30 22 * * *', () => {
    sendAlert("🫦 Gostei de ver voce apanhar, voce gosta disso ne magao?? seu danado 🫦", "30min.mp3")
  }, { timezone: "America/Sao_Paulo" })

  cron.schedule('0 50 22 * * *', () => {
    sendAlert("🍆💦🫃 Voce não foi um bom garoto? então toma 🍆💦🫃", "10min.mp3")
  }, { timezone: "America/Sao_Paulo" })

  cron.schedule('30 59 22 * * *', () => {
    sendAlert("⚡ Sinta a Força de Aceleração ⚡", "30secs.mp3")
  }, { timezone: "America/Sao_Paulo" })

})

/* =========================
   SLASH COMMANDS
========================= */

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return

  /* ========= /teste ========= */

  if (interaction.commandName === 'teste') {

    const tipo = interaction.options.getString('tipo')

    await interaction.reply({
      content: `🧪 Executando teste: ${tipo}`,
      ephemeral: true
    })

    if (tipo === '1hora')
      sendAlert("🔔 TESTE 1 HORA", "1hora.mp3")

    if (tipo === '30min')
      sendAlert("🔔 TESTE 30 MIN", "30min.mp3")

    if (tipo === '10min')
      sendAlert("🔔 TESTE 10 MIN", "10min.mp3")

    if (tipo === '30secs')
      sendAlert("🔔 TESTE 30 SEGUNDOS", "30secs.mp3")
  }

  /* ========= /sair ========= */

  if (interaction.commandName === 'sair') {

    const connection = getVoiceConnection(config.guildId)

    if (!connection) {
      return await interaction.reply({
        content: "⚠️ Eu não estou em nenhuma call.",
        ephemeral: true
      })
    }

    connection.destroy()

    await interaction.reply({
      content: "👋 Saí da call com sucesso.",
      ephemeral: true
    })
  }

})

client.login(process.env.TOKEN)