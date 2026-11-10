
import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Languages,
  Trash2,
} from "lucide-react";
import "./VoiceAssistant.css";

const API = "http://localhost:5000/api/gnani";

const responses = [
  {
    keywords: ["crop", "health", "healthy", "ndvi", "பயிர்", "ஆரோக்கியம்"],
    answer:
      "Crop health monitoring helps identify vegetation stress. Check the Crop Intelligence section for available satellite observations. பயிரின் ஆரோக்கியத்தை அறிய செயற்கைக்கோள் கண்காணிப்பு உதவுகிறது.",
  },
  {
    keywords: ["damage", "flood", "drought", "disaster", "வெள்ளம்", "வறட்சி", "பாதிப்பு"],
    answer:
      "If your farm is affected by a disaster, register the affected area and provide supporting photographs. Satellite observations can provide preliminary evidence. உங்கள் பயிர் பாதிக்கப்பட்டிருந்தால் பாதிக்கப்பட்ட பகுதியை பதிவு செய்யுங்கள்.",
  },
  {
    keywords: ["insurance", "claim", "payment", "காப்பீடு", "உரிமை"],
    answer:
      "You can submit an insurance claim through the Insurance Claims section. Your claim requires verification by the insurance officer. Approval and payment are not automatic.",
  },
  {
    keywords: ["register", "farm", "add farm", "பண்ணை", "பதிவு"],
    answer:
      "To register your farm, open Farm Registration and enter your farm location, crop type, and cultivated area.",
  },
  {
    keywords: ["satellite", "monitor", "image", "செயற்கைக்கோள்"],
    answer:
      "CropGuard uses satellite observations to monitor changes in crop conditions. Image availability depends on observation dates and cloud conditions.",
  },
];

function getAnswer(question) {
  const text = question.toLowerCase();

  const match = responses.find(item =>
    item.keywords.some(keyword => text.includes(keyword))
  );

  return match
    ? match.answer
    : "Welcome to CropGuard AI. I can help you with crop health, satellite monitoring, disaster damage, farm registration and insurance claims. Please ask your question.";
}

export default function VoiceAssistant() {
  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! Welcome to CropGuard AI. How can I help you with your farm today?",
    },
  ]);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setRecordingSupported(
      Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)
    );

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role, text) => {
    setMessages(previous => [...previous, { role, text }]);
  };

  // Gnani Text-to-Speech
  const speak = async text => {
    try {
      setError("");
      setSpeaking(true);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const response = await fetch(`${API}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Gnani speech generation failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setSpeaking(false);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setSpeaking(false);
        setError("Unable to play generated audio.");
      };

      await audio.play();
    } catch (err) {
      console.error("Gnani TTS:", err);
      setError(err.message || "Text-to-speech failed.");
      setSpeaking(false);
    }
  };

  // CropGuard answer generation (currently rule-based)
  const handleQuestion = async question => {
    if (!question.trim()) return;

    addMessage("user", question);

    const answer = getAnswer(question);
    addMessage("assistant", answer);

    await speak(answer);
  };

  // Gnani Speech-to-Text
  const processRecording = async blob => {
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("audio", blob, "recording.webm");
      formData.append("languageCode", language);

      const response = await fetch(`${API}/stt`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Speech recognition failed");
      }

      if (!data.transcript?.trim()) {
        throw new Error("No speech was recognised. Please try again.");
      }

      await handleQuestion(data.transcript);
    } catch (err) {
      console.error("Gnani STT:", err);
      setError(err.message || "Speech recognition failed.");
    } finally {
      setLoading(false);
    }
  };

  const startListening = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        if (blob.size > 0) {
          await processRecording(blob);
        }
      };

      recorder.start();
      setListening(true);
    } catch (err) {
      console.error(err);
      setError("Microphone access failed. Please allow microphone permission.");
      setListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setListening(false);
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setSpeaking(false);
  };

  const clearChat = () => {
    stopSpeaking();
    setError("");

    setMessages([
      {
        role: "assistant",
        text: "Hello! Welcome to CropGuard AI. How can I help you with your farm today?",
      },
    ]);
  };

  return (
    <div className="voice-page">
      <div className="voice-header">
        <div>
          <span className="voice-eyebrow">SMART FARMING ASSISTANT</span>
          <h1>Voice Assistant</h1>
          <p>Talk naturally with your CropGuard AI farming assistant.</p>
        </div>

        <div className="voice-language">
          <Languages size={18} />
          <select
            value={language}
            onChange={event => setLanguage(event.target.value)}
            disabled={listening || loading}
          >
            <option value="en-IN">English</option>
            <option value="ta-IN">தமிழ்</option>
          </select>
        </div>
      </div>

      <div className="voice-status-card">
        <div className={`voice-avatar ${listening ? "active" : ""}`}>
          <Bot size={42} />
          {listening && <span className="voice-pulse" />}
        </div>

        <h2>
          {listening
            ? "Listening to you..."
            : loading
            ? "Processing your question..."
            : speaking
            ? "Speaking..."
            : "How can I help you?"}
        </h2>

        <p>
          {recordingSupported
            ? "Ask your farming question in Tamil or English."
            : "Microphone recording is not supported in this browser."}
        </p>

        <div className="voice-controls">
          <button
            className={`mic-button ${listening ? "recording" : ""}`}
            onClick={listening ? stopListening : startListening}
            disabled={!recordingSupported || loading}
            title={listening ? "Stop recording" : "Start recording"}
          >
            {listening ? <MicOff size={25} /> : <Mic size={25} />}
          </button>

          <button
            className="voice-secondary-button"
            onClick={stopSpeaking}
            title="Stop speech"
          >
            <VolumeX size={20} />
          </button>
        </div>

        <span className="voice-hint">
          {listening
            ? "Speak now, then tap the microphone to finish."
            : loading
            ? "Please wait..."
            : "Powered by Gnani voice services"}
        </span>

        {error && <p className="voice-error">{error}</p>}
      </div>

      <div className="voice-chat-card">
        <div className="voice-chat-heading">
          <div>
            <h3>Conversation</h3>
            <span>Ask about your farm</span>
          </div>

          <button onClick={clearChat} className="clear-chat">
            <Trash2 size={16} />
            Clear
          </button>
        </div>

        <div className="voice-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`voice-message ${
                message.role === "user" ? "user-message" : ""
              }`}
            >
              <div className="message-avatar">
                {message.role === "user" ? (
                  <User size={17} />
                ) : (
                  <Bot size={17} />
                )}
              </div>

              <div className="message-content">
                <span>
                  {message.role === "user" ? "You" : "CropGuard AI"}
                </span>
                <p>{message.text}</p>

                {message.role === "assistant" && (
                  <button
                    className="message-speak"
                    onClick={() => speak(message.text)}
                    title="Read aloud"
                  >
                    <Volume2 size={15} />
                    Listen
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          className="voice-text-form"
          onSubmit={async event => {
            event.preventDefault();

            const input = event.currentTarget.elements.question;
            const question = input.value.trim();

            if (!question) return;

            input.value = "";
            await handleQuestion(question);
          }}
        >
          <input
            name="question"
            placeholder="Type your farming question..."
            autoComplete="off"
          />
          <button type="submit" disabled={speaking || loading}>
            Send
          </button>
        </form>
      </div>

      <div className="voice-disclaimer">
        <Bot size={17} />
        <p>
          Gnani AI provides speech recognition and voice generation.
          CropGuard answers are currently generated using predefined
          farming guidance and are not professional agricultural advice.
        </p>
      </div>
    </div>
  );
}
