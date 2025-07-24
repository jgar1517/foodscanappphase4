const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface IngredientAnalysisRequest {
  ingredients: string[];
}

interface AIIngredientAnalysis {
  ingredient: string;
  category: string;
  safetyRating: 'safe' | 'caution' | 'avoid';
  confidence: number;
  reasoning: string;
  healthImpacts: string[];
  alternatives: string[];
  sources: string[];
}

interface AIBatchAnalysis {
  ingredients: AIIngredientAnalysis[];
  overallAssessment: string;
  keyFindings: string[];
  recommendations: string[];
  processingTime: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body with error handling
    let requestData: IngredientAnalysisRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request body - must be valid JSON' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { ingredients } = requestData;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing or invalid ingredients array in request body' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Processing AI analysis for ${ingredients.length} ingredients...`)

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AI service not configured' 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Construct the prompt for GPT
    const prompt = `You are a food safety expert analyzing ingredient lists. For each ingredient provided, analyze its safety profile and provide a structured response.

For each ingredient, provide:
1. Category (e.g., "preservative", "sweetener", "natural", "coloring", "flavoring", "vitamin", "fat", "protein", etc.)
2. Safety rating: "safe", "caution", or "avoid"
3. Confidence score (0-100)
4. Detailed reasoning for the safety rating
5. Health impacts (both positive and negative)
6. Safer alternatives if applicable
7. Trusted sources for the information

Ingredients to analyze: ${ingredients.join(', ')}

Respond with a valid JSON object in this exact format:
{
  "ingredients": [
    {
      "ingredient": "ingredient name",
      "category": "category",
      "safetyRating": "safe|caution|avoid",
      "confidence": 85,
      "reasoning": "detailed explanation",
      "healthImpacts": ["impact1", "impact2"],
      "alternatives": ["alternative1", "alternative2"],
      "sources": ["FDA", "EWG", "Scientific studies"]
    }
  ],
  "overallAssessment": "summary of the overall product safety",
  "keyFindings": ["finding1", "finding2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Base your analysis on:
- FDA GRAS (Generally Recognized as Safe) list
- EWG Food Scores database
- Scientific research on food additives
- Known allergens and sensitivities
- Nutritional impact

Be conservative with safety ratings - when in doubt, use "caution" rather than "safe".`

    // Call OpenAI API with comprehensive error handling
    let openaiResponse: Response;
    
    try {
      console.log('Calling OpenAI API...');
      
      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a food safety expert and nutritionist. Provide accurate, science-based ingredient analysis in the requested JSON format. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        }),
      });
      
      console.log(`OpenAI API responded with status: ${openaiResponse.status}`);
      
    } catch (networkError) {
      console.error('Network error calling OpenAI API:', networkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to connect to AI analysis service',
          details: `Network error: ${networkError.message}` 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check OpenAI response status before parsing
    if (!openaiResponse.ok) {
      let errorDetails: any;
      let errorText: string;
      
      try {
        // Try to parse as JSON first
        errorDetails = await openaiResponse.json();
        console.error('OpenAI API error (JSON):', errorDetails);
      } catch (jsonParseError) {
        // If JSON parsing fails, get as text
        try {
          errorText = await openaiResponse.text();
          console.error('OpenAI API error (text):', errorText);
        } catch (textError) {
          console.error('Failed to read OpenAI error response:', textError);
          errorText = 'Unable to read error response';
        }
      }
      
      // Handle specific OpenAI error types
      let userFriendlyMessage = 'AI analysis service temporarily unavailable';
      
      if (errorDetails?.error?.code === 'insufficient_quota') {
        userFriendlyMessage = 'AI analysis quota exceeded. Please check your OpenAI billing settings.';
      } else if (errorDetails?.error?.code === 'invalid_api_key') {
        userFriendlyMessage = 'AI analysis service configuration error';
      } else if (errorDetails?.error?.code === 'rate_limit_exceeded') {
        userFriendlyMessage = 'AI analysis service is busy. Please try again in a moment.';
      } else if (openaiResponse.status === 429) {
        userFriendlyMessage = 'AI analysis service rate limit exceeded. Please try again later.';
      } else if (openaiResponse.status >= 500) {
        userFriendlyMessage = 'AI analysis service is experiencing technical difficulties.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userFriendlyMessage,
          details: errorDetails || errorText || `HTTP ${openaiResponse.status}`,
          statusCode: openaiResponse.status
        }),
        { 
          status: openaiResponse.status >= 500 ? 503 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse OpenAI response with robust error handling
    let openaiData: any;
    let rawResponseText: string;
    
    try {
      rawResponseText = await openaiResponse.text();
      console.log(`OpenAI response text length: ${rawResponseText.length}`);
      
      if (!rawResponseText || rawResponseText.trim() === '') {
        throw new Error('Empty response from OpenAI API');
      }
      
      openaiData = JSON.parse(rawResponseText);
      console.log('Successfully parsed OpenAI response JSON');
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw OpenAI response (first 500 chars):', rawResponseText?.substring(0, 500) || 'No response text');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response format from AI service',
          details: `JSON parsing failed: ${parseError.message}`,
          rawResponsePreview: rawResponseText?.substring(0, 200) || 'No response'
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Validate OpenAI response structure
    if (!openaiData.choices || !Array.isArray(openaiData.choices) || openaiData.choices.length === 0) {
      console.error('Invalid OpenAI response structure - missing choices:', openaiData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response structure from AI service',
          details: 'Missing or empty choices array',
          responseStructure: Object.keys(openaiData || {})
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const messageContent = openaiData.choices[0]?.message?.content;
    if (!messageContent) {
      console.error('No message content in OpenAI response:', openaiData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Empty response from AI service',
          details: 'No message content received',
          choicesLength: openaiData.choices?.length || 0
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the AI response content with robust error handling
    let analysisResult: AIBatchAnalysis;
    
    try {
      console.log(`Parsing AI message content (length: ${messageContent.length})`);
      console.log('AI message content preview:', messageContent.substring(0, 200));
      
      const aiContent = JSON.parse(messageContent);
      
      // Validate the parsed content structure
      if (!aiContent || typeof aiContent !== 'object') {
        throw new Error('AI response is not a valid object');
      }
      
      if (!aiContent.ingredients || !Array.isArray(aiContent.ingredients)) {
        console.error('Invalid AI content structure - missing ingredients array:', aiContent);
        throw new Error('AI response missing required ingredients array');
      }
      
      // Validate each ingredient analysis
      for (let i = 0; i < aiContent.ingredients.length; i++) {
        const ingredient = aiContent.ingredients[i];
        if (!ingredient.ingredient || !ingredient.safetyRating || !ingredient.reasoning) {
          console.error(`Invalid ingredient analysis at index ${i}:`, ingredient);
          throw new Error(`Incomplete ingredient analysis for item ${i + 1}`);
        }
        
        // Validate safety rating values
        if (!['safe', 'caution', 'avoid'].includes(ingredient.safetyRating)) {
          console.error(`Invalid safety rating "${ingredient.safetyRating}" for ingredient:`, ingredient);
          ingredient.safetyRating = 'caution'; // Default to caution for invalid ratings
        }
      }
      
      analysisResult = {
        ingredients: aiContent.ingredients,
        overallAssessment: aiContent.overallAssessment || 'Analysis completed',
        keyFindings: Array.isArray(aiContent.keyFindings) ? aiContent.keyFindings : [],
        recommendations: Array.isArray(aiContent.recommendations) ? aiContent.recommendations : [],
        processingTime: Date.now() - startTime
      };
      
      console.log(`Successfully parsed ${analysisResult.ingredients.length} ingredient analyses`);
      
    } catch (contentParseError) {
      console.error('Failed to parse AI response content:', contentParseError);
      console.error('Raw AI message content:', messageContent);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid AI analysis format',
          details: `Failed to parse AI response: ${contentParseError.message}`,
          contentPreview: messageContent.substring(0, 300)
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Final validation - ensure we have analysis for all requested ingredients
    if (analysisResult.ingredients.length === 0) {
      console.error('AI analysis returned no ingredient analyses');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AI analysis returned no results',
          details: 'No ingredient analyses were returned by the AI service' 
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (analysisResult.ingredients.length < ingredients.length) {
      console.warn(`Expected ${ingredients.length} analyses, got ${analysisResult.ingredients.length}`);
      // Continue anyway - partial results are better than no results
    }

    console.log(`AI analysis completed successfully. Processing time: ${analysisResult.processingTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: analysisResult 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in AI Analysis Edge Function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})