import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Google Cloud Vision API key from environment variables
    const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY')

    if (!GOOGLE_VISION_API_KEY) {
      console.error('Google Vision API key not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Vision API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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

    // Parse request body
    const { base64Image } = await req.json()

    if (!base64Image) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing base64Image in request body' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing OCR request with Google Vision API...')

    // Prepare Google Vision API request
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
          imageContext: {
            languageHints: ['en'],
          },
        },
      ],
    }

    // Call Google Vision API
    const googleResponse = await fetch(
      `${GOOGLE_VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!googleResponse.ok) {
      const errorData = await googleResponse.json()
      console.error('Google Vision API error:', errorData)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Vision API request failed',
          details: errorData 
        }),
        { 
          status: googleResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const visionData = await googleResponse.json()
    console.log('Google Vision API response received')

    // Parse the response to extract text
    const textAnnotations = visionData.responses?.[0]?.textAnnotations || []
    const fullText = textAnnotations[0]?.description || ''
    
    if (!fullText) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No text detected in image' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate confidence score (Google Vision doesn't always provide this)
    const confidence = textAnnotations[0]?.score ? 
      Math.round(textAnnotations[0].score * 100) : 85

    // Create text blocks from individual word annotations
    const blocks = textAnnotations.slice(1).map((annotation: any) => ({
      text: annotation.description,
      boundingBox: {
        x: annotation.boundingPoly?.vertices?.[0]?.x || 0,
        y: annotation.boundingPoly?.vertices?.[0]?.y || 0,
        width: Math.abs(
          (annotation.boundingPoly?.vertices?.[2]?.x || 0) - 
          (annotation.boundingPoly?.vertices?.[0]?.x || 0)
        ),
        height: Math.abs(
          (annotation.boundingPoly?.vertices?.[2]?.y || 0) - 
          (annotation.boundingPoly?.vertices?.[0]?.y || 0)
        )
      },
      confidence: confidence / 100
    }))

    // Return structured OCR result
    const ocrResult = {
      text: fullText,
      confidence,
      blocks,
      processingTime: Date.now() - Date.now(), // Will be calculated on client side
      source: 'google-vision'
    }

    console.log(`OCR completed successfully. Text length: ${fullText.length}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: ocrResult 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})