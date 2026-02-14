import { Router } from "express";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { ContactModel } from "@/models/Contact";

const router = Router();

// Submit contact form
router.post("/", async (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email({ message: "Invalid email format" }),
    subject: z.string().min(1),
    message: z.string().min(10),
  });

  try {
    const body = schema.parse(req.body);
    await connectToDatabase();

    // Save to database
    const contact = await ContactModel.create({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
    });

    // Send email notification to admin
    const adminEmailContent = {
      subject: `New Contact Form Submission: ${body.subject}`,
      text: `You have received a new contact form submission:

Name: ${body.name}
Email: ${body.email}
Subject: ${body.subject}
Message: ${body.message}

Submitted at: ${new Date().toLocaleString()}

This message has been saved to the database with ID: ${contact._id}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${body.name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Subject:</strong> ${body.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${body.message.replaceAll('\n', '<br>')}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Database ID:</strong> ${contact._id}</p>
      `
    };

    // Send email asynchronously - don't wait for it
    setTimeout(async () => {
      try {
        await sendEmail({
          to: "refergrow.official@gmail.com",
          subject: adminEmailContent.subject,
          text: adminEmailContent.text,
          html: adminEmailContent.html
        });
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    }, 0);

    return res.status(200).json({ 
      message: "Thank you for your message! We'll get back to you soon.",
      received: {
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
        timestamp: new Date().toISOString(),
        id: contact._id
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Bad request";
    return res.status(400).json({ error: msg });
  }
});

export default router;
