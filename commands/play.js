const yts = require("yt-search")
const axios = require("axios")

async function playCommand(sock, chatId, message) {
  try {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text
    const searchQuery = text.split(" ").slice(1).join(" ").trim()

    if (!searchQuery) {
      return await sock.sendMessage(chatId, {
        text: "🤖𝗪𝗵𝗮𝘁 𝗦𝗼𝗻𝗴 𝗗𝗼 𝗬𝗼𝘂 𝗪𝗮𝗻𝗻𝗮 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 📥 [𝗲.𝗴 𝗽𝗹𝗮𝘆 𝗳𝗮𝗱𝗲𝗱]?",
      })
    }

    // Search for the song
    const { videos } = await yts(searchQuery)
    if (!videos || videos.length === 0) {
      return await sock.sendMessage(chatId, {
        text: "No songs found!",
      })
    }

    // Send loading message
    await sock.sendMessage(chatId, {
      text: "_Please wait your download is in progress_",
    })

    // Get the first video result
    const video = videos[0]
    const urlYt = video.url

    const apiEndpoints = [
      `https://api.davidcyriltech.my.id/youtube/mp3?url=${urlYt}`,
      `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${urlYt}`,
      `https://api.giftedtech.co.ke/api/download/ytmp3?apikey=gifted&url=${urlYt}`,
    ]

    let audioUrl = null
    let title = video.title

    // Try multiple APIs for better reliability
    for (const endpoint of apiEndpoints) {
      try {
        const response = await axios.get(endpoint, { timeout: 15000 })
        const data = response.data

        if (data && data.status && data.result && data.result.downloadUrl) {
          audioUrl = data.result.downloadUrl
          title = data.result.title || title
          break
        } else if (data && data.status && data.download) {
          audioUrl = data.download
          break
        } else if (data && data.result && data.result.url) {
          audioUrl = data.result.url
          break
        }
      } catch (error) {
        console.log(`API ${endpoint} failed, trying next...`)
        continue
      }
    }

    if (!audioUrl) {
      return await sock.sendMessage(chatId, {
        text: "Failed to fetch audio from all APIs. Please try again later.",
      })
    }

    // Send the audio
    await sock.sendMessage(
      chatId,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
      },
      { quoted: message },
    )
  } catch (error) {
    console.error("Error in play command:", error)
    await sock.sendMessage(chatId, {
      text: "*Download failed. Please try again later.*",
    })
  }
}

module.exports = playCommand
