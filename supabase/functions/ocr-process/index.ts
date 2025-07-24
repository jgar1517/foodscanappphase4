import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { create, getNumericDate, Header, Payload } from 'https://deno.land/x/djwt@v3.0.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_VISION_SCOPE = 'https://www.googleapis.com/auth/cloud-platform'

interface GoogleAccessTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

async function getGoogleAccessToken(): Promise<string> {
  const privateKey = Deno.env.get('GOOGLE_GEN_LANG_API_KEY')
  const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')

  if (!privateKey || !clientEmail) {
    throw new Error('Google service account credentials not configured')
  }

  // Clean up the private key more thoroughly
  let cleanPrivateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^"/, '')
    .replace(/"$/, '')
    .trim()

  // Ensure the private key has proper BEGIN/END markers
  if (!cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    if (!cleanPrivateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      throw new Error('Private key must be in PEM format with proper BEGIN/END markers')
    }
    // Convert RSA private key to PKCS#8 format if needed
    cleanPrivateKey = cleanPrivateKey
      .replace('-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----')
      .replace('-----END RSA PRIVATE KEY-----', '-----END PRIVATE KEY-----')
  }

  console.log('Private key format check:', {
    hasBeginMarker: cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----'),
    hasEndMarker: cleanPrivateKey.includes('-----END PRIVATE KEY-----'),
    length: cleanPrivateKey.length
  })

  // Create JWT header
  const header: Header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  // Create JWT payload
  const now = Math.floor(Date.now() / 1000)
  const payload: Payload = {
    iss: clientEmail,
    scope: GOOGLE_VISION_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600, // 1 hour from now
    iat: now, // now
  }

  try {
    // Convert PEM to DER format for Web Crypto API
    const pemHeader = '-----BEGIN PRIVATE KEY-----'
    const pemFooter = '-----END PRIVATE KEY-----'
    
    if (!cleanPrivateKey.includes(pemHeader) || !cleanPrivateKey.includes(pemFooter)) {
      throw new Error('Invalid PEM format: missing header or footer')
    }
    
    // Extract the base64 content between the PEM markers
    const pemContents = cleanPrivateKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '') // Remove all whitespace including newlines
    
    // Convert base64 to binary
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))
    
    // Import the private key in DER format
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    )

    // Create and sign the JWT
    const jwt = await create(header, payload, cryptoKey)

    // Exchange JWT for access token
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      throw new Error(`Failed to get access token: ${tokenResponse.status}`)
    }

    const tokenData: GoogleAccessTokenResponse = await tokenResponse.json()
    return tokenData.access_token

  } catch (cryptoError) {
    console.error('Crypto operation failed:', cryptoError)
    console.error('Private key preview:', cleanPrivateKey.substring(0, 100) + '...')
    throw new Error(`Failed to process private key: ${cryptoError.message}`)
  }
}

serve(async (req) => {
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

    // Get access token using service account authentication
    const accessToken = await getGoogleAccessToken()

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

    // Call Google Vision API with Bearer token authentication
    const googleResponse = await fetch(GOOGLE_VISION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    })

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