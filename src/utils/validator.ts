import { ValidationError } from "../modules/auth/auth.types";

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


export const validateEmail = (email: string): void => {
    if (!email || !isValidEmail(email)) {
        throw new ValidationError("Invalid email format");
    }
};

export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
};

export const validatePhone = (phone: string): void => {
    if (!phone || !isValidPhone(phone)) {
        throw new ValidationError("Invalid phone number format");
    }
};

export interface PasswordValidationOptions {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
}

const defaultPasswordOptions: PasswordValidationOptions = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false
};

export const validatePassword = (password: string, options: PasswordValidationOptions = {}): void => {
    const opts = { ...defaultPasswordOptions, ...options };

    if (!password || password.length < (opts.minLength || 8)) {
        throw new ValidationError(`Password must be at least ${opts.minLength || 8} characters`);
    }

    if (opts.requireUppercase && !/[A-Z]/.test(password)) {
        throw new ValidationError("Password must contain at least one uppercase letter");
    }

    if (opts.requireLowercase && !/[a-z]/.test(password)) {
        throw new ValidationError("Password must contain at least one lowercase letter");
    }

    if (opts.requireNumber && !/[0-9]/.test(password)) {
        throw new ValidationError("Password must contain at least one number");
    }

    if (opts.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new ValidationError("Password must contain at least one special character");
    }
};

export const isValidPassword = (password: string, options: PasswordValidationOptions = {}): boolean => {
    try {
        validatePassword(password, options);
        return true;
    } catch {
        return false;
    }
};


export const validateName = (name: string, minLength: number = 2): void => {
    if (!name || name.trim().length < minLength) {
        throw new ValidationError(`Name must be at least ${minLength} characters`);
    }
};

export const isValidName = (name: string, minLength: number = 2): boolean => {
    return !!name && name.trim().length >= minLength;
};

export interface RegistrationData {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export const validateRegistration = (data: RegistrationData): void => {
    validateName(data.name);
    validateEmail(data.email);
    validatePhone(data.phone);
    validatePassword(data.password);
};

export const validateRequired = (value: unknown, fieldName: string): void => {
    if (value === null || value === undefined || value === "") {
        throw new ValidationError(`${fieldName} is required`);
    }
};


export const validateLength = (
    value: string | undefined | null,
    fieldName: string,
    minLength: number,
    maxLength?: number
): void => {
    if (!value || value.length < minLength) {
        throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
    }
    if (maxLength && value.length > maxLength) {
        throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`);
    }
};


export const validateRange = (
    value: number,
    fieldName: string,
    min?: number,
    max?: number
): void => {
    if (min !== undefined && value < min) {
        throw new ValidationError(`${fieldName} must be at least ${min}`);
    }
    if (max !== undefined && value > max) {
        throw new ValidationError(`${fieldName} must be at most ${max}`);
    }
};


export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};


export const validateUrl = (url: string, fieldName: string = "URL"): void => {
    if (!isValidUrl(url)) {
        throw new ValidationError(`Invalid ${fieldName} format`);
    }
};


export const validateEnum = <T>(value: T, allowedValues: T[], fieldName: string): void => {
    if (!allowedValues.includes(value)) {
        throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(", ")}`);
    }
};


export const sanitizeString = (value: string | null | undefined): string => {
    return (value || "").trim();
};


export const sanitizeEmail = (email: string): string => {
    return sanitizeString(email).toLowerCase();
};

export const sanitizePhone = (phone: string): string => {
    return sanitizeString(phone).replace(/[\s\-\(\)\.]/g, "");
};
