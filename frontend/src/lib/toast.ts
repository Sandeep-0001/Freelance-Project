import { toast, ToastOptions } from 'react-toastify';

// Default configuration for all toasts
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

// Success toast
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...defaultOptions, ...options });
};

// Error toast
export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...defaultOptions, ...options });
};

// Warning toast
export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

// Info toast
export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...defaultOptions, ...options });
};

// Generic toast
export const showToast = (message: string, options?: ToastOptions) => {
  toast(message, { ...defaultOptions, ...options });
};

// Export toast object for advanced usage
export { toast };
