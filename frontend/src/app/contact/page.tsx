"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Clock, MapPin, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const contact = useMemo(
    () => ({
      email: "refergrow.official@gmail.com",
      phone: process.env.PHONE || "+91 90457 86127",
      hours: "Monday – Saturday: 10:00 AM – 6:00 PM IST",
      addressLine1: "Sambhariya Marketing",
      addressLine2: "India",
    }),
    []
  );

  const resetForm = () =>
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccessToast("Thanks! Your message has been sent successfully.");
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showErrorToast(errorData?.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      showErrorToast("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      {/* Hero */}
      <div className="border-b border-[var(--gray-200)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              {/* <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-1 text-xs font-bold text-[var(--gray-700)]">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                Support • Sales • Queries
              </div> */}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-900)] tracking-tight">
                Contact Us
              </h1>
              <p className="text-[var(--gray-700)] max-w-2xl">
                Have questions about services, referrals, or marketplace setup? Send a message and we’ll respond soon.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--gray-800)] shadow-sm hover:bg-[var(--gray-50)] transition"
              >
                <Mail className="h-4 w-4 text-[var(--primary)]" />
                Email us
              </a>
              <a
                href={`tel:${contact.phone.replaceAll(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition"
                style={{ background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" }}
              >
                <Phone className="h-4 w-4" />
                Call now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-[var(--gray-200)] bg-[var(--gray-50)]">
                <h2 className="text-xl font-extrabold text-[var(--gray-900)]">Send us a message</h2>
                <p className="mt-2 text-sm text-[var(--gray-700)]">
                  Share your query and our team will get back to you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-[var(--gray-800)]">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                      placeholder="John Doe"
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-[var(--gray-800)]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                      placeholder="john@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-[var(--gray-800)]">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-semibold text-[var(--gray-800)]">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-500)] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                    placeholder="Tell us more about how we can assist you..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl text-white font-bold shadow-sm transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(90deg, #22C55E 0%, #0EA5E9 100%)" }}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                <p className="text-xs text-[var(--gray-600)] text-center">
                  By submitting, you agree to be contacted back regarding your query.
                </p>
              </form>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[var(--gray-200)] bg-white shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-extrabold text-[var(--gray-900)]">Get in Touch</h2>
              <p className="mt-2 text-sm text-[var(--gray-700)]">
                Reach out via email/phone or during business hours.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[var(--gray-200)] flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--gray-900)]">Email</div>
                    <a className="text-sm text-[var(--primary)] hover:underline" href={`mailto:${contact.email}`}>
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[var(--gray-200)] flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--gray-900)]">Phone</div>
                    <a className="text-sm text-[var(--gray-800)] hover:text-[var(--primary)] transition" href={`tel:${contact.phone.replaceAll(/\s/g, "")}`}>
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[var(--gray-200)] flex items-center justify-center">
                    <Clock className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--gray-900)]">Business Hours</div>
                    <div className="text-sm text-[var(--gray-700)]">{contact.hours}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[var(--gray-200)] flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--gray-900)]">Location</div>
                    <div className="text-sm text-[var(--gray-700)]">{contact.addressLine1}</div>
                    <div className="text-sm text-[var(--gray-700)]">{contact.addressLine2}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small CTA card */}
            <div
              className="rounded-2xl p-6 sm:p-8 text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%)" }}
            >
              <h3 className="text-lg font-extrabold">Need faster support?</h3>
              <p className="mt-2 text-sm text-white/90">
                For urgent queries, call us during business hours.
              </p>
              <a
                href={`tel:${contact.phone.replaceAll(/\s/g, "")}`}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-white/15 border border-white/25 px-4 py-2.5 text-sm font-bold hover:bg-white/20 transition"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
