
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

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
    // Vérification de la clé API
    console.log('DeepSeek API Key présente:', !!deepseekApiKey);
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    const { prompt, currentHabits } = await req.json();
    console.log('Received prompt:', prompt);
    console.log('Current habits:', JSON.stringify(currentHabits));
    
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

    console.log('Sending request to DeepSeek API...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    // Log de la réponse brute pour le débogage
    const responseText = await response.text();
    console.log('Raw API Response:', responseText);

    if (!response.ok) {
      console.error('DeepSeek API Response Status:', response.status);
      console.error('DeepSeek API Response Headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`DeepSeek API error: ${responseText}`);
    }

    // Parse la réponse JSON maintenant que nous savons qu'elle est valide
    const data = JSON.parse(responseText);
    console.log('Parsed API Response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const cleanedResponse = cleanAIResponse(data.choices[0].message.content);
    console.log('Cleaned response:', cleanedResponse);
    
    try {
      const actions = JSON.parse(cleanedResponse);
      console.log('Parsed actions:', actions);

      // Valider la structure de la réponse
      if (!actions.toCreate || !Array.isArray(actions.toCreate) || !actions.toDelete || !Array.isArray(actions.toDelete)) {
        throw new Error('Invalid response format: missing required arrays');
      }

      return new Response(JSON.stringify(actions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Raw response:', data.choices[0].message.content);
      console.error('Cleaned response:', cleanedResponse);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in generate-habits function:', error);
    // Retourner une réponse d'erreur détaillée
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
