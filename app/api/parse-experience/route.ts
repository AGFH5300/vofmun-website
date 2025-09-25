
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { text, roleType, prompt } = await request.json()

    if (!text || !roleType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Gemini API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Enhanced prompt with better structure
    const enhancedPrompt = `${prompt}

Important: Return ONLY a valid JSON array with no additional text or formatting. Each object in the array should be properly formatted JSON.

Example format for chair experiences:
[
  {
    "conference": "Harvard MUN 2023",
    "position": "Chair",
    "year": "2023",
    "description": "Led Security Council committee discussions on global security issues"
  }
]

Example format for admin experiences:
[
  {
    "role": "Event Coordinator",
    "organization": "School Student Council",
    "year": "2023",
    "description": "Organized multiple events with 500+ attendees"
  }
]`

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const aiText = response.text()

    // Try to extract JSON from the response
    let experiences
    try {
      // Remove any markdown formatting or extra text
      const cleanedText = aiText.replace(/```json\n?|\n?```/g, '').trim()
      
      // Try to find JSON array in the response
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/)
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedText
      
      experiences = JSON.parse(jsonString)
      
      // Validate the structure
      if (!Array.isArray(experiences)) {
        throw new Error('Response is not an array')
      }

      // Validate each experience object
      experiences = experiences.filter(exp => {
        if (roleType === 'chair') {
          return exp.conference && exp.position && exp.year
        } else {
          return exp.role && exp.organization && exp.year
        }
      })

      if (experiences.length === 0) {
        throw new Error('No valid experiences found')
      }

    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try rephrasing your experience or fill manually.' },
        { status: 422 }
      )
    }

    return NextResponse.json({
      success: true,
      experiences: experiences,
      count: experiences.length
    })

  } catch (error: any) {
    console.error('Experience parsing error:', error)
    
    // Handle specific API errors
    if (error.message?.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'API configuration error. Please contact support.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process experience. Please try again.' },
      { status: 500 }
    )
  }
}
