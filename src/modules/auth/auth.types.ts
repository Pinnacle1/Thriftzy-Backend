import { User } from "../users/user.entity";

// ============== Request DTOs ==============

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: "buyer" | "seller";
}

export interface LoginRequest {
    // The login endpoint accepts either `emailOrPhone`, or `email`, or `phone` alongside `password`.
    emailOrPhone?: string;
    email?: string;
    phone?: string;
    password: string;
}

export interface GoogleOAuthRequest {
    idToken: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

// ============== Response DTOs ==============

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: UserResponse;
        tokens: TokenPair;
    };
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: "buyer" | "seller";
    created_at: Date;
}

export interface MessageResponse {
    success: boolean;
    message: string;
}

// ============== JWT Payload ==============

export interface JwtPayload {
    userId: number;
    email: string;
    role: "buyer" | "seller";
    type: "access" | "refresh";
    iat?: number;
    exp?: number;
}

// ============== Refresh Token ==============

export interface RefreshTokenRecord {
    id: number;
    user_id: number;
    token: string;
    expires_at: Date;
    is_revoked: boolean;
    device_info?: string;
    created_at: Date;
}

// ============== Google OAuth ==============

export interface GoogleUserInfo {
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
}

// ============== Role-based Access ==============

export type UserRole = "buyer" | "seller";

export interface RolePermission {
    role: UserRole;
    permissions: string[];
}

// ============== Express Request Extension ==============

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            userId?: number;
        }
    }
}

// ============== Error Types ==============

export class AuthError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = "AuthError";
        this.statusCode = statusCode;
    }
}

export class UnauthorizedError extends AuthError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
        this.name = "UnauthorizedError";
    }
}

export class ForbiddenError extends AuthError {
    constructor(message: string = "Access forbidden") {
        super(message, 403);
        this.name = "ForbiddenError";
    }
}

export class NotFoundError extends AuthError {
    constructor(message: string = "Resource not found") {
        super(message, 404);
        this.name = "NotFoundError";
    }
}

export class ConflictError extends AuthError {
    constructor(message: string = "Resource already exists") {
        super(message, 409);
        this.name = "ConflictError";
    }
}

export class ValidationError extends AuthError {
    constructor(message: string = "Validation failed") {
        super(message, 422);
        this.name = "ValidationError";
    }
}
