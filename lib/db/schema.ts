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
  
  // Basic Information
  school: varchar('school', { length: 255 }),
  grade: varchar('grade', { length: 50 }),
  
  // Role-specific data stored as JSON
  delegateData: jsonb('delegate_data'), // For delegate-specific fields
  chairData: jsonb('chair_data'), // For chair-specific fields including experiences
  adminData: jsonb('admin_data'), // For admin-specific fields
  
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
