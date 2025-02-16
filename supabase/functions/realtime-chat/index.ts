
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
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Requête reçue:", body);

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

    if (body.type === 'audio') {
      const base64Data = body.data.split(',')[1];
      
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
        throw new Error('Failed to transcribe audio');
      }

      const transcriptionData = await transcriptionResponse.json();
      userMessage = transcriptionData.text;
      console.log("Transcribed text:", userMessage);
    }

    // Récupérer les habitudes actuelles de l'utilisateur
    const { data: userHabits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    // Récupérer les notes actuelles de l'utilisateur
    const { data: userNotes } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', user.id);

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

Pour chaque action, réponds avec un objet JSON contenant:
- action: "create_habit", "update_habit", "delete_habit", ou "update_note"
- data: les données nécessaires pour l'action
- message: un message à afficher à l'utilisateur

Par exemple:
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
`
          },
          {
            role: 'user',
            content: userMessage
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
    const assistantResponse = JSON.parse(conversationData.choices[0].message.content);
    console.log("Assistant response:", assistantResponse);

    // Exécuter l'action demandée
    switch (assistantResponse.action) {
      case 'create_habit':
        await supabase.from('habits').insert([{
          ...assistantResponse.data,
          user_id: user.id
        }]);
        break;

      case 'update_habit':
        await supabase.from('habits')
          .update(assistantResponse.data)
          .eq('title', assistantResponse.data.title)
          .eq('user_id', user.id);
        break;

      case 'delete_habit':
        await supabase.from('habits')
          .delete()
          .eq('title', assistantResponse.data.title)
          .eq('user_id', user.id);
        break;

      case 'update_note':
        const today = new Date().toISOString().split('T')[0];
        const { data: existingNote } = await supabase
          .from('daily_notes')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (existingNote) {
          await supabase.from('daily_notes')
            .update({ content: assistantResponse.data.content })
            .eq('id', existingNote.id);
        } else {
          await supabase.from('daily_notes').insert([{
            content: assistantResponse.data.content,
            user_id: user.id,
            date: today
          }]);
        }
        break;
    }

    return new Response(
      JSON.stringify({
        type: 'assistant_message',
        content: assistantResponse.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
