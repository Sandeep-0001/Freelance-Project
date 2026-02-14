import { z } from 'zod';

// User-friendly error messages for validation
export const VALIDATION_MESSAGES = {
  // Auth related
  INVALID_EMAIL: 'Please enter a valid email address',
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_EXISTS: 'This email address is already registered. Please use a different email or login to your existing account.',
  MOBILE_INVALID: 'Please enter a valid mobile number (10-15 digits)',
  MOBILE_EXISTS: 'This mobile number is already registered. Please use a different number or login to your existing account.',
  PASSWORD_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_WEAK: 'Password must contain both letters and numbers',
  TERMS_REQUIRED: 'You must accept the terms and conditions to continue',
  
  // Profile related
  NAME_REQUIRED: 'Please enter your name',
  NAME_TOO_SHORT: 'Name must be at least 2 characters long',
  FULL_NAME_REQUIRED: 'Please enter your full name as per documents',
  COMPANY_NAME_REQUIRED: 'Please enter your company name',
  
  // File upload related
  FILE_TOO_LARGE: 'File size cannot exceed 2MB. Please choose a smaller file.',
  INVALID_FILE_TYPE: 'Only image files are allowed (JPG, PNG, GIF, WebP)',
  NO_FILE_UPLOADED: 'Please select a file to upload',
  
  // General
  UNAUTHORIZED: 'Please log in to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  ACCOUNT_DELETED: 'This account has been deleted and cannot be accessed',
  ACCOUNT_SUSPENDED: 'This account has been suspended. Please contact support for assistance.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_INPUT: 'Please check the information you entered and try again',
  SERVER_ERROR: 'Something went wrong on our end. Please try again in a moment.',
  
  // Business related
  SERVICE_NAME_REQUIRED: 'Please enter a service name',
  SERVICE_PRICE_INVALID: 'Please enter a valid price (minimum 0)',
  CATEGORY_REQUIRED: 'Please select a category',
  DESCRIPTION_REQUIRED: 'Please enter a description',
  
  // KYC related
  DOCUMENT_REQUIRED: 'Please upload the required documents',
  INVALID_DOCUMENT_TYPE: 'Invalid document format. Please upload a valid document.',
  KYC_ALREADY_SUBMITTED: 'Your KYC verification is already submitted and under review',
  
  // Payment related
  INVALID_AMOUNT: 'Please enter a valid amount',
  PAYMENT_FAILED: 'Payment processing failed. Please try again or use a different payment method.',
  INSUFFICIENT_BALANCE: 'Insufficient balance in your account'
} as const;

// Custom error handling for Zod validation
export function formatZodError(error: z.ZodError): string {
  const firstError = error.issues[0];
  if (!firstError) return VALIDATION_MESSAGES.INVALID_INPUT;
  
  const field = firstError.path.join('.');
  const message = firstError.message;
  
  // If the message is already user-friendly, return it directly
  if (message && !message.startsWith('Expected') && !message.startsWith('Invalid type') && message !== 'Required') {
    return message;
  }
  
  // Map field names to user-friendly names
  const fieldNames: Record<string, string> = {
    'emailOrPhone': 'Email or phone number',
    'mobile': 'Mobile number',
    'email': 'Email address',
    'password': 'Password',
    'name': 'Name',
    'fullName': 'Full name',
    'acceptedTerms': 'Terms and conditions',
    'referralCode': 'Referral code'
  };
  
  const friendlyField = fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
  
  // Map common Zod errors to user-friendly messages
  switch (message) {
    case 'Required':
      return `${friendlyField} is required`;
    case 'Invalid email':
      return VALIDATION_MESSAGES.INVALID_EMAIL;
    default:
      return message;
  }
}

// Enhanced validation schemas with custom messages
export const authValidation = {
  register: z.object({
    mobile: z.string()
      .min(10, VALIDATION_MESSAGES.MOBILE_INVALID)
      .max(15, VALIDATION_MESSAGES.MOBILE_INVALID)
      .regex(/^[0-9+\-\s()]+$/, VALIDATION_MESSAGES.MOBILE_INVALID),
    countryCode: z.string().default("+91"),
    name: z.string()
      .min(2, VALIDATION_MESSAGES.NAME_TOO_SHORT)
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string()
      .email({ message: VALIDATION_MESSAGES.INVALID_EMAIL })
      .min(1, VALIDATION_MESSAGES.EMAIL_REQUIRED),
    password: z.string()
      .min(8, VALIDATION_MESSAGES.PASSWORD_SHORT)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, VALIDATION_MESSAGES.PASSWORD_WEAK),
    acceptedTerms: z.literal(true, { message: VALIDATION_MESSAGES.TERMS_REQUIRED }),
    referralCode: z.string()
      .optional()
      .transform((v) => (typeof v === "string" ? v.trim() : v))
      .transform((v) => v || undefined),
    fullName: z.string()
      .min(2, VALIDATION_MESSAGES.FULL_NAME_REQUIRED)
      .max(100, 'Full name cannot exceed 100 characters'),
  }),
  
  login: z.object({
    emailOrPhone: z.string()
      .min(1, 'Email or phone number is required'),
    password: z.string()
      .min(1, 'Password is required'),
  }),
  
  // Legacy support for mobile-only login
  loginLegacy: z.object({
    mobile: z.string()
      .min(10, VALIDATION_MESSAGES.MOBILE_INVALID)
      .max(15, VALIDATION_MESSAGES.MOBILE_INVALID),
    password: z.string()
      .min(1, 'Password is required'),
  }),
  
  updateProfile: z.object({
    name: z.string()
      .min(2, VALIDATION_MESSAGES.NAME_TOO_SHORT)
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    email: z.string()
      .email({ message: VALIDATION_MESSAGES.INVALID_EMAIL })
      .optional()
      .or(z.literal('')),
    fullName: z.string()
      .min(2, VALIDATION_MESSAGES.FULL_NAME_REQUIRED)
      .max(100, 'Full name cannot exceed 100 characters')
      .optional(),
  }).refine((v) => Object.keys(v).length > 0, {
    message: 'Please provide at least one field to update'
  })
};

export const serviceValidation = {
  create: z.object({
    name: z.string()
      .min(2, VALIDATION_MESSAGES.SERVICE_NAME_REQUIRED)
      .max(100, 'Service name cannot exceed 100 characters'),
    description: z.string()
      .min(10, VALIDATION_MESSAGES.DESCRIPTION_REQUIRED)
      .max(2000, 'Description cannot exceed 2000 characters'),
    price: z.number()
      .min(0, VALIDATION_MESSAGES.SERVICE_PRICE_INVALID)
      .max(999999, 'Price cannot exceed 999,999'),
    categoryId: z.string()
      .min(1, VALIDATION_MESSAGES.CATEGORY_REQUIRED),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
  }),
  
  update: z.object({
    name: z.string()
      .min(2, VALIDATION_MESSAGES.SERVICE_NAME_REQUIRED)
      .max(100, 'Service name cannot exceed 100 characters')
      .optional(),
    description: z.string()
      .min(10, VALIDATION_MESSAGES.DESCRIPTION_REQUIRED)
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
    price: z.number()
      .min(0, VALIDATION_MESSAGES.SERVICE_PRICE_INVALID)
      .max(999999, 'Price cannot exceed 999,999')
      .optional(),
    categoryId: z.string()
      .min(1, VALIDATION_MESSAGES.CATEGORY_REQUIRED)
      .optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }).refine((v) => Object.keys(v).length > 0, {
    message: 'Please provide at least one field to update'
  })
};

export const categoryValidation = {
  create: z.object({
    name: z.string()
      .min(2, 'Category name must be at least 2 characters')
      .max(50, 'Category name cannot exceed 50 characters'),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    isActive: z.boolean().default(true),
  }),
  
  update: z.object({
    name: z.string()
      .min(2, 'Category name must be at least 2 characters')
      .max(50, 'Category name cannot exceed 50 characters')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    isActive: z.boolean().optional(),
  }).refine((v) => Object.keys(v).length > 0, {
    message: 'Please provide at least one field to update'
  })
};

// Error response helper
export function sendValidationError(res: any, message: string, status: number = 400) {
  return res.status(status).json({ 
    error: message,
    type: 'validation_error'
  });
}

// Success response helper
export function sendSuccessResponse(res: any, data: any, message: string = 'Success') {
  return res.status(200).json({ 
    success: true,
    message,
    data
  });
}
