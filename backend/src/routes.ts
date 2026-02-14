import type { Express } from "express";

// Import all modular route files
import authRoutes from "@/routes/authRoutes";
import userRoutes from "@/routes/userRoutes";
import serviceRoutes from "@/routes/serviceRoutes";
import purchaseRoutes from "@/routes/purchaseRoutes";
import incomeRoutes from "@/routes/incomeRoutes";
import referralRoutes from "@/routes/referralRoutes";
import businessOpportunityRoutes from "@/routes/businessOpportunityRoutes";
import contactRoutes from "@/routes/contactRoutes";
import sliderRoutes from "@/routes/sliderRoutes";
import categoryRoutes from "@/routes/categoryRoutes";
import adminSetupRoutes from "@/routes/admin/setupRoutes";
import { registerAdminRoutes } from "@/routes/admin/index";

/**
 * Register all application routes
 * Routes are organized by feature/module for better maintainability
 */
export function registerRoutes(app: Express) {
  // ============================================================================
  // AUTHENTICATION ROUTES
  // ============================================================================
  // Register auth routes (login, register, logout, check-exists)
  // Includes rate limiting for security
  app.use("/api/auth", authRoutes);

  // ============================================================================
  // USER ROUTES
  // ============================================================================
  // Profile management, image upload, KYC submission
  app.use("/api", userRoutes);

  // ============================================================================
  // PUBLIC ROUTES
  // ============================================================================
  // Public-facing endpoints accessible without authentication
  
  // Services (public catalog)
  app.use("/api/services", serviceRoutes);

  // Categories and subcategories (public taxonomy)
  app.use("/api/categories", categoryRoutes);

  // Homepage sliders (public content)
  app.use("/api/sliders", sliderRoutes);

  // Contact form
  app.use("/api/contact", contactRoutes);

  // Business opportunity email request
  app.use("/api/business-opportunity", businessOpportunityRoutes);

  // ============================================================================
  // AUTHENTICATED USER ROUTES
  // ============================================================================
  // These routes require user authentication
  
  // Purchase management and BV distribution
  app.use("/api/purchases", purchaseRoutes);

  // Income tracking and history
  app.use("/api/income", incomeRoutes);

  // Referral tree visualization
  app.use("/api/referrals", referralRoutes);

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================
  // All admin routes are consolidated for better organization
  // Includes: dashboard, analytics, user management, service management,
  // service approval, contacts, sliders, categories, subcategories,
  // distribution rules, payment settings, KYC management
  
  // Admin setup (initial admin account creation)
  app.use("/api/admin", adminSetupRoutes);

  // All other admin functionality
  registerAdminRoutes(app);
}
