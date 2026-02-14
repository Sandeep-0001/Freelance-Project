import { Router } from "express";
import { z } from "zod";
import { getBusinessOpportunityEmailContent } from "@/lib/businessOpportunity";
import { sendEmail } from "@/lib/email";

const router = Router();

// Request business opportunity information
router.post("/request", async (req, res) => {
  const schema = z.object({ email: z.string().email({ message: "Invalid email format" }) });

  try {
    const body = schema.parse(req.body);
    const content = getBusinessOpportunityEmailContent();
    const result = await sendEmail({ 
      to: body.email, 
      subject: content.subject, 
      text: content.text,
      html: content.html 
    });
    
    if (!result.sent) {
      return res.status(500).json({ error: result.error || "Failed to send email" });
    }
    
    return res.json({ ok: true, emailed: result.sent });
  } catch (err: unknown) {
    console.error('Error processing business opportunity request:', err);
    const msg = err instanceof Error ? err.message : "Unable to process request. Please try again.";
    return res.status(400).json({ error: msg });
  }
});

export default router;
