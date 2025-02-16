
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      const text = await req.text();
      console.log("Raw request body text:", text);
      requestBody = JSON.parse(text.trim()); // Ajout de trim() pour supprimer les espaces
      console.log("Parsed request body:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: `Invalid JSON: ${parseError.message}` }),
        { 
          headers: corsHeaders,
          status: 400
        }
      );
    }

    // Extraire le user_id du token d'autorisation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Non authentifié');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    let userMessage = '';

    if (requestBody.type === 'audio') {
      if (!requestBody.data || typeof requestBody.data !== 'string') {
        throw new Error('Invalid audio data format');
      }

      const dataUrlParts = requestBody.data.split(',');
      if (dataUrlParts.length !== 2) {
        throw new Error('Invalid data URL format');
      }

      const base64Data = dataUrlParts[1];
      
      try {
        console.log("Sending transcription request to OpenAI...");
        const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
          },
          body: (() => {
            const formData = new FormData();
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
          const errorText = await transcriptionResponse.text();
          throw new Error(`Failed to transcribe audio: ${errorText}`);
        }

        const transcriptionData = await transcriptionResponse.json();
        userMessage = transcriptionData.text.trim();
        console.log("Transcribed text:", userMessage);
      } catch (transcriptionError) {
        console.error("Transcription error:", transcriptionError);
        throw new Error(`Transcription failed: ${transcriptionError.message}`);
      }
    }

    // Récupérer les habitudes actuelles de l'utilisateur
    const { data: userHabits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    if (habitsError) {
      throw new Error(`Failed to fetch habits: ${habitsError.message}`);
    }

    // Récupérer les notes actuelles de l'utilisateur
    const { data: userNotes, error: notesError } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', user.id);

    if (notesError) {
      throw new Error(`Failed to fetch notes: ${notesError.message}`);
    }

    try {
      const promptData = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant qui aide à gérer les habitudes et les notes. Tu as accès aux données suivantes de l'utilisateur:

Habitudes actuelles:
${JSON.stringify(userHabits, null, 2)}

Notes actuelles:
${JSON.stringify(userNotes, null, 2)}

Tu peux effectuer les actions suivantes:
1. Créer une nouvelle habitude
2. Modifier une habitude existante
3. Supprimer une habitude
4. Créer ou modifier une note

Pour chaque action, réponds UNIQUEMENT avec un objet JSON valide contenant:
- action: "create_habit", "update_habit", "delete_habit", ou "update_note"
- data: les données nécessaires pour l'action
- message: un message à afficher à l'utilisateur

Exemples de réponses valides:

Pour créer une habitude:
{
  "action": "create_habit",
  "data": {
    "title": "Méditer",
    "description": "10 minutes par jour",
    "habit_type": "good",
    "experience_points": 50
  },
  "message": "J'ai créé une nouvelle habitude de méditation"
}

Pour supprimer une habitude:
{
  "action": "delete_habit",
  "data": {
    "title": "Méditer"
  },
  "message": "J'ai supprimé l'habitude de méditation"
}

Pour mettre à jour une habitude:
{
  "action": "update_habit",
  "data": {
    "title": "Méditer",
    "description": "20 minutes par jour",
    "habit_type": "good",
    "experience_points": 100
  },
  "message": "J'ai mis à jour l'habitude de méditation"
}

Pour supprimer toutes les habitudes:
{
  "action": "delete_habit",
  "data": {
    "title": "ALL"
  },
  "message": "J'ai supprimé toutes les habitudes"
}

IMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide, pas de texte avant ou après.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      };

      console.log("Sending request to OpenAI:", JSON.stringify(promptData, null, 2));

      const conversationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });

      if (!conversationResponse.ok) {
        const errorText = await conversationResponse.text();
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const conversationData = await conversationResponse.json();
      console.log("Raw OpenAI response:", JSON.stringify(conversationData, null, 2));

      let assistantResponse;
      try {
        const rawResponse = conversationData.choices[0].message.content.trim();
        console.log("Raw assistant message:", rawResponse);
        assistantResponse = JSON.parse(rawResponse);
        console.log("Parsed assistant response:", JSON.stringify(assistantResponse, null, 2));
      } catch (parseError) {
        console.error("Error parsing assistant response:", parseError);
        console.log("Problematic content:", conversationData.choices[0].message.content);
        throw new Error('Invalid response format from assistant');
      }

      // Exécuter l'action demandée
      switch (assistantResponse.action) {
        case 'create_habit': {
          const { error } = await supabase.from('habits').insert([{
            ...assistantResponse.data,
            user_id: user.id
          }]);
          if (error) throw new Error(`Failed to create habit: ${error.message}`);
          break;
        }

        case 'update_habit': {
          const { error } = await supabase.from('habits')
            .update(assistantResponse.data)
            .eq('title', assistantResponse.data.title)
            .eq('user_id', user.id);
          if (error) throw new Error(`Failed to update habit: ${error.message}`);
          break;
        }

        case 'delete_habit': {
          let error;
          if (assistantResponse.data.title === 'ALL') {
            // Supprimer toutes les habitudes
            const { error: deleteError } = await supabase.from('habits')
              .delete()
              .eq('user_id', user.id);
            error = deleteError;
          } else {
            // Supprimer une habitude spécifique
            const { error: deleteError } = await supabase.from('habits')
              .delete()
              .eq('title', assistantResponse.data.title)
              .eq('user_id', user.id);
            error = deleteError;
          }
          if (error) throw new Error(`Failed to delete habit(s): ${error.message}`);
          break;
        }

        case 'update_note': {
          const today = new Date().toISOString().split('T')[0];
          const { data: existingNote, error: fetchError } = await supabase
            .from('daily_notes')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

          if (fetchError) {
            throw new Error(`Failed to fetch note: ${fetchError.message}`);
          }

          if (existingNote) {
            const { error } = await supabase.from('daily_notes')
              .update({ content: assistantResponse.data.content })
              .eq('id', existingNote.id);
            if (error) throw new Error(`Failed to update note: ${error.message}`);
          } else {
            const { error } = await supabase.from('daily_notes').insert([{
              content: assistantResponse.data.content,
              user_id: user.id,
              date: today
            }]);
            if (error) throw new Error(`Failed to create note: ${error.message}`);
          }
          break;
        }
      }

      const responseData = {
        type: 'assistant_message',
        content: assistantResponse.message
      };

      console.log("Sending response:", JSON.stringify(responseData, null, 2));

      return new Response(
        JSON.stringify(responseData),
        { headers: corsHeaders }
      );

    } catch (aiError) {
      console.error("AI processing error:", aiError);
      throw new Error(`AI processing failed: ${aiError.message}`);
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
