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

    const startTime = Date.now();

    // Parse request body
    const { ingredients }: IngredientAnalysisRequest = await req.json()

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
      throw new Error('OpenAI API key not configured')
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

    // Call OpenAI API
    let openaiResponse: Response
    let openaiData: any
    
    try {
      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using the more cost-effective model
          messages: [
            {
              role: 'system',
              content: 'You are a food safety expert and nutritionist. Provide accurate, science-based ingredient analysis in the requested JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent results
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        }),
      })
    } catch (fetchError) {
      console.error('Failed to call OpenAI API:', fetchError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to connect to AI analysis service',
          details: fetchError.message 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if OpenAI API request was successful
    if (!openaiResponse.ok) {
      let errorData: any
      try {
        errorData = await openaiResponse.json()
      } catch (jsonError) {
        // If we can't parse the error response as JSON, get it as text
        const errorText = await openaiResponse.text()
        console.error('OpenAI API error (non-JSON response):', errorText)
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'AI analysis service error',
            details: `HTTP ${openaiResponse.status}: ${errorText}` 
          }),
          { 
            status: openaiResponse.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      console.error('OpenAI API error:', errorData)
      
      // Handle specific OpenAI error types
      let userFriendlyMessage = 'AI analysis service temporarily unavailable'
      if (errorData.error?.code === 'insufficient_quota') {
        userFriendlyMessage = 'AI analysis quota exceeded. Please check your OpenAI billing settings.'
      } else if (errorData.error?.code === 'invalid_api_key') {
        userFriendlyMessage = 'AI analysis service configuration error'
      } else if (errorData.error?.code === 'rate_limit_exceeded') {
        userFriendlyMessage = 'AI analysis service is busy. Please try again in a moment.'
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userFriendlyMessage,
          details: errorData 
        }),
        { 
          status: openaiResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse OpenAI response
    try {
      openaiData = await openaiResponse.json()
    } catch (jsonError) {
      console.error('Failed to parse OpenAI response as JSON:', jsonError)
      const responseText = await openaiResponse.text()
      console.error('Raw OpenAI response:', responseText)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response format from AI service',
          details: 'Response was not valid JSON' 
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('OpenAI API response received successfully')

    // Validate OpenAI response structure
    if (!openaiData.choices || !Array.isArray(openaiData.choices) || openaiData.choices.length === 0) {
      console.error('Invalid OpenAI response structure:', openaiData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response structure from AI service',
          details: 'Missing or empty choices array' 
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const messageContent = openaiData.choices[0]?.message?.content
    if (!messageContent) {
      console.error('No message content in OpenAI response:', openaiData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Empty response from AI service',
          details: 'No message content received' 
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the AI response content
    let analysisResult: Partial<AIBatchAnalysis>
    try {
      const aiContent = JSON.parse(messageContent)
      
      // Validate the parsed content structure
      if (!aiContent.ingredients || !Array.isArray(aiContent.ingredients)) {
        console.error('Invalid AI content structure - missing ingredients array:', aiContent)
        throw new Error('AI response missing required ingredients array')
      }
      
      analysisResult = {
        ingredients: aiContent.ingredients || [],
        overallAssessment: aiContent.overallAssessment || 'Analysis completed',
        keyFindings: aiContent.keyFindings || [],
        recommendations: aiContent.recommendations || [],
        processingTime: Date.now() - startTime
      }
    } catch (parseError) {
      console.error('Failed to parse AI response content:', parseError)
      console.error('Raw AI message content:', messageContent)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid AI analysis format',
          details: `Failed to parse AI response: ${parseError.message}` 
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate that we have analysis for all ingredients
    if (analysisResult.ingredients!.length !== ingredients.length) {
      console.warn(`Expected ${ingredients.length} analyses, got ${analysisResult.ingredients!.length}. Some ingredients may not have been analyzed.`)
      
      // If we got significantly fewer results than expected, return an error
      if (analysisResult.ingredients!.length === 0) {
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
    }

    console.log(`AI analysis completed successfully. Processing time: ${analysisResult.processingTime}ms`)

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
    console.error('AI Analysis Edge Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})