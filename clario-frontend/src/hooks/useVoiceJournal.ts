import { useState, useRef, useEffect, useCallback } from "react";
import { MediaHandler, GeminiClient } from "../lib/gemini";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { startVoiceSession, generateSessionReport, SessionDetailData } from "../lib/api";
import {
  preferredLanguageGreetingPrefix,
  type SessionLanguage,
} from "../lib/sessionLanguage";

export function useVoiceJournal() {
  const { displayName } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const mediaHandlerRef = useRef<MediaHandler | null>(null);
  const geminiClientRef = useRef<GeminiClient | null>(null);
  const voiceSessionIdRef = useRef<string | null>(null);
  const greetingRef = useRef<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<SessionDetailData | null>(null);

  const clearReport = useCallback(() => setReportData(null), []);

  // Initialize once
  useEffect(() => {
    mediaHandlerRef.current = new MediaHandler();
    geminiClientRef.current = new GeminiClient({
      onOpen: () => {
        setIsConnected(true);
        geminiClientRef.current?.sendConfig({
          session_id: voiceSessionIdRef.current,
          testProfile: "debug-agent-metadata-001",
          clientBuild: "voice-journal",
        });
        if (greetingRef.current) {
          geminiClientRef.current?.sendText(
            `System: ${greetingRef.current}`,
            { persist: false }
          );
        }
      },
      onMessage: (event) => {
        if (typeof event.data === "string") {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "interrupted") {
              mediaHandlerRef.current?.stopAudioPlayback();
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        } else {
          // It's binary audio data sent from Gemini
          mediaHandlerRef.current?.playAudio(event.data);
        }
      },
      onClose: () => {
        setIsConnected(false);
        setIsRecording(false);
        setIsConnecting(false);
      },
      onError: () => {
        toast.error("Connection failed. Are the backend services running?");
        setIsConnected(false);
        setIsRecording(false);
        setIsConnecting(false);
      },
    });

    return () => {
      geminiClientRef.current?.disconnect();
      mediaHandlerRef.current?.stopAudio();
    };
  }, []);

  const startSession = useCallback(
    async (
      persona?: string,
      voice?: string,
      greeting?: string,
      language: SessionLanguage = "en",
    ) => {
      if (!mediaHandlerRef.current || !geminiClientRef.current) return;
      const prefix = preferredLanguageGreetingPrefix(language);
      greetingRef.current = greeting ? `${prefix}${greeting}` : null;

      try {
        setIsConnecting(true);
        const { session_id } = await startVoiceSession();
        voiceSessionIdRef.current = session_id;

        await mediaHandlerRef.current.initializeAudio();
        geminiClientRef.current.connect(undefined, voice, persona, language, displayName ?? undefined);

        await mediaHandlerRef.current.startAudio((data) => {
          if (geminiClientRef.current?.isConnected()) {
            geminiClientRef.current.send(data);
          }
        });
        setIsRecording(true);
        setIsConnecting(false);
      } catch (e) {
        voiceSessionIdRef.current = null;
        const message =
          e instanceof Error ? e.message : "Could not start voice session.";
        toast.error(message);
        setIsRecording(false);
        setIsConnecting(false);
      }
    },
    [],
  );

  const endSession = useCallback(async () => {
    const sessionId = voiceSessionIdRef.current;
    voiceSessionIdRef.current = null;

    if (mediaHandlerRef.current) {
      mediaHandlerRef.current.stopAudio();
      mediaHandlerRef.current.stopAudioPlayback();
    }
    if (geminiClientRef.current) {
      geminiClientRef.current.disconnect();
    }

    setIsRecording(false);
    setIsConnected(false);
    setIsConnecting(false);
    setIsMuted(false);

    if (sessionId) {
      try {
        setIsGeneratingReport(true);
        // Give the backend a few seconds to finish saving the conversation
        await new Promise((resolve) => setTimeout(resolve, 7000));
        const data = await generateSessionReport(sessionId);
        setReportData(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to generate report.";
        toast.error(message);
      } finally {
        setIsGeneratingReport(false);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev;
      if (mediaHandlerRef.current) {
        mediaHandlerRef.current.setMuted(newState);
      }
      return newState;
    });
  }, []);

  return {
    isRecording,
    isConnected,
    isConnecting,
    isMuted,
    isGeneratingReport,
    reportData,
    startSession,
    endSession,
    toggleMute,
    clearReport,
  };
}
