
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
      requestBody = JSON.parse(text.trim());
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
    } else if (requestBody.message) {
      userMessage = requestBody.message;
      console.log("Text message received:", userMessage);
    } else {
      throw new Error('Invalid request: no audio or message provided');
    }

    const { data: userHabits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    if (habitsError) {
      throw new Error(`Failed to fetch habits: ${habitsError.message}`);
    }

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
1. Créer une ou plusieurs nouvelles habitudes
2. Modifier une habitude existante
3. Supprimer une habitude
4. Créer ou modifier une note

Pour chaque action, réponds UNIQUEMENT avec un objet JSON valide contenant:
- actions: un tableau d'actions à effectuer
- message: un message à afficher à l'utilisateur

Exemples de réponses valides:

Pour créer plusieurs habitudes:
{
  "actions": [
    {
      "action": "create_habit",
      "data": {
        "title": "Méditer",
        "description": "10 minutes par jour",
        "habit_type": "good",
        "experience_points": 50,
        "icon": "🧘‍♂️"
      }
    },
    {
      "action": "create_habit",
      "data": {
        "title": "Boire de l'eau",
        "description": "2L par jour",
        "habit_type": "good",
        "experience_points": 30,
        "icon": "💧"
      }
    }
  ],
  "message": "J'ai créé 2 nouvelles habitudes pour vous"
}

Pour créer une note:
{
  "actions": [
    {
      "action": "update_note",
      "data": {
        "content": "Aujourd'hui j'ai fait du sport et mangé équilibré"
      }
    }
  ],
  "message": "J'ai ajouté votre note pour aujourd'hui"
}

Pour supprimer une habitude:
{
  "actions": [
    {
      "action": "delete_habit",
      "data": {
        "title": "Méditer"
      }
    }
  ],
  "message": "J'ai supprimé l'habitude de méditation"
}

IMPORTANT : 
- Réponds UNIQUEMENT avec un objet JSON valide, pas de texte avant ou après
- Pour create_habit, TOUS les champs sont obligatoires (title, description, habit_type, experience_points, icon)
- habit_type doit être "good" ou "bad"
- experience_points doit être un nombre positif
- Ajoute toujours une icône appropriée dans le champ icon
- Pour les notes, le champ content est obligatoire`
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

      for (const action of assistantResponse.actions) {
        if (action.action === 'create_habit') {
          const requiredFields = ['title', 'description', 'habit_type', 'experience_points', 'icon'];
          const missingFields = requiredFields.filter(field => !action.data[field]);
          
          if (missingFields.length > 0) {
            throw new Error(`Missing required fields for habit creation: ${missingFields.join(', ')}`);
          }

          if (!['good', 'bad'].includes(action.data.habit_type)) {
            throw new Error('habit_type must be either "good" or "bad"');
          }

          if (typeof action.data.experience_points !== 'number' || action.data.experience_points <= 0) {
            throw new Error('experience_points must be a positive number');
          }
        } else if (action.action === 'update_note') {
          if (!action.data.content) {
            throw new Error('Content is required for notes');
          }
        }
      }

      try {
        for (const action of assistantResponse.actions) {
          switch (action.action) {
            case 'create_habit': {
              console.log("Creating habit with data:", JSON.stringify(action.data, null, 2));
              const { data: newHabit, error } = await supabase.from('habits').insert([{
                ...action.data,
                user_id: user.id
              }]).select().single();

              if (error) {
                console.error("Supabase error creating habit:", error);
                throw new Error(`Failed to create habit: ${error.message}`);
              }
              console.log("Successfully created habit:", newHabit);
              break;
            }

            case 'update_habit': {
              const { error } = await supabase.from('habits')
                .update(action.data)
                .eq('title', action.data.title)
                .eq('user_id', user.id);
              if (error) throw new Error(`Failed to update habit: ${error.message}`);
              break;
            }

            case 'delete_habit': {
              let error;
              if (action.data.title === 'ALL') {
                const { error: deleteError } = await supabase.from('habits')
                  .delete()
                  .eq('user_id', user.id);
                error = deleteError;
              } else {
                const { error: deleteError } = await supabase.from('habits')
                  .delete()
                  .eq('title', action.data.title)
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
                  .update({ content: action.data.content })
                  .eq('id', existingNote.id);
                if (error) throw new Error(`Failed to update note: ${error.message}`);
              } else {
                const { error } = await supabase.from('daily_notes').insert([{
                  content: action.data.content,
                  user_id: user.id,
                  date: today
                }]);
                if (error) throw new Error(`Failed to create note: ${error.message}`);
              }
              break;
            }
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

      } catch (dbError) {
        console.error("Database operation error:", dbError);
        throw new Error(`Database operation failed: ${dbError.message}`);
      }

    } catch (aiError) {
      console.error("AI processing error:", aiError);
      throw new Error(`AI processing failed: ${aiError.message}`);
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
