import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSetupSchema = z.object({
  name: z.string().min(1, 'Display name is required'),
  sports: z.array(z.string()).min(1, 'Select at least one sport'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
  location_name: z.string().min(1, 'Location is required'),
});

export const createEventStep1Schema = z.object({
  sport: z.string().min(1, 'Sport is required'),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
  gender_preference: z.enum(['any', 'men', 'women', 'mixed']),
});

export const createEventStep2Schema = z.object({
  date_time: z.string().min(1, 'Date and time is required'),
  location_name: z.string().min(1, 'Location is required'),
  latitude: z.number(),
  longitude: z.number(),
  max_participants: z.number().min(2, 'At least 2 participants required'),
});

export const createEventStep3Schema = z.object({
  venue_cost: z.number().min(0),
});

export const editProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().max(300).optional(),
  sports: z.array(z.string()).min(1, 'Select at least one sport'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
  location_name: z.string().min(1, 'Location is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
