"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

export default function VoiceNavigator() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Listen and stop after speaking
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // Set to Indian English for better accent recognition

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Listening for commands...");
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript.toLowerCase();
      setTranscript(`"${result}"`);
      handleVoiceCommand(result);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      setTranscript("Error understanding. Try again.");
      setTimeout(() => setTranscript(""), 2000);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => setTranscript(""), 2500);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleVoiceCommand = (command: string) => {
    // Map keywords and conversational phrases to routes
    if (command.includes("dashboard") || command.includes("profile") || command.includes("my account")) {
      window.location.href = "/dashboard";
    } else if (command.includes("symptom") || command.includes("sick") || command.includes("triage") || command.includes("pain") || command.includes("not feeling well")) {
      window.location.href = "/symptoms";
    } else if (command.includes("plan") || command.includes("diet") || command.includes("food") || command.includes("workout") || command.includes("meal")) {
      window.location.href = "/plan";
    } else if (command.includes("chat") || command.includes("talk") || command.includes("companion") || command.includes("medi bud") || command.includes("medibud")) {
      window.location.href = "/chat";
    } else if (command.includes("home") || command.includes("start")) {
      window.location.href = "/";
    } else {
      setTranscript(`Sorry, couldn't find a page for "${command}"`);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn("Recognition already started");
      }
    }
  };

  if (!supported) return null;

  return (
    <>
      <style>{`
        .voice-nav-wrapper {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .voice-nav-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(124,58,237,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .voice-nav-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 10px 40px rgba(124,58,237,0.6);
        }

        .voice-nav-btn.listening {
          background: linear-gradient(135deg, #e879a0, #f43f5e);
          box-shadow: 0 0 0 0 rgba(232,121,160,0.7);
          animation: pulse-red 1.5s infinite;
        }

        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 16px rgba(244, 63, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }

        .voice-transcript {
          background: rgba(13, 13, 26, 0.9);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 12px;
          padding: 8px 16px;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 0.85rem;
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          backdrop-filter: blur(10px);
          animation: fade-in 0.3s ease;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div className="voice-nav-wrapper">
        {transcript && (
          <div className="voice-transcript">
            {transcript}
          </div>
        )}
        <button 
          className={`voice-nav-btn ${isListening ? "listening" : ""}`}
          onClick={toggleListen}
          aria-label={isListening ? "Stop listening" : "Start Voice Navigation"}
          title="Voice Navigator"
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
      </div>
    </>
  );
}
