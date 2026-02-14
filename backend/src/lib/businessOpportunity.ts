export function getBusinessOpportunityEmailContent() {
  const subject = "Business Opportunity — BV & Level Income";

  const text = [
    "Business Opportunity",
    "",
    "Overview",
    "- The platform is open for anyone to join.",
    "- Users purchase services. Each service has a Business Volume (BV).",
    "- Income is calculated from BV (repurchases add BV again).",
    "",
    "Level-wise commission (based on BV)",
    "- Level 1: 5% of BV",
    "- Level 2: 2.5% of BV",
    "- Level 3: 1.25% of BV",
    "- Level 4: 50% of Level 3 (0.625% of BV)",
    "- Level 5+: Half of the previous level (keeps decreasing)",
    "",
    "Notes",
    "- Depth is unlimited; the percentage keeps halving.",
    "- Admin controls service price and BV values; changes apply to future purchases.",
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .container { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #7c3aed; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; margin-top: 0; }
        h2 { color: #6d28d9; margin-top: 25px; }
        ul { background: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; }
        li { margin: 8px 0; }
        .highlight { background: #ede9fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center; }
        .btn { display: inline-block; background: #7c3aed; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌱 ReferGrow Business Opportunity</h1>
        
        <h2>Overview</h2>
        <ul>
          <li>The platform is open for anyone to join.</li>
          <li>Users purchase services. Each service has a <strong>Business Volume (BV)</strong>.</li>
          <li>Income is calculated from BV (repurchases add BV again).</li>
        </ul>

        <h2>Level-wise Commission (based on BV)</h2>
        <ul>
          <li><strong>Level 1:</strong> 5% of BV</li>
          <li><strong>Level 2:</strong> 2.5% of BV</li>
          <li><strong>Level 3:</strong> 1.25% of BV</li>
          <li><strong>Level 4:</strong> 50% of Level 3 (0.625% of BV)</li>
          <li><strong>Level 5+:</strong> Half of the previous level (keeps decreasing)</li>
        </ul>

        <div class="highlight">
          <h2>Important Notes</h2>
          <ul>
            <li>Depth is <strong>unlimited</strong>; the percentage keeps halving.</li>
            <li>Admin controls service price and BV values; changes apply to future purchases.</li>
          </ul>
        </div>

        <div class="footer">
          <p><strong>Ready to get started?</strong></p>
          <a href="https://refer-grow.vercel.app" class="btn">Join ReferGrow Now</a>
          <p style="margin-top: 20px; font-size: 12px;">© 2026 ReferGrow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, text, html };
}
