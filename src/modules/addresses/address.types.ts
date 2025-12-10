// ============== Request DTOs ==============

export interface CreateAddressRequest {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    is_default?: boolean;
}

export interface UpdateAddressRequest {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    is_default?: boolean;
}

// ============== Response DTOs ==============

export interface AddressResponse {
    id: number;
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface AddressListResponse {
    success: boolean;
    data: AddressResponse[];
}

export interface SingleAddressResponse {
    success: boolean;
    data: AddressResponse;
}

export interface MessageResponse {
    success: boolean;
    message: string;
}

// ============== Formatted Address ==============

export interface FormattedAddress {
    id: number;
    name: string;
    phone: string;
    full_address: string;
    is_default: boolean;
}
