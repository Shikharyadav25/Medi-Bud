import * as Speech from "expo-speech";
import { Platform } from "react-native";

export interface SpeechOptions {
  language?: "en" | "hi";
  rate?: number;
  pitch?: number;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Strips markdown, HTML tags, and card JSON tags so speech synthesis reads clean spoken text.
 */
export function cleanTextForSpeech(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<cards>[\s\S]*?<\/cards>/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~#>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Speaks text using the device's native text-to-speech engine.
 */
export function speakText(
  text: string,
  options: SpeechOptions = {}
): void {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return;

  // Stop any active utterance first
  try {
    Speech.stop();
  } catch {
    // Ignore stop errors on unmounted synthesizer
  }

  const langCode = options.language === "hi" ? "hi-IN" : "en-US";

  Speech.speak(cleaned, {
    language: langCode,
    pitch: options.pitch ?? 1.0,
    rate: options.rate ?? 0.95,
    onDone: options.onDone,
    onStopped: options.onStopped,
    onError: options.onError ? (e) => options.onError!(new Error(String(e))) : undefined,
  });
}

/**
 * Immediately stops any active text-to-speech playback.
 */
export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {
    // Synth was already stopped
  }
}

/**
 * Checks if the speech synthesizer is currently speaking.
 */
export async function isSpeaking(): Promise<boolean> {
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
}

/**
 * Checks if browser Speech Recognition is supported in the current environment.
 */
export function isBrowserSpeechSupported(): boolean {
  if (Platform.OS !== "web") return false;
  if (typeof window === "undefined") return false;
  const win = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export interface WebSpeechSession {
  start: (
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) => void;
  stop: () => void;
}

/**
 * Creates a Web Speech Recognition session for zero-latency browser dictation.
 */
export function createBrowserSpeechRecognition(language: "en" | "hi" = "en"): WebSpeechSession | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;

  const win = window as unknown as {
    SpeechRecognition?: new () => any;
    webkitSpeechRecognition?: new () => any;
  };

  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!SpeechRecognitionClass) return null;

  let recognition: any = null;

  try {
    recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
  } catch {
    return null;
  }

  return {
    start: (onResult, onError, onEnd) => {
      recognition.onresult = (event: any) => {
        let interim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }

        const combined = (finalTranscript || interim).trim();
        if (combined) {
          onResult(combined, Boolean(finalTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        onError(event.error || "Speech recognition error");
      };

      recognition.onend = () => {
        onEnd();
      };

      recognition.start();
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // Recognition already stopped
      }
    },
  };
}
