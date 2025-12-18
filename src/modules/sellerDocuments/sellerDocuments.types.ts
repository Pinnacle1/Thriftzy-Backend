// ============== Request DTOs ==============

// PAN Card KYC
export interface SubmitPanKycRequest {
    pan_name: string;
    pan_number: string; // Full PAN number, will be hashed
}

export interface UpdatePanKycRequest {
    pan_name?: string;
    pan_number?: string;
}

// Aadhaar KYC  
export interface SubmitAadhaarKycRequest {
    aadhaar_name: string;
    aadhaar_number: string; // Full Aadhaar number, will be hashed
}

export interface UpdateAadhaarKycRequest {
    aadhaar_name?: string;
    aadhaar_number?: string;
}

// Bank Account KYC
export interface SubmitBankKycRequest {
    account_holder_name: string;
    account_number: string; // Full account number, will be hashed
    ifsc_code: string;
}

export interface UpdateBankKycRequest {
    account_holder_name?: string;
    account_number?: string;
    ifsc_code?: string;
}

// ============== Response DTOs ==============

export interface PanKycResponse {
    id: number;
    pan_name: string;
    pan_last4: string;
    verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface AadhaarKycResponse {
    id: number;
    aadhaar_name: string;
    aadhaar_last4: string;
    verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface BankKycResponse {
    id: number;
    account_holder_name: string;
    account_last4: string;
    ifsc_code: string;
    verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface KycStatusResponse {
    is_fully_verified: boolean;
    pan: {
        status: "verified" | "pending" | "not_submitted";
        data?: PanKycResponse;
    };
    aadhaar: {
        status: "verified" | "pending" | "not_submitted";
        data?: AadhaarKycResponse;
    };
    bank: {
        status: "verified" | "pending" | "not_submitted";
        data?: BankKycResponse;
    };
}

export interface MessageResponse {
    success: boolean;
    message: string;
}
