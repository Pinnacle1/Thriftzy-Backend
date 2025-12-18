/**
 * OTP Service
 * 
 * Combines email and SMS services for OTP verification
 * Handles OTP generation, storage, and verification
 */

import { emailService, sendOTPEmail } from "./email.service";
import { smsService, sendOTPSMS } from "./sms.service";

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// OTP Configuration
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const OTP_COOLDOWN_SECONDS = 60; // Minimum time between OTP requests

// Track last OTP request time
const lastRequestStore = new Map<string, number>();

interface OTPResult {
    success: boolean;
    message: string;
}

type OTPChannel = "email" | "sms" | "both";

/**
 * Generate and store OTP
 */
const generateAndStoreOTP = (identifier: string): string => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    otpStore.set(identifier.toLowerCase(), {
        otp,
        expiresAt,
        attempts: 0,
    });

    return otp;
};

/**
 * Check cooldown before sending new OTP
 */
const checkCooldown = (identifier: string): { canSend: boolean; waitSeconds?: number } => {
    const lastRequest = lastRequestStore.get(identifier.toLowerCase());

    if (lastRequest) {
        const timeSinceLastRequest = (Date.now() - lastRequest) / 1000;
        if (timeSinceLastRequest < OTP_COOLDOWN_SECONDS) {
            return {
                canSend: false,
                waitSeconds: Math.ceil(OTP_COOLDOWN_SECONDS - timeSinceLastRequest)
            };
        }
    }

    return { canSend: true };
};

/**
 * Send OTP via email
 */
export const sendEmailOTP = async (email: string, name?: string): Promise<OTPResult> => {
    const cooldown = checkCooldown(email);
    if (!cooldown.canSend) {
        return {
            success: false,
            message: `Please wait ${cooldown.waitSeconds} seconds before requesting a new OTP`
        };
    }

    const otp = generateAndStoreOTP(email);
    lastRequestStore.set(email.toLowerCase(), Date.now());

    const result = await sendOTPEmail({ to: email, otp, name });

    if (result.success) {
        console.log(`OTP sent to email: ${email}`);
        return { success: true, message: "OTP sent to your email" };
    }

    // Remove stored OTP if sending failed
    otpStore.delete(email.toLowerCase());
    return { success: false, message: result.message };
};

/**
 * Send OTP via SMS
 */
export const sendPhoneOTP = async (phone: string): Promise<OTPResult> => {
    // const formattedPhone = smsService.formatPhoneNumber(phone);

    const cooldown = checkCooldown(phone);
    if (!cooldown.canSend) {
        return {
            success: false,
            message: `Please wait ${cooldown.waitSeconds} seconds before requesting a new OTP`
        };
    }

    const otp = generateAndStoreOTP(phone);
    lastRequestStore.set(phone, Date.now());

    const result = await sendOTPSMS({ to: phone, otp });

    if (result.success) {
        console.log(`OTP sent to phone: ${phone}`);
        return { success: true, message: "OTP sent to your phone" };
    }

    // Remove stored OTP if sending failed
    otpStore.delete(phone);
    return { success: false, message: result.message };
};

/**
 * Verify OTP
 */
export const verifyOTP = (identifier: string, otp: string): OTPResult => {
    const key = identifier.toLowerCase();
    const stored = otpStore.get(key);

    if (!stored) {
        return { success: false, message: "OTP not found. Please request a new one." };
    }

    // Check if expired
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(key);
        return { success: false, message: "OTP has expired. Please request a new one." };
    }

    // Check attempts
    if (stored.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(key);
        return { success: false, message: "Too many incorrect attempts. Please request a new OTP." };
    }

    // Verify OTP
    if (stored.otp !== otp) {
        stored.attempts++;
        otpStore.set(key, stored);
        const remaining = MAX_ATTEMPTS - stored.attempts;
        return {
            success: false,
            message: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        };
    }

    // Success - remove OTP from store
    otpStore.delete(key);
    lastRequestStore.delete(key);

    return { success: true, message: "OTP verified successfully" };
};

/**
 * Clear expired OTPs (run periodically)
 */
export const cleanupExpiredOTPs = (): void => {
    const now = Date.now();

    for (const [key, value] of otpStore.entries()) {
        if (now > value.expiresAt) {
            otpStore.delete(key);
        }
    }

    // Also cleanup old request timestamps (older than 1 hour)
    const oneHourAgo = now - 60 * 60 * 1000;
    for (const [key, timestamp] of lastRequestStore.entries()) {
        if (timestamp < oneHourAgo) {
            lastRequestStore.delete(key);
        }
    }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

export const otpService = {
    sendEmailOTP,
    sendPhoneOTP,
    verifyOTP,
    cleanupExpiredOTPs,
};
