require('dotenv').config()

const { 
  REST, 
  Routes, 
  SlashCommandBuilder 
} = require('discord.js')

const config = require('./config.json')

/* =========================
   DEFINIÇÃO DOS COMANDOS
========================= */

const commands = [

  new SlashCommandBuilder()
    .setName('teste')
    .setDescription('Testa os alertas do bot')
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Qual alerta deseja testar?')
        .setRequired(true)
        .addChoices(
          { name: '1 Hora', value: '1hora' },
          { name: '30 Minutos', value: '30min' },
          { name: '10 Minutos', value: '10min' },
          { name: '30 Segundos', value: '30secs' }
        )
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('sair')
    .setDescription('Faz o bot sair da call')
    .toJSON()

]

/* =========================
   CONFIGURAÇÃO DA API
========================= */

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

/* =========================
   DEPLOY
========================= */

async function deploy() {
  try {

    console.log('🚀 Iniciando deploy dos comandos...')

    if (!process.env.CLIENT_ID) {
      throw new Error("CLIENT_ID não encontrado no .env")
    }

    if (!config.guildId) {
      throw new Error("guildId não encontrado no config.json")
    }

    // 🔥 Atualiza (e substitui) todos os comandos da guild
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        config.guildId
      ),
      { body: commands }
    )

    console.log('✅ Comandos registrados com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao registrar comandos:')
    console.error(error)
  }
}

deploy()