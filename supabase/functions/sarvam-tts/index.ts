// Supabase Edge Function: sarvam-tts
// Sarvam AI TTS with bulbul:v2 model and manisha speaker

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SARVAM_API_KEY = Deno.env.get("SARVAM_API_KEY");

// Sarvam TTS Configuration
const SARVAM_CONFIG = {
    model: "bulbul:v2",
    speakers: {
        malayalam: "manisha",
        english: "manisha",
    },
    settings: {
        pitch: 0,
        pace: 1,
        loudness: 1.5,
        speechSampleRate: 22050,
        enablePreprocessing: true,
    }
};

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { text, language = "en-IN" } = await req.json();

        if (!text || text.trim().length === 0) {
            throw new Error("Text is required");
        }

        if (!SARVAM_API_KEY) {
            throw new Error("SARVAM_API_KEY not configured");
        }

        // Map language codes to Sarvam format
        const targetLanguageCode = language === 'ml' || language === 'ml-IN'
            ? 'ml-IN'
            : 'en-IN';

        // Select appropriate speaker
        const speaker = targetLanguageCode === 'ml-IN'
            ? SARVAM_CONFIG.speakers.malayalam
            : SARVAM_CONFIG.speakers.english;

        // Call Sarvam API
        const response = await fetch("https://api.sarvam.ai/text-to-speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "API-Subscription-Key": SARVAM_API_KEY,
            },
            body: JSON.stringify({
                inputs: [text],
                target_language_code: targetLanguageCode,
                speaker: speaker,
                pitch: SARVAM_CONFIG.settings.pitch,
                pace: SARVAM_CONFIG.settings.pace,
                loudness: SARVAM_CONFIG.settings.loudness,
                speech_sample_rate: SARVAM_CONFIG.settings.speechSampleRate,
                enable_preprocessing: SARVAM_CONFIG.settings.enablePreprocessing,
                model: SARVAM_CONFIG.model,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Sarvam API error:", response.status, errorText);
            throw new Error(`Sarvam API error: ${response.status}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify({
            audio: data.audios[0],
            format: "wav",
            speaker: speaker,
            language: targetLanguageCode,
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Sarvam TTS error:", error);
        return new Response(JSON.stringify({
            error: "TTS generation failed",
            details: error.message,
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
