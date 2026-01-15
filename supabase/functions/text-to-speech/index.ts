// Supabase Edge Function: text-to-speech
// OpenAI TTS fallback when Sarvam fails

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

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
        const { text, voice = "alloy" } = await req.json();

        if (!text || text.trim().length === 0) {
            throw new Error("Text is required");
        }

        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY not configured");
        }

        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "tts-1",
                input: text,
                voice: voice,
                response_format: "mp3",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI TTS error:", response.status, errorText);
            throw new Error(`OpenAI TTS error: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

        return new Response(JSON.stringify({
            audio: base64Audio,
            format: "mp3",
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("OpenAI TTS error:", error);
        return new Response(JSON.stringify({
            error: "TTS generation failed",
            details: error.message,
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
