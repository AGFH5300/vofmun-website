import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { insertUserSchema, delegateDataSchema, chairDataSchema, adminDataSchema } from '@/lib/db/schema'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    
    // Transform the form data to match the schema
    const transformedData = {
      email: body.formData?.email,
      firstName: body.formData?.firstName,
      lastName: body.formData?.lastName,
      phone: body.formData?.phone,
      role: body.selectedRole,
      school: body.formData?.school,
      grade: body.formData?.grade,
      dietaryType: body.formData?.dietaryType,
      dietaryOther: body.formData?.dietaryOther,
      hasAllergies: body.formData?.hasAllergies,
      allergiesDetails: body.formData?.allergiesDetails,
      emergencyContactName: body.formData?.emergencyContact,
      emergencyContactPhone: body.formData?.emergencyPhone,
      agreeTerms: body.formData?.agreeTerms,
      agreePhotos: body.formData?.agreePhotos || false,
    }
    
    // Validate with Zod schema
    const userData = insertUserSchema.parse(transformedData)
    
    // Additional server-side validation for dietary/allergies
    if (userData.dietaryType === 'other' && !userData.dietaryOther?.trim()) {
      throw new Error('Please specify your dietary requirement')
    }
    if (userData.hasAllergies === 'yes' && !userData.allergiesDetails?.trim()) {
      throw new Error('Please provide details about your allergies')
    }

    // Process role-specific data
    let roleData = {}
    if (body.selectedRole === 'delegate') {
      const delegateDataParsed = delegateDataSchema.parse(body.delegateData)
      
      // Server-side committee duplication validation
      const committees = [delegateDataParsed.committee1, delegateDataParsed.committee2, delegateDataParsed.committee3].filter(Boolean)
      const uniqueCommittees = new Set(committees)
      if (committees.length !== uniqueCommittees.size) {
        throw new Error('Cannot select the same committee multiple times')
      }
      
      // Validate allowed committee values
      const allowedCommittees = ['ga1', 'unodc', 'ecosoc', 'who', 'icj', 'unsc']
      for (const committee of committees) {
        if (committee && !allowedCommittees.includes(committee)) {
          throw new Error('Invalid committee selection')
        }
      }
      
      roleData = delegateDataParsed
    } else if (body.selectedRole === 'chair') {
      roleData = chairDataSchema.parse(body.chairData)
    } else if (body.selectedRole === 'admin') {
      roleData = adminDataSchema.parse(body.adminData)
    }
    
    // Prepare the data for Supabase insertion
    const supabaseData = {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      role: body.selectedRole as 'delegate' | 'chair' | 'admin',
      school: userData.school,
      grade: userData.grade,
      dietary_type: userData.dietaryType,
      dietary_other: userData.dietaryOther,
      has_allergies: userData.hasAllergies,
      allergies_details: userData.allergiesDetails,
      emergency_contact_name: userData.emergencyContactName,
      emergency_contact_phone: userData.emergencyContactPhone,
      agree_terms: userData.agreeTerms,
      agree_photos: userData.agreePhotos,
      // Add role-specific data
      delegate_data: body.selectedRole === 'delegate' ? roleData : null,
      chair_data: body.selectedRole === 'chair' ? roleData : null,
      admin_data: body.selectedRole === 'admin' ? roleData : null,
    }
    
    // Insert user data using Supabase
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([supabaseData])
      .select()
      .single()
    
    if (error) {
      // Handle specific Supabase errors
      if (error.code === '23505' || error.message.includes('duplicate key')) {
        return NextResponse.json(
          { 
            message: 'An account with this email already exists',
            status: 'error'
          },
          { status: 409 }
        )
      }
      
      throw new Error('Failed to create user: ' + error.message)
    }
    
    return NextResponse.json(
      { 
        message: 'Registration submitted successfully!', 
        userId: newUser.id,
        status: 'success'
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('❌ SUPABASE SIGNUP ERROR - Complete Debug Analysis')
    console.error('🔍 Error type:', error?.constructor?.name || 'Unknown constructor')
    console.error('📝 Primary error message:', error instanceof Error ? error.message : 'Non-Error object thrown')
    console.error('🔄 Current process PID:', process.pid)
    console.error('⏰ Error timestamp:', new Date().toISOString())
    
    // Log environment variables (safely)
    console.error('🌍 Environment check:')
    console.error('  - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING')
    console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')
    
    if (error instanceof Error && error.message.includes('relation "users" does not exist')) {
      console.error('🚨 DATABASE TABLE MISSING: The users table has not been created in Supabase!')
      console.error('🔧 Solution: Run the SQL setup script in your Supabase dashboard')
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Validation error', 
          errors: error.errors,
          status: 'error'
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && (
      error.message.includes('unique constraint') ||
      error.message.includes('duplicate key') ||
      error.message.includes('already exists')
    )) {
      return NextResponse.json(
        { 
          message: 'An account with this email already exists',
          status: 'error'
        },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Internal server error. Please try again.',
        status: 'error'
      },
      { status: 500 }
    )
  }
}