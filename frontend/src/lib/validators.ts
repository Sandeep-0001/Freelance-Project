import { showErrorToast } from './toast';

/**
 * Frontend validation utilities with toast notifications
 */

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    showErrorToast('Email is required');
    return false;
  }
  if (!emailRegex.test(email)) {
    showErrorToast('Invalid email format');
    return false;
  }
  return true;
}

// Phone number validation (10 digits)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  if (!phone.trim()) {
    showErrorToast('Phone number is required');
    return false;
  }
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    showErrorToast('Phone number must be 10 digits');
    return false;
  }
  return true;
}

// Password validation
export function validatePassword(password: string, minLength: number = 8): boolean {
  if (!password) {
    showErrorToast('Password is required');
    return false;
  }
  if (password.length < minLength) {
    showErrorToast(`Password must be at least ${minLength} characters long`);
    return false;
  }
  return true;
}

// Required field validation
export function validateRequired(value: string, fieldName: string): boolean {
  if (!value || !value.trim()) {
    showErrorToast(`${fieldName} is required`);
    return false;
  }
  return true;
}

// Name validation (no special characters)
export function validateName(name: string, fieldName: string = 'Name'): boolean {
  if (!name.trim()) {
    showErrorToast(`${fieldName} is required`);
    return false;
  }
  if (name.trim().length < 2) {
    showErrorToast(`${fieldName} must be at least 2 characters long`);
    return false;
  }
  return true;
}

// Numeric validation
export function validateNumeric(value: string, fieldName: string): boolean {
  if (!value.trim()) {
    showErrorToast(`${fieldName} is required`);
    return false;
  }
  if (isNaN(Number(value))) {
    showErrorToast(`${fieldName} must be a valid number`);
    return false;
  }
  return true;
}

// Min/Max validation
export function validateRange(value: number, min: number, max: number, fieldName: string): boolean {
  if (value < min || value > max) {
    showErrorToast(`${fieldName} must be between ${min} and ${max}`);
    return false;
  }
  return true;
}

// Confirm password match
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  if (password !== confirmPassword) {
    showErrorToast('Passwords do not match');
    return false;
  }
  return true;
}

// URL validation
export function validateUrl(url: string): boolean {
  if (!url.trim()) {
    return true; // Optional field
  }
  try {
    new URL(url);
    return true;
  } catch {
    showErrorToast('Invalid URL format');
    return false;
  }
}

// GST number validation (India)
export function validateGST(gst: string): boolean {
  if (!gst) return true; // Optional
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(gst)) {
    showErrorToast('Invalid GST number format');
    return false;
  }
  return true;
}

// PAN number validation (India)
export function validatePAN(pan: string): boolean {
  if (!pan) return true; // Optional
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) {
    showErrorToast('Invalid PAN number format');
    return false;
  }
  return true;
}
