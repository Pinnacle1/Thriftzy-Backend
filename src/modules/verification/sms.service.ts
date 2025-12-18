/**
 * SMS Service using Twilio
 * 
 * Twilio offers free trial credits (~$15)
 * Sign up at: https://www.twilio.com/try-twilio
 * 
 * After signing up:
 * 1. Get your Account SID and Auth Token from Console Dashboard
 * 2. Get a Twilio phone number (free during trial)
 * 3. Set these in your .env file:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_PHONE_NUMBER
 * 
 * Note: During trial, you can only send SMS to verified phone numbers.
 * Verify numbers at: Console > Phone Numbers > Verified Caller IDs
 */

// Environment config - use getters to read at runtime (after dotenv loads)
const getConfig = () => ({
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "",
    APP_NAME: process.env.RESEND_DISPLAY_NAME || "Thriftzy",
});

interface SendSMSOptions {
    to: string;
    body: string;
}

interface SendOTPSMSOptions {
    to: string;
    otp: string;
}

interface SMSResponse {
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
 * Format phone number to E.164 format
 * Adds +91 for Indian numbers if not present
 */
export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "");

    // If it's a 10-digit Indian number, add country code
    if (cleaned.length === 10) {
        cleaned = "91" + cleaned;
    }

    // Ensure it starts with +
    if (!cleaned.startsWith("+")) {
        cleaned = "+" + cleaned;
    }

    return cleaned;
};

/**
 * OTP SMS Template
 */
const getOTPSMSTemplate = (otp: string): string => {
    const config = getConfig();
    return `Your ${config.APP_NAME} verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
};

/**
 * Send SMS using Twilio API
 */
export const sendSMS = async (options: SendSMSOptions): Promise<SMSResponse> => {
    const config = getConfig();

    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_PHONE_NUMBER) {
        console.error("Twilio credentials are not configured");
        console.error("Twilio env vars:", {
            TWILIO_ACCOUNT_SID: config.TWILIO_ACCOUNT_SID ? "SET" : "NOT SET",
            TWILIO_AUTH_TOKEN: config.TWILIO_AUTH_TOKEN ? "SET" : "NOT SET",
            TWILIO_PHONE_NUMBER: config.TWILIO_PHONE_NUMBER || "NOT SET",
        });
        return { success: false, message: "SMS service not configured" };
    }

    const formattedTo = formatPhoneNumber(options.to);

    // Format Twilio phone number if needed
    let fromNumber = config.TWILIO_PHONE_NUMBER;
    if (!fromNumber.startsWith("+")) {
        fromNumber = "+" + fromNumber;
    }

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${config.TWILIO_ACCOUNT_SID}/Messages.json`;

        const auth = Buffer.from(`${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`).toString("base64");

        const formData = new URLSearchParams();
        formData.append("To", formattedTo);
        formData.append("From", fromNumber);
        formData.append("Body", options.body);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });

        const data: any = await response.json();

        if (!response.ok) {
            console.error("Twilio API error:", data);
            return {
                success: false,
                message: data.message || "Failed to send SMS",
                data
            };
        }

        return {
            success: true,
            message: "SMS sent successfully",
            data: { sid: data.sid, status: data.status }
        };
    } catch (error) {
        console.error("SMS send error:", error);
        return { success: false, message: "Failed to send SMS" };
    }
};

/**
 * Send OTP verification SMS
 */
export const sendOTPSMS = async (options: SendOTPSMSOptions): Promise<SMSResponse> => {
    const body = getOTPSMSTemplate(options.otp);

    return sendSMS({
        to: options.to,
        body,
    });
};

export const smsService = {
    generateOTP,
    formatPhoneNumber,
    sendSMS,
    sendOTPSMS,
};
