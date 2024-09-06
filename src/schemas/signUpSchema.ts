import { z } from 'zod';

export const usernameValidation = z
  .string()
  .min(6, 'Username must be atleast 6 characters')
  .max(20, 'Username must be atmost 20 characters')
  .regex(/^[a-zA-Z0-9]+$/, 'User must not contain special characters');

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: 'Invalid Email Address!' }),
  password: z
    .string()
    .min(6, { message: 'Username must be atleast 6 characters' })
    .max(20, { message: 'Username must be atmost 20 characters' }),
});
