import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useRef, useState } from "react";
import { Keyboard } from "react-native";

interface UseSpeechRecognitionProps {
    onStart?: () => void;
    onStop?: () => void;
    onError?: (error: Error) => void;
    initialTranscript?: string;
}

export function useSpeechRecognition({
    onStart,
    onStop,
    onError,
    initialTranscript = "",
}: UseSpeechRecognitionProps = {}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // accumulatedTranscript stores text from previous segments (before pause)
    const [accumulatedTranscript, setAccumulatedTranscript] = useState(initialTranscript);
    // currentTranscript stores text from the current active session
    const [currentTranscript, setCurrentTranscript] = useState("");

    const combinedTranscript = (accumulatedTranscript + (accumulatedTranscript && currentTranscript ? " " : "") + currentTranscript).trim();

    useSpeechRecognitionEvent("start", () => {
        setIsRecording(true);
        onStart?.();
    });

    useSpeechRecognitionEvent("end", () => {
        // When the module stops (either manually or error), we are no longer "actively" recording by the module's definition
        // But logically we might be "paused" or "done". 
        // If we initiated a pause, isRecording stays true in our logical state until we stop?
        // Actually, let's track the module state separately if needed, but for now:
        // If we are 'paused', we manually stopped it.
        if (!isPaused) {
            // If we stopped naturally or by done, we can update state
            // But wait, "end" fires even on pause stop.
        }
    });

    useSpeechRecognitionEvent("result", (event) => {
        if (event.results && event.results.length > 0) {
            const result = event.results[0];
            if (event.isFinal) {
                setAccumulatedTranscript(prev => (prev + " " + result.transcript).trim());
                setCurrentTranscript("");
            } else {
                setCurrentTranscript(result.transcript || "");
            }
        }
    });

    useSpeechRecognitionEvent("error", (event) => {
        console.error("Speech error", event);
        if (onError) onError(new Error(String(event.error) || "Speech recognition error"));
        // reset logic?
    });


    // Store the text that was present when recording started, for cancellation
    const startTextRef = useRef("");

    const start = async (startText: string = "") => {
        Keyboard.dismiss();
        startTextRef.current = startText;
        setAccumulatedTranscript(startText);
        setCurrentTranscript("");

        try {
            const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!permission.granted) {
                throw new Error("Microphone permission denied");
            }

            ExpoSpeechRecognitionModule.start({
                lang: "en-US",
                interimResults: true,
                maxAlternatives: 1,
                continuous: true,
                requiresOnDeviceRecognition: false,
                addsPunctuation: true,
            });

            setIsRecording(true);
            setIsPaused(false);
        } catch (e: any) {
            if (onError) onError(e);
            else console.error(e);
            setIsRecording(false);
        }
    };

    const stop = () => {
        try {
            ExpoSpeechRecognitionModule.stop();
            setIsRecording(false);
            setIsPaused(false);

            // Commit current transcript to accumulated (or just rely on combined)
            // Actually when stopping, we usually want to finalize.
            setAccumulatedTranscript(prev => (prev + " " + currentTranscript).trim());
            setCurrentTranscript("");

            onStop?.();
        } catch (e: any) {
            if (onError) onError(e);
        }
    };

    const pause = () => {
        try {
            ExpoSpeechRecognitionModule.stop();
            setIsPaused(true);
            // setIsRecording stays true because we are in "recording mode" just paused? 
            // User requested "pause and resume".

            setAccumulatedTranscript(prev => (prev + " " + currentTranscript).trim());
            setCurrentTranscript("");
        } catch (e: any) {
            if (onError) onError(e);
        }
    };

    const resume = async () => {
        try {
            await ExpoSpeechRecognitionModule.start({
                lang: "en-US",
                interimResults: true,
                maxAlternatives: 1,
                continuous: true,
                requiresOnDeviceRecognition: false,
                addsPunctuation: true,
            });
            setIsPaused(false);
        } catch (e: any) {
            if (onError) onError(e);
        }
    }

    const cancel = () => {
        stop();
        setAccumulatedTranscript(startTextRef.current);
        setCurrentTranscript("");
        setIsRecording(false);
        setIsPaused(false);
    }

    const reset = () => {
        setAccumulatedTranscript("");
        setCurrentTranscript("");
        setIsRecording(false);
        setIsPaused(false);
    }

    const updateTranscript = (text: string) => {
        setAccumulatedTranscript(text);
        setCurrentTranscript("");
    }

    return {
        isRecording, // Implies "Mode is active"
        isPaused,
        isListening: isRecording && !isPaused, // Actually listening
        transcript: combinedTranscript,
        start,
        stop,
        pause,
        resume,
        cancel,
        reset,
        setTranscript: updateTranscript
    };
}
