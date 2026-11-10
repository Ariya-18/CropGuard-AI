
const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const GNANI_URL = "https://api.vachana.ai";
const getHeaders = () => ({
  "X-API-Key-ID": process.env.GNANI_API_KEY
});

// Speech to Text
router.post("/stt", upload.single("audio"), async (req, res) => {
  try {
    if (!process.env.GNANI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gnani API key is not configured"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an audio file"
      });
    }

    const languageCode = req.body.languageCode || "ta-IN";

    const form = new FormData();

    form.append("audio_file", req.file.buffer, {
      filename: req.file.originalname || "recording.wav",
      contentType: req.file.mimetype
    });

    form.append("language_code", languageCode);
    form.append("model", "prisma-v3.0");

    const response = await axios.post(
      `${GNANI_URL}/stt/v3`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          ...getHeaders()
        },
        maxBodyLength: Infinity,
        timeout: 60000
      }
    );

    res.json({
      success: true,
      transcript: response.data.transcript,
      detectedLanguage: response.data.detected_language_code || languageCode
    });

  } catch (error) {
    console.error("Gnani STT error:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.detail?.message ||
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Speech recognition failed"
    });
  }
});

// Text to Speech
router.post("/tts", async (req, res) => {
  try {
    if (!process.env.GNANI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gnani API key is not configured"
      });
    }

    const { text, language = "ta-IN" } = req.body;

    if (!text || typeof text !== "string" || text.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Provide valid text (maximum 3000 characters)"
      });
    }

    const response = await axios.post(
      `${GNANI_URL}/api/v1/tts/inference`,
      {
        text,
        voice: "Kaveri",
        model: "timbre-v2.5",
        language,
        speed: 1.0,
        audio_config: {
          encoding: "linear_pcm",
          container: "wav",
          num_channels: 1,
          sample_rate: 48000,
          sample_width: 2
        }
      },
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer",
        timeout: 60000
      }
    );

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", "inline; filename=gnani-speech.wav");

    res.send(Buffer.from(response.data));

  } catch (error) {
    console.error("Gnani TTS error:", error.response?.data || error.message);

    const status = error.response?.status || 500;
    let message = "Text to speech failed";

    if (error.response?.data) {
      try {
        const details = Buffer.isBuffer(error.response.data)
          ? JSON.parse(error.response.data.toString())
          : error.response.data;

        message = details.message ||
          details.error?.message ||
          details.detail?.message ||
          message;
      } catch {
        // Keep the generic message if the response isn't JSON.
      }
    }

    res.status(status).json({
      success: false,
      message
    });
  }
});

module.exports = router;
