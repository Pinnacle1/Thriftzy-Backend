/**
 * Email Service using Resend
 * 
 * Resend offers 3,000 emails/month free
 * Sign up at: https://resend.com
 * 
 * After signing up:
 * 1. Get your API key from the dashboard
 * 2. Add a verified domain or use the sandbox domain (onboarding@resend.dev)
 * 3. Set RESEND_API_KEY in your .env file
 */

// Environment config - use getters to read at runtime (after dotenv loads)
const getConfig = () => ({
    RESEND_API_KEY: process.env.RESEND_API_KEY || "",
    FROM_EMAIL: process.env.FROM_EMAIL || process.env.RESEND_OVERRIDE_FROM || "onboarding@resend.dev",
    REPLY_TO: process.env.RESEND_REPLY_TO || "",
    APP_NAME: process.env.RESEND_DISPLAY_NAME || "Thriftzy",
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

interface SendOTPEmailOptions {
    to: string;
    otp: string;
    name?: string;
}

interface EmailResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * OTP Email Template
 */
const getOTPEmailTemplate = (otp: string, name?: string): { html: string; text: string } => {
    const config = getConfig();
    const greeting = name ? `Hi ${name},` : "Hi,";

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ${config.APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Logo/Header -->
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #18181b; font-size: 28px; font-weight: 700; margin: 0;">${config.APP_NAME}</h1>
                <p style="color: #71717a; font-size: 14px; margin: 8px 0 0 0;">Seller Platform</p>
            </div>
            
            <!-- Content -->
            <div style="text-align: center;">
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    ${greeting}<br><br>
                    Your verification code is:
                </p>
                
                <!-- OTP Box -->
                <div style="background: linear-gradient(135deg, #18181b 0%, #3f3f46 100%); border-radius: 12px; padding: 24px 32px; display: inline-block; margin-bottom: 24px;">
                    <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</span>
                </div>
                
                <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                    This code will expire in <strong>10 minutes</strong>.
                </p>
                
                <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
                    If you didn't request this verification code, you can safely ignore this email. 
                    Someone might have typed your email address by mistake.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e4e4e7; text-align: center;">
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} ${config.APP_NAME}. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
${greeting}

Your ${config.APP_NAME} verification code is: ${otp}

This code will expire in 10 minutes.

If you didn't request this verification code, you can safely ignore this email.

© ${new Date().getFullYear()} ${config.APP_NAME}. All rights reserved.
    `;

    return { html, text };
};

/**
 * Send email using Resend API
 */
export const sendEmail = async (options: SendEmailOptions): Promise<EmailResponse> => {
    const config = getConfig();

    if (!config.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not configured. Current value:", config.RESEND_API_KEY);
        console.error("All RESEND env vars:", {
            RESEND_API_KEY: process.env.RESEND_API_KEY ? "SET" : "NOT SET",
            FROM_EMAIL: process.env.FROM_EMAIL,
        });
        return { success: false, message: "Email service not configured" };
    }

    try {
        const emailPayload: any = {
            from: config.FROM_EMAIL,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        };

        // Add reply_to if configured
        if (config.REPLY_TO) {
            emailPayload.reply_to = config.REPLY_TO;
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${config.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
        });

        const data: any = await response.json();

        if (!response.ok) {
            console.error("Resend API error:", data);
            return { success: false, message: data.message || "Failed to send email" };
        }

        return { success: true, message: "Email sent successfully", data };
    } catch (error) {
        console.error("Email send error:", error);
        return { success: false, message: "Failed to send email" };
    }
};

/**
 * Send OTP verification email
 */
export const sendOTPEmail = async (options: SendOTPEmailOptions): Promise<EmailResponse> => {
    const config = getConfig();
    const { html, text } = getOTPEmailTemplate(options.otp, options.name);

    return sendEmail({
        to: options.to,
        subject: `${options.otp} is your ${config.APP_NAME} verification code`,
        html,
        text,
    });
};

export const emailService = {
    generateOTP,
    sendEmail,
    sendOTPEmail,
};
