/**
 * Email Server - SendGrid Implementation
 * Server-only module - import only in API routes and server actions
 *
 * Once SendGrid API key is configured (see docs/SENDGRID-SETUP.md),
 * all email notifications will flow automatically.
 *
 * Configuration:
 * - SENDGRID_API_KEY: SendGrid API key (Vercel env var)
 * - FROM_EMAIL: Sender email address
 * - FROM_NAME: Sender display name
 */

// Import SendGrid only if installed and in server context
let sgMail: any = null;
try {
  if (typeof window === 'undefined') {
    sgMail = require('@sendgrid/mail');
  }
} catch (e) {
  console.warn('SendGrid package not installed - emails disabled until configured');
}

// Export as node.js runtime (prevents Next.js client-side bundling)
export const runtime = 'nodejs';

// Initialize SendGrid
if (typeof window === 'undefined' && sgMail && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'info@autonomousdesignagency.ie';
const FROM_NAME = process.env.FROM_NAME || 'Autonomous Design Agency';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || `https://autonomous-design-agency.vercel.app`;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Skip sending if SendGrid not configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('[EMAIL] SendGrid not configured. Would send:', options.to, options.subject);
    return false;
  }

  try {
    await sgMail.send({
      from: { email: FROM_EMAIL, name: FROM_NAME },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || undefined,
    });
    console.log(`[EMAIL] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error: any) {
    console.error('[EMAIL] Error:', error.response?.body || error.message);
    return false;
  }
}

/**
 * Send welcome email to new client
 */
export async function sendWelcomeEmail(clientName: string, clientEmail: string): Promise<boolean> {
  const subject = `Welcome to ${FROM_NAME}, ${clientName}!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 30px 0; }
        .logo { font-size: 24px; font-weight: bold; color: #00bcd4; }
        .content { padding: 20px 0; }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #00bcd4;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${FROM_NAME}</div>
        </div>
        <div class="content">
          <h1>Welcome, ${clientName}! 🎉</h1>
          <p>
            Thank you for signing up with ${FROM_NAME}. We're excited to help bring your project to life!
          </p>
          <p>
            Your account has been created successfully. You can now start your first project by filling out our client intake form.
          </p>
          <div style="text-align: center;">
            <a href="${APP_URL}/client/intake" class="cta-button">Start Your Project</a>
          </div>
          <p>
            If you have any questions, don't hesitate to reach out. We're here to help!
          </p>
          <p>
            Best wishes,<br>
            The ${FROM_NAME} Team
          </p>
        </div>
        <div class="footer">
          <p>
            You received this email because you signed up at ${FROM_NAME}.
          </p>
          <p>
            ${APP_URL}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: clientEmail, subject, html });
}

/**
 * Send quote notification email
 */
export async function sendQuoteNotificationEmail(
  clientName: string,
  clientEmail: string,
  projectName: string,
  amountCents: number
): Promise<boolean> {
  const amount = (amountCents / 100).toLocaleString('en-IE', { style: 'currency', currency: 'EUR' });
  const subject = `Quote Ready for "${projectName}" - €${amount}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%); color: white; text-align: center; padding: 30px 20px; border-radius: 8px; }
        .logo { font-size: 28px; font-weight: bold; color: white; }
        .content { padding: 20px 0; }
        .highlight { background-color: #f0f0f0; padding: 15px; border-left: 4px solid #00bcd4; margin: 20px 0; }
        .quote-card { border: 2px solid #00bcd4; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 36px; color: #00bcd4; font-weight: bold; }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #00bcd4;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${FROM_NAME}</div>
        </div>
        <div class="content">
          <h2>Great news, ${clientName}! ✨</h2>
          <p>
            We're thrilled to share that we've completed a detailed analysis of your project <strong>"${projectName}"</strong>.
          </p>
          <div class="quote-card">
            <p style="margin: 0; font-size: 16px;">Your Quote:</p>
            <div class="amount">${amount}</div>
            <p style="color: #666; margin: 10px 0;">
              This estimate includes design, development, quality assurance, and deployment.
            </p>
          </div>
          <div style="text-align: center;">
            <a href="${APP_URL}/dashboard" class="cta-button">View Your Quote</a>
          </div>
          <div class="highlight">
            <strong>What happens next:</strong><br>
            1. Review the detailed quote breakdown in your dashboard<br>
            2. Confirm or request adjustments<br>
            3. We'll begin work once the project is confirmed
          </div>
          <p>
            Have questions? We've added a dedicated message thread for your project where you can communicate directly with our team.
          </p>
          <p>
            Looking forward to working with you!<br>
            The ${FROM_NAME} Team
          </p>
        </div>
        <div class="footer">
          <p>
            ${APP_URL}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: clientEmail, subject, html });
}

/**
 * Send project status update email
 */
export async function sendProjectUpdateEmail(
  clientName: string,
  clientEmail: string,
  projectName: string,
  status: string
): Promise<boolean> {
  const statusMessages: Record<string, string> = {
    confirmed: 'Confirmed - We\'re starting work!',
    design: 'In Design Phase',
    development: 'In Development Phase',
    qa: 'Quality Assurance Phase',
    deployment: 'Deployment Phase',
    completed: 'Completed! 🎉',
  };

  const message = statusMessages[status] || `Status Updated: ${status}`;
  const subject = `${message} - "${projectName}"`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 30px 0; }
        .logo { font-size: 24px; font-weight: bold; color: #00bcd4; }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          background-color: #00bcd4;
          color: white;
          border-radius: 20px;
          margin: 15px 0;
        }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #00bcd4;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${FROM_NAME}</div>
        </div>
        <div class="content">
          <h2>Project Update</h2>
          <p>Hi ${clientName},</p>
          <p>
            We wanted to keep you updated on progress for <strong>"${projectName}"</strong>.
          </p>
          <div style="text-align: center;">
            <span class="status-badge">${message}</span>
          </div>
          ${status === 'completed' ? `
            <p>
              Fantastic news! Your project has been completed and is now live. 🎉
            </p>
            <p>
              We've also added a completion milestone to your project timeline.
            </p>
          ` : `
            <p>
              Check your dashboard for the latest milestones and progress updates.
            </p>
            ${status === 'confirmed' ? `
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>📬 Check your inbox:</strong> We'll send periodic updates as we complete milestones.
              </div>
            ` : ''}
          `}
          <div style="text-align: center;">
            <a href="${APP_URL}/dashboard" class="cta-button">View Project Progress</a>
          </div>
          <p>
            Have questions? As always, you can message us directly in your project dashboard.
          </p>
          <p>
            The ${FROM_NAME} Team
          </p>
        </div>
        <div class="footer">
          <p>
            ${APP_URL}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: clientEmail, subject, html });
}

/**
 * Send milestone completion email
 */
export async function sendMilestoneCompletedEmail(
  clientName: string,
  clientEmail: string,
  projectName: string,
  milestoneName: string,
  progressPercentage: number
): Promise<boolean> {
  const subject = `Milestone Completed: "${milestoneName}" - ${progressPercentage}% Complete`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 30px 0; }
        .logo { font-size: 24px; font-weight: bold; color: #00bcd4; }
        .milestone-card {
          border: 2px solid #00bcd4;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .progress-bar {
          width: 100%;
          background-color: #e0e0e0;
          border-radius: 10px;
          height: 20px;
          margin: 15px 0;
          overflow: hidden;
        }
        .progress-fill {
          width: ${progressPercentage}%;
          background: linear-gradient(90deg, #00bcd4 0%, #0097a7 100%);
          height: 100%;
        }
        .percentage {
          font-size: 32px;
          color: #00bcd4;
          font-weight: bold;
        }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #00bcd4;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${FROM_NAME}</div>
        </div>
        <div class="content">
          <h2>Milestone Achieved! 🎯</h2>
          <p>Hi ${clientName},</p>
          <p>
            We're excited to announce that we've completed a milestone for <strong>"${projectName}"</strong>:
          </p>
          <div class="milestone-card">
            <h3>${milestoneName}</h3>
            <p style="color: #666;">Milestone Complete</p>
            <p style="margin: 10px 0;">Overall Progress:</p>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <div class="percentage">${progressPercentage}%</div>
          </div>
          <div style="text-align: center;">
            <a href="${APP_URL}/dashboard" class="cta-button">View Full Progress</a>
          </div>
          <p>
            We're continuing to make great progress on your project. If you have any questions about the completed milestone or upcoming work, feel free to message us!
          </p>
          <p>
            The ${FROM_NAME} Team
          </p>
        </div>
        <div class="footer">
          <p>
            ${APP_URL}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: clientEmail, subject, html });
}
