"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch, readApiBody } from "@/lib/apiClient";
import { Mail, Clock, CheckCircle, Reply, User } from "lucide-react";

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "pending" | "read" | "replied";
  createdAt: string;
}

export default function AdminContactsPage() {
  useAuth({ requireAdmin: true });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await apiFetch("/api/admin/contacts");
      const body = await readApiBody(response);
      setContacts((body.json as any)?.contacts || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (contactId: string, newStatus: "pending" | "read" | "replied") => {
    try {
      const response = await apiFetch(`/api/admin/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setContacts(contacts.map(contact => 
          contact._id === contactId ? { ...contact, status: newStatus } : contact
        ));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "read":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "replied":
        return <Reply className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "read":
        return "bg-blue-100 text-blue-800";
      case "replied":
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Submissions</h1>
        <p className="text-gray-600">
          Manage and respond to contact form submissions
        </p>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contact submissions yet</h3>
          <p className="text-gray-600">
            When users submit the contact form, their messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contact.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(contact.status)}`}>
                      {getStatusIcon(contact.status)}
                      {contact.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(contact.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {contact.subject}
                  </h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {contact.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {contact.status !== "read" && (
                  <button
                    onClick={() => updateStatus(contact._id, "read")}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Mark as Read
                  </button>
                )}
                {contact.status !== "replied" && (
                  <button
                    onClick={() => updateStatus(contact._id, "replied")}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Mark as Replied
                  </button>
                )}
                {contact.status !== "pending" && (
                  <button
                    onClick={() => updateStatus(contact._id, "pending")}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Mark as Pending
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
