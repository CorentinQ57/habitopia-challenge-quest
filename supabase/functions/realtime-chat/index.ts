
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      console.log("Client connected");
    };

    socket.onclose = () => {
      console.log("Client disconnected");
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        if (message.type === 'audio') {
          // Extraire le contenu base64 en supprimant le préfixe data:audio/wav;base64,
          const base64Data = message.data.split(',')[1];
          
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
              model: 'gpt-4o-mini',
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
          socket.send(JSON.stringify({
            type: 'assistant_message',
            content: conversationData.choices[0].message.content
          }));
        } else if (message.type === 'text') {
          // Si c'est du texte, on l'envoie directement au modèle GPT
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'Tu es un assistant qui aide à gérer les habitudes et notes. Tu peux créer, modifier ou supprimer des habitudes, et ajouter des notes.'
                },
                {
                  role: 'user',
                  content: message.text
                }
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });

          if (!response.ok) {
            throw new Error('OpenAI chat API error');
          }

          const data = await response.json();
          socket.send(JSON.stringify({
            type: 'assistant_message',
            content: data.choices[0].message.content
          }));
        }

      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          content: error.message
        }));
      }
    };

    return response;
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
    return new Response(error.message, { status: 500 });
  }
});
