import { Repository } from "typeorm";
import { Address } from "./addresses.entity";
import { AppDataSource } from "../../db/data-source";
import {
    CreateAddressRequest,
    UpdateAddressRequest,
    AddressResponse,
    FormattedAddress
} from "./address.types";
import { NotFoundError, ValidationError } from "../auth/auth.types";
import { validatePhone, validateLength } from "../../utils/validator";

export class AddressService {
    private addressRepository: Repository<Address>;

    constructor() {
        this.addressRepository = AppDataSource.getRepository(Address);
    }

    // ============== GET ALL ADDRESSES ==============

    async getAddresses(userId: number): Promise<AddressResponse[]> {
        const addresses = await this.addressRepository.find({
            where: { user_id: userId },
            order: { is_default: "DESC", created_at: "DESC" }
        });

        return addresses.map(addr => this.toAddressResponse(addr));
    }

    // ============== GET ADDRESS BY ID ==============

    async getAddressById(userId: number, addressId: number): Promise<AddressResponse> {
        const address = await this.addressRepository.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!address) {
            throw new NotFoundError("Address not found");
        }

        return this.toAddressResponse(address);
    }

    // ============== GET DEFAULT ADDRESS ==============

    async getDefaultAddress(userId: number): Promise<AddressResponse | null> {
        const address = await this.addressRepository.findOne({
            where: { user_id: userId, is_default: true }
        });

        if (!address) {
            // Return first address if no default
            const firstAddress = await this.addressRepository.findOne({
                where: { user_id: userId },
                order: { created_at: "ASC" }
            });

            return firstAddress ? this.toAddressResponse(firstAddress) : null;
        }

        return this.toAddressResponse(address);
    }

    // ============== CREATE ADDRESS ==============

    async createAddress(userId: number, data: CreateAddressRequest): Promise<AddressResponse> {
        // Validate
        this.validateAddressData(data);

        // If this is the first address or is_default is true, set as default
        const existingAddresses = await this.addressRepository.count({
            where: { user_id: userId }
        });

        const isDefault = existingAddresses === 0 || data.is_default === true;

        // If setting as default, unset other defaults
        if (isDefault) {
            await this.addressRepository.update(
                { user_id: userId, is_default: true },
                { is_default: false }
            );
        }

        const address = this.addressRepository.create({
            user_id: userId,
            name: data.name.trim(),
            phone: data.phone.trim(),
            line1: data.line1.trim(),
            line2: data.line2?.trim() || "",
            city: data.city.trim(),
            state: data.state.trim(),
            country: data.country.trim(),
            pincode: data.pincode.trim(),
            is_default: isDefault
        });

        await this.addressRepository.save(address);

        return this.toAddressResponse(address);
    }

    // ============== UPDATE ADDRESS ==============

    async updateAddress(userId: number, addressId: number, data: UpdateAddressRequest): Promise<AddressResponse> {
        const address = await this.addressRepository.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!address) {
            throw new NotFoundError("Address not found");
        }

        // Validate and update fields
        if (data.name !== undefined) {
            validateLength(data.name, "Name", 2, 100);
            address.name = data.name.trim();
        }

        if (data.phone !== undefined) {
            validatePhone(data.phone);
            address.phone = data.phone.trim();
        }

        if (data.line1 !== undefined) {
            validateLength(data.line1, "Address line 1", 5, 200);
            address.line1 = data.line1.trim();
        }

        if (data.line2 !== undefined) {
            address.line2 = data.line2.trim();
        }

        if (data.city !== undefined) {
            validateLength(data.city, "City", 2, 100);
            address.city = data.city.trim();
        }

        if (data.state !== undefined) {
            validateLength(data.state, "State", 2, 100);
            address.state = data.state.trim();
        }

        if (data.country !== undefined) {
            validateLength(data.country, "Country", 2, 100);
            address.country = data.country.trim();
        }

        if (data.pincode !== undefined) {
            validateLength(data.pincode, "Pincode", 4, 10);
            address.pincode = data.pincode.trim();
        }

        if (data.is_default === true && !address.is_default) {
            // Unset other defaults
            await this.addressRepository.update(
                { user_id: userId, is_default: true },
                { is_default: false }
            );
            address.is_default = true;
        }

        await this.addressRepository.save(address);

        return this.toAddressResponse(address);
    }

    // ============== SET DEFAULT ADDRESS ==============

    async setDefaultAddress(userId: number, addressId: number): Promise<AddressResponse> {
        const address = await this.addressRepository.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!address) {
            throw new NotFoundError("Address not found");
        }

        // Unset other defaults
        await this.addressRepository.update(
            { user_id: userId, is_default: true },
            { is_default: false }
        );

        // Set this as default
        address.is_default = true;
        await this.addressRepository.save(address);

        return this.toAddressResponse(address);
    }

    // ============== DELETE ADDRESS ==============

    async deleteAddress(userId: number, addressId: number): Promise<void> {
        const address = await this.addressRepository.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!address) {
            throw new NotFoundError("Address not found");
        }

        const wasDefault = address.is_default;

        await this.addressRepository.remove(address);

        // If deleted address was default, set another one as default
        if (wasDefault) {
            const nextAddress = await this.addressRepository.findOne({
                where: { user_id: userId },
                order: { created_at: "ASC" }
            });

            if (nextAddress) {
                nextAddress.is_default = true;
                await this.addressRepository.save(nextAddress);
            }
        }
    }

    // ============== GET FORMATTED ADDRESSES ==============

    async getFormattedAddresses(userId: number): Promise<FormattedAddress[]> {
        const addresses = await this.addressRepository.find({
            where: { user_id: userId },
            order: { is_default: "DESC", created_at: "DESC" }
        });

        return addresses.map(addr => ({
            id: addr.id,
            name: addr.name,
            phone: addr.phone,
            full_address: this.formatFullAddress(addr),
            is_default: addr.is_default
        }));
    }

    // ============== HELPER METHODS ==============

    private validateAddressData(data: CreateAddressRequest): void {
        validateLength(data.name, "Name", 2, 100);
        validatePhone(data.phone);
        validateLength(data.line1, "Address line 1", 5, 200);
        validateLength(data.city, "City", 2, 100);
        validateLength(data.state, "State", 2, 100);
        validateLength(data.country, "Country", 2, 100);
        validateLength(data.pincode, "Pincode", 4, 10);
    }

    private formatFullAddress(address: Address): string {
        const parts = [
            address.line1,
            address.line2,
            address.city,
            address.state,
            address.pincode,
            address.country
        ].filter(Boolean);

        return parts.join(", ");
    }

    private toAddressResponse(address: Address): AddressResponse {
        return {
            id: address.id,
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 || "",
            city: address.city,
            state: address.state,
            country: address.country,
            pincode: address.pincode,
            is_default: address.is_default,
            created_at: address.created_at,
            updated_at: address.updated_at
        };
    }
}

// Export singleton instance
export const addressService = new AddressService();
