"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { User, FileCheck, Upload, Plus, Trash2, Calendar, Briefcase, CreditCard, Users, MapPin } from "lucide-react";
import { showSuccessToast, showErrorToast, showWarningToast } from "@/lib/toast";

interface KYCData {
  fullName: string;
  fatherName: string;
  address: string;
  dob: string;
  occupation: string;
  incomeSlab: string;
  profileImage?: string;
  panNumber: string;
  panDocument?: string;
  aadhaarNumber: string;
  aadhaarDocument?: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  bankAddress: string;
  bankIfsc: string;
  bankDocument?: string;
  nominees: Array<{
    relation: string;
    name: string;
    dob: string;
    mobile: string;
  }>;
}

const incomeSlabs = [
  "Below 3 LPA",
  "3-5 LPA", 
  "5-8 LPA",
  "8-12 LPA",
  "12-20 LPA",
  "20-30 LPA",
  "Above 30 LPA"
];

const occupations = [
  "Salaried Employee",
  "Self Employed",
  "Business Owner", 
  "Professional",
  "Agriculturist",
  "Retired",
  "Student",
  "Other"
];

export default function KYCPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KYCData>({
    fullName: "",
    fatherName: "",
    address: "",
    dob: "",
    occupation: "",
    incomeSlab: "",
    panNumber: "",
    aadhaarNumber: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    bankAddress: "",
    bankIfsc: "",
    nominees: []
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && user.kycStatus === "verified") {
      router.push("/profile");
    }
  }, [user, authLoading, router]);

  const handleInputChange = (field: keyof KYCData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNomineeChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      nominees: prev.nominees.map((nominee, i) => 
        i === index ? { ...nominee, [field]: value } : nominee
      )
    }));
  };

  const addNominee = () => {
    setFormData(prev => ({
      ...prev,
      nominees: [...prev.nominees, {
        relation: "",
        name: "",
        dob: "",
        mobile: ""
      }]
    }));
  };

  const removeNominee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      nominees: prev.nominees.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (field: string, file: File) => {
    // In a real implementation, you would upload the file to a storage service
    // For now, we'll just simulate it with a URL
    const mockUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [field]: mockUrl }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.dob && formData.occupation && formData.incomeSlab && formData.address);
      case 2:
        return !!(formData.panNumber && formData.aadhaarNumber);
      case 3:
        return !!(formData.bankAccountName && formData.bankAccountNumber && formData.bankName && formData.bankAddress && formData.bankIfsc);
      case 4:
        return formData.nominees.length > 0 && formData.nominees.every(n => n.relation && n.name && n.dob && n.mobile);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      showWarningToast("Please fill in all required fields");
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/kyc", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit KYC");
      }

      showSuccessToast("KYC information submitted successfully!");
      setSuccess(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">KYC Submitted Successfully</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your KYC application has been submitted and is currently under review. We will notify you once the verification is complete.
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">KYC Verification</h1>
        <p className="text-lg text-gray-600">
          Complete your Know Your Customer (KYC) verification to access all platform features
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  step <= currentStep ? "text-blue-600" : "text-gray-500"
                }`}>
                  {step === 1 && "Personal Info"}
                  {step === 2 && "Documents"}
                  {step === 3 && "Bank Details"}
                  {step === 4 && "Nominees"}
                </p>
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-4 ${
                  step < currentStep ? "bg-blue-600" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father&apos;s Name
                </label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter father&apos;s name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation *
                </label>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select occupation</option>
                  {occupations.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Slab *
                </label>
                <select
                  value={formData.incomeSlab}
                  onChange={(e) => handleInputChange("incomeSlab", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select income slab</option>
                  {incomeSlabs.map((slab) => (
                    <option key={slab} value={slab}>{slab}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("profileImage", e.target.files[0])}
                    className="hidden"
                    id="profileImage"
                  />
                  <label
                    htmlFor="profileImage"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </label>
                  {formData.profileImage && (
                    <span className="text-sm text-green-600">Photo uploaded</span>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your complete address"
              />
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Identity Documents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number *
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter PAN number"
                  maxLength={10}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Document
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("panDocument", e.target.files[0])}
                    className="hidden"
                    id="panDocument"
                  />
                  <label
                    htmlFor="panDocument"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PAN
                  </label>
                  {formData.panDocument && (
                    <span className="text-sm text-green-600">Document uploaded</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange("aadhaarNumber", e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Aadhaar number"
                  maxLength={12}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Document
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("aadhaarDocument", e.target.files[0])}
                    className="hidden"
                    id="aadhaarDocument"
                  />
                  <label
                    htmlFor="aadhaarDocument"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Aadhaar
                  </label>
                  {formData.aadhaarDocument && (
                    <span className="text-sm text-green-600">Document uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Bank Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bank Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={formData.bankAccountName}
                  onChange={(e) => handleInputChange("bankAccountName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter account holder name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter account number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter bank name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={(e) => handleInputChange("bankIfsc", e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter IFSC code"
                  maxLength={11}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Address *
              </label>
              <textarea
                value={formData.bankAddress}
                onChange={(e) => handleInputChange("bankAddress", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter bank branch address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Document (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload("bankDocument", e.target.files[0])}
                  className="hidden"
                  id="bankDocument"
                />
                <label
                  htmlFor="bankDocument"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Bank Document
                </label>
                {formData.bankDocument && (
                  <span className="text-sm text-green-600">Document uploaded</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Nominees */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nominee Details</h2>
              <button
                onClick={addNominee}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Nominee
              </button>
            </div>
            
            {formData.nominees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Add at least one nominee to proceed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.nominees.map((nominee, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Nominee {index + 1}</h3>
                      {formData.nominees.length > 1 && (
                        <button
                          onClick={() => removeNominee(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={nominee.name}
                          onChange={(e) => handleNomineeChange(index, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter nominee name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relation *
                        </label>
                        <input
                          type="text"
                          value={nominee.relation}
                          onChange={(e) => handleNomineeChange(index, "relation", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Spouse, Son, Daughter"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          value={nominee.dob}
                          onChange={(e) => handleNomineeChange(index, "dob", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          value={nominee.mobile}
                          onChange={(e) => handleNomineeChange(index, "mobile", e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter mobile number"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!validateStep(currentStep)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!validateStep(currentStep) || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit KYC"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
