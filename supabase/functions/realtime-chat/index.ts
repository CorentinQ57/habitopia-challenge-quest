
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Requête reçue:", body);

    if (body.type === 'audio') {
      // Extraire le contenu base64 en supprimant le préfixe data:audio/wav;base64,
      const base64Data = body.data.split(',')[1];
      
      // Convertir en texte en utilisant l'API Whisper d'OpenAI
      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: (() => {
          const formData = new FormData();
          // Convertir le base64 en blob
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'audio/wav' });
          formData.append('file', blob, 'audio.wav');
          formData.append('model', 'whisper-1');
          formData.append('language', 'fr');
          return formData;
        })(),
      });

      if (!transcriptionResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const transcriptionData = await transcriptionResponse.json();
      const text = transcriptionData.text;
      console.log("Transcribed text:", text);

      // Une fois le texte obtenu, on l'envoie au modèle GPT
      const conversationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant qui aide à gérer les habitudes et notes. Tu peux créer, modifier ou supprimer des habitudes, et ajouter des notes.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!conversationResponse.ok) {
        throw new Error('OpenAI chat API error');
      }

      const conversationData = await conversationResponse.json();
      return new Response(
        JSON.stringify({
          type: 'assistant_message',
          content: conversationData.choices[0].message.content
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
