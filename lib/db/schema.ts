import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, serial } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  nationality: varchar('nationality', { length: 3 }),
  
  // Basic Information
  school: varchar('school', { length: 255 }),
  grade: varchar('grade', { length: 50 }),
  
  // Role-specific data stored as JSON
  delegateData: jsonb('delegate_data'), // For delegate-specific fields
  chairData: jsonb('chair_data'), // For chair-specific fields including experiences
  adminData: jsonb('admin_data'), // For admin-specific fields
  referralCodes: jsonb('referral_codes'),
  
  // Common fields
  dietaryType: varchar('dietary_type', { length: 50 }),
  dietaryOther: text('dietary_other'),
  hasAllergies: varchar('has_allergies', { length: 10 }),
  allergiesDetails: text('allergies_details'),
  emergencyContactName: varchar('emergency_contact_name', { length: 100 }).notNull(),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }).notNull(),
  
  // Agreement flags
  agreeTerms: boolean('agree_terms').notNull().default(false),
  agreePhotos: boolean('agree_photos').default(false),
  
  // Metadata
  registrationStatus: varchar('registration_status', { length: 20 }).default('pending'),
  paymentStatus: varchar('payment_status', { length: 20 }).default('unpaid'),
  paymentProofUrl: text('payment_proof_url'),
  paymentProofStoragePath: text('payment_proof_storage_path'),
  paymentProofFileName: text('payment_proof_file_name'),
  paymentProofPayerName: text('payment_proof_payer_name'),
  paymentProofRole: varchar('payment_proof_role', { length: 20 }),
  paymentProofUploadedAt: timestamp('payment_proof_uploaded_at'),
  chairCvUrl: text('chair_cv_url'),
  chairCvStoragePath: text('chair_cv_storage_path'),
  chairCvFileName: text('chair_cv_file_name'),
  chairCvUploadedAt: timestamp('chair_cv_uploaded_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const schoolDelegations = pgTable('school_delegations', {
  id: serial('id').primaryKey(),
  schoolName: varchar('school_name', { length: 255 }).notNull(),
  schoolAddress: text('school_address').notNull(),
  schoolEmail: varchar('school_email', { length: 255 }).notNull(),
  schoolCountry: varchar('school_country', { length: 100 }).notNull(),
  directorName: varchar('director_name', { length: 255 }).notNull(),
  directorEmail: varchar('director_email', { length: 255 }).notNull(),
  directorPhone: varchar('director_phone', { length: 50 }).notNull(),
  numFaculty: integer('num_faculty').notNull(),
  numDelegates: integer('num_delegates').notNull(),
  additionalRequests: text('additional_requests'),
  heardAbout: text('heard_about'),
  termsAccepted: boolean('terms_accepted').notNull().default(false),
  spreadsheetFileName: text('spreadsheet_file_name').notNull(),
  spreadsheetStoragePath: text('spreadsheet_storage_path').notNull(),
  spreadsheetMimeType: varchar('spreadsheet_mime_type', { length: 255 }).notNull(),
  spreadsheetUrl: text('spreadsheet_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Zod schemas for validation (manual definition to fix drizzle-zod compatibility)
export const insertUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone is required'),
  role: z.enum(['delegate', 'chair', 'admin']),
  school: z.string().optional(),
  grade: z.string().optional(),
  delegateData: z.any().optional(),
  chairData: z.any().optional(),
  adminData: z.any().optional(),
  referralCodes: z.array(z.string()).optional(),
  dietaryType: z.string().min(1, 'Dietary preference is required'),
  dietaryOther: z.string().optional(), 
  hasAllergies: z.string().min(1, 'Please indicate if you have allergies'),
  allergiesDetails: z.string().optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
  agreeTerms: z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
  agreePhotos: z.boolean().optional(),
  nationality: z.string().length(2),
})

export const selectUserSchema = createSelectSchema(users)

export const insertSchoolDelegationSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  schoolAddress: z.string().min(1, 'School address is required'),
  schoolEmail: z.string().email('Enter a valid school email address'),
  schoolCountry: z.string().min(1, 'School country is required'),
  directorName: z.string().min(1, 'Director name is required'),
  directorEmail: z.string().email('Enter a valid director email address'),
  directorPhone: z.string().min(1, 'Director phone number is required'),
  numFaculty: z.number().int().min(0, 'Number of faculty must be zero or higher'),
  numDelegates: z.number().int().min(0, 'Number of delegates must be zero or higher'),
  additionalRequests: z.string().optional().nullable(),
  heardAbout: z.string().optional().nullable(),
  termsAccepted: z.boolean().refine((value) => value === true, 'Terms and conditions must be accepted'),
  spreadsheetFileName: z.string().min(1, 'Spreadsheet file name is required'),
  spreadsheetStoragePath: z.string().min(1, 'Spreadsheet storage path is required'),
  spreadsheetMimeType: z.string().min(1, 'Spreadsheet MIME type is required'),
  spreadsheetUrl: z.string().url('Spreadsheet URL must be a valid URL').optional().nullable(),
})

// Role-specific data schemas
export const delegateDataSchema = z.object({
  experience: z.enum(['none', 'beginner', 'intermediate', 'advanced']),
  committee1: z.string().optional(),
  committee2: z.string().optional(),
  committee3: z.string().optional(),
})

export const chairDataSchema = z.object({
  experiences: z.array(z.object({
    conference: z.string(),
    position: z.string(),
    year: z.string(),
    description: z.string().optional(),
  })).min(1, 'At least one experience is required for chairs'),
  committee1: z.string().optional(),
  committee2: z.string().optional(),
  committee3: z.string().optional(),
  crisisBackroomInterest: z.string().optional(),
  whyBestFit: z.string().min(50, 'Please provide at least 50 characters explaining why you are the best fit'),
  successfulCommittee: z.string().min(50, 'Please provide at least 50 characters on what makes a committee successful'),
  strengthWeakness: z.string().min(50, 'Please provide at least 50 characters describing your strengths and weaknesses'),
  crisisResponse: z.string().optional(),
  availability: z.string().optional(),
  cvUrl: z.string().optional().nullable(),
  cvFileName: z.string().optional().nullable(),
  cvStoragePath: z.string().optional().nullable(),
  cvUploadedAt: z.string().optional().nullable(),
})

export const adminDataSchema = z.object({
  experiences: z.array(z.object({
    role: z.string(),
    organization: z.string(),
    year: z.string(),
    description: z.string().optional(),
  })).optional(),
  skills: z.array(z.string()).optional(),
  whyAdmin: z.string().optional(),
  relevantExperience: z.string().min(1, 'Relevant experience is required'),
  previousAdmin: z.enum(['yes', 'no']),
  understandsRole: z.enum(['yes', 'no']),
})

// Type exports
export type User = typeof users.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>
export type DelegateData = z.infer<typeof delegateDataSchema>
export type ChairData = z.infer<typeof chairDataSchema>
export type AdminData = z.infer<typeof adminDataSchema>
export type SchoolDelegation = typeof schoolDelegations.$inferSelect
export type InsertSchoolDelegation = z.infer<typeof insertSchoolDelegationSchema>
