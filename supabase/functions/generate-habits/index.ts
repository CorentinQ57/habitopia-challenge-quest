
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction pour nettoyer la réponse de l'IA des blocs de code markdown
const cleanAIResponse = (response: string): string => {
  // Enlever les blocs de code markdown ```json et ```
  response = response.replace(/```json\n/g, '').replace(/```\n/g, '').replace(/```/g, '');
  
  // Nettoyer les espaces et retours à la ligne en trop
  response = response.trim();
  
  return response;
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
        }
        
        NE PAS ajouter de blocs de code markdown (pas de \`\`\`json).`
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
    const cleanedResponse = cleanAIResponse(data.choices[0].message.content);
    
    try {
      const actions = JSON.parse(cleanedResponse);

      // Valider la structure de la réponse
      if (!actions.toCreate || !Array.isArray(actions.toCreate) || !actions.toDelete || !Array.isArray(actions.toDelete)) {
        throw new Error('Invalid response format');
      }

      return new Response(JSON.stringify(actions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Raw response:', data.choices[0].message.content);
      console.error('Cleaned response:', cleanedResponse);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error in generate-habits function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
