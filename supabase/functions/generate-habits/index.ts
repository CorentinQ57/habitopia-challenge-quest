
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { prompt, currentHabits } = await req.json();
    
    const messages = [
      {
        role: 'system',
        content: `Tu es un assistant qui aide à créer et gérer des habitudes. 
        Analyze le prompt de l'utilisateur et propose une liste d'actions à effectuer.
        Pour chaque habitude à créer, inclus:
        - title (obligatoire)
        - description (optionnel)
        - icon (emoji)
        - category (optionnel)
        - habit_type ('good' ou 'bad')
        - experience_points (entre 10 et 100)
        
        Pour les habitudes à supprimer, fournis juste leur titre exact.
        
        Réponds UNIQUEMENT en JSON avec ce format:
        {
          "toCreate": [{habit object}],
          "toDelete": ["habit title"]
        }`
      },
      {
        role: 'user',
        content: `Voici mes habitudes actuelles: ${JSON.stringify(currentHabits)}
        
        Voici ma demande: ${prompt}`
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const actions = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(actions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
