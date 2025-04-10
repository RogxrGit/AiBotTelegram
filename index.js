require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Configuração do bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const GROUP_ID = process.env.GROUP_ID;
const INTERVALO_MINUTOS = 10;

// Função para buscar e enviar vídeos de Lofi
async function enviarLofiMusic() {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'lofi music',
        type: 'video',
        maxResults: 1,
        order: 'date', // busca os mais recentes
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const video = response.data.items[0];
    const title = video.snippet.title;
    const videoId = video.id.videoId;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    await bot.sendMessage(GROUP_ID, `🎵 *${title}*\n▶️ ${url}`, {
      parse_mode: 'Markdown'
    });

    console.log(`✅ Vídeo postado: ${title}`);

  } catch (error) {
    console.error('❌ Erro ao buscar vídeo:', error.message);
  }
}

// Inicia o intervalo automático
setInterval(enviarLofiMusic, INTERVALO_MINUTOS * 60 * 1000);

// Primeira execução ao iniciar o bot
enviarLofiMusic();
console.log(`🎧 Bot Lofi rodando! Vai sugerir músicas a cada ${INTERVALO_MINUTOS} minutos.`);
