require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const GROUP_ID = process.env.GROUP_ID;
const INTERVALO_MINUTOS = 10;

const videosEnviados = new Set();

async function enviarLofiMusic() {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'lofi music',
        type: 'video',
        maxResults: 5,
        order: 'date',
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const videos = response.data.items;
    const novoVideo = videos.find(v => !videosEnviados.has(v.id.videoId));

    if (!novoVideo) {
      console.log('⚠️ Nenhum vídeo novo encontrado no momento.');
      return;
    }

    const { title, thumbnails } = novoVideo.snippet;
    const videoId = novoVideo.id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbUrl = thumbnails.high.url;

    await bot.sendPhoto(GROUP_ID, thumbUrl, {
      caption: `🎵 <b>${title}</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '▶️ Assistir no YouTube', url: videoUrl }
          ]
        ]
      }
    });

    videosEnviados.add(videoId);
    console.log(`✅ Vídeo postado: ${title}`);

  } catch (error) {
    console.error('❌ Erro ao buscar vídeo:', error.message);
  }
}

// Executar e agendar
enviarLofiMusic();
setInterval(enviarLofiMusic, INTERVALO_MINUTOS * 60 * 1000);
console.log(`🎧 Bot Lofi ativo! Postando a cada ${INTERVALO_MINUTOS} minutos.`);
