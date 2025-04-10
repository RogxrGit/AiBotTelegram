require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const GROUP_ID = process.env.GROUP_ID;
const INTERVALO_MINUTOS = 5;

// Função para converter duração ISO8601 para segundos
function durationToSeconds(iso) {
  const match = iso.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  const minutes = parseInt(match?.[1] || 0);
  const seconds = parseInt(match?.[2] || 0);
  return minutes * 60 + seconds;
}

async function buscarMusicaValida() {
  try {
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'lofi hip-hop chill study ',
        type: 'video',
        maxResults: 50,
        order: 'date',
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const videos = searchResponse.data.items;

    for (const video of videos) {
      const videoId = video.id.videoId;

      const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails',
          id: videoId,
          key: process.env.YOUTUBE_API_KEY
        }
      });

      const duration = detailsResponse.data.items[0]?.contentDetails?.duration;
      const durationSeconds = durationToSeconds(duration);

      if (durationSeconds >= 60) {
        return {
          title: video.snippet.title,
          videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: video.snippet.thumbnails.high.url
        };
      }
    }

    return null;

  } catch (error) {
    console.error('❌ Erro ao buscar música:', error.message);
    return null;
  }
}

async function enviarMusica() {
  const musica = await buscarMusicaValida();

  if (!musica) {
    console.log('⚠️ Nenhuma música válida encontrada.');
    return;
  }

  const mensagem = `🎵 <b>${musica.title}</b>\n\n▶️ <a href="${musica.url}">Assistir no YouTube</a>`;

  await bot.sendMessage(GROUP_ID, mensagem, {
    parse_mode: 'HTML',
    disable_web_page_preview: false,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '▶️ Assistir no YouTube', url: musica.url }
        ]
      ]
    }
  });

  console.log(`✅ Música enviada: ${musica.title}`);
}

// Executa ao iniciar e a cada X minutos
enviarMusica();
setInterval(enviarMusica, INTERVALO_MINUTOS * 60 * 1000);
console.log(`🎧 Bot Lofi ativo! Postando a cada ${INTERVALO_MINUTOS} minutos.`);
