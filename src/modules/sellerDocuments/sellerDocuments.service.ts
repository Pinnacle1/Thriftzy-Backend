import { Repository } from "typeorm";
import { createHash } from "crypto";
import { SellerPanKyc } from "./sellerPan.entity";
import { SellerAadhaarKyc } from "./sellerAadhar.entity";
import { SellerBankKyc } from "./sellerBank.entity";
import { SellerProfile } from "../seller/sellerProfile.entity";
import { AppDataSource } from "../../db/data-source";
import {
    SubmitPanKycRequest,
    UpdatePanKycRequest,
    SubmitAadhaarKycRequest,
    UpdateAadhaarKycRequest,
    SubmitBankKycRequest,
    UpdateBankKycRequest,
    PanKycResponse,
    AadhaarKycResponse,
    BankKycResponse,
    KycStatusResponse
} from "./sellerDocuments.types";
import { NotFoundError, ValidationError } from "../auth/auth.types";

export class SellerDocumentsService {
    private panRepository: Repository<SellerPanKyc>;
    private aadhaarRepository: Repository<SellerAadhaarKyc>;
    private bankRepository: Repository<SellerBankKyc>;
    private sellerProfileRepository: Repository<SellerProfile>;

    constructor() {
        this.panRepository = AppDataSource.getRepository(SellerPanKyc);
        this.aadhaarRepository = AppDataSource.getRepository(SellerAadhaarKyc);
        this.bankRepository = AppDataSource.getRepository(SellerBankKyc);
        this.sellerProfileRepository = AppDataSource.getRepository(SellerProfile);
    }

    // ============== HASH UTILITY ==============

    private hashValue(value: string): string {
        return createHash("sha256").update(value).digest("hex");
    }

    private getLast4(value: string): string {
        return value.slice(-4);
    }

    // ============== PAN KYC ==============

    async getPanKyc(userId: number): Promise<PanKycResponse | null> {
        const profile = await this.getSellerProfile(userId);

        const pan = await this.panRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!pan) {
            return null;
        }

        return this.toPanResponse(pan);
    }

    async submitPanKyc(userId: number, data: SubmitPanKycRequest): Promise<PanKycResponse> {
        const profile = await this.getSellerProfile(userId);

        // Validate PAN format (ABCDE1234F)
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(data.pan_number.toUpperCase())) {
            throw new ValidationError("Invalid PAN format. Expected format: ABCDE1234F");
        }

        // Check if PAN already exists
        const existing = await this.panRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (existing) {
            if (existing.verified) {
                throw new ValidationError("PAN is already verified. Cannot update.");
            }

            // Update existing PAN
            existing.pan_name = data.pan_name;
            existing.pan_last4 = this.getLast4(data.pan_number);
            existing.pan_hash = this.hashValue(data.pan_number.toUpperCase());
            existing.verified = false;
            await this.panRepository.save(existing);
            return this.toPanResponse(existing);
        }

        // Create new PAN record
        const pan = this.panRepository.create({
            seller_id: profile.id,
            pan_name: data.pan_name,
            pan_last4: this.getLast4(data.pan_number),
            pan_hash: this.hashValue(data.pan_number.toUpperCase()),
            verified: false
        });

        await this.panRepository.save(pan);
        return this.toPanResponse(pan);
    }

    async updatePanKyc(userId: number, data: UpdatePanKycRequest): Promise<PanKycResponse> {
        const profile = await this.getSellerProfile(userId);

        const pan = await this.panRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!pan) {
            throw new NotFoundError("PAN KYC record not found. Please submit PAN first.");
        }

        if (pan.verified) {
            throw new ValidationError("PAN is already verified. Cannot update.");
        }

        if (data.pan_name) {
            pan.pan_name = data.pan_name;
        }

        if (data.pan_number) {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(data.pan_number.toUpperCase())) {
                throw new ValidationError("Invalid PAN format. Expected format: ABCDE1234F");
            }
            pan.pan_last4 = this.getLast4(data.pan_number);
            pan.pan_hash = this.hashValue(data.pan_number.toUpperCase());
        }

        await this.panRepository.save(pan);
        return this.toPanResponse(pan);
    }

    async deletePanKyc(userId: number): Promise<void> {
        const profile = await this.getSellerProfile(userId);

        const pan = await this.panRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!pan) {
            throw new NotFoundError("PAN KYC record not found.");
        }

        if (pan.verified) {
            throw new ValidationError("Cannot delete verified PAN record.");
        }

        await this.panRepository.remove(pan);
    }

    // ============== AADHAAR KYC ==============

    async getAadhaarKyc(userId: number): Promise<AadhaarKycResponse | null> {
        const profile = await this.getSellerProfile(userId);

        const aadhaar = await this.aadhaarRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!aadhaar) {
            return null;
        }

        return this.toAadhaarResponse(aadhaar);
    }

    async submitAadhaarKyc(userId: number, data: SubmitAadhaarKycRequest): Promise<AadhaarKycResponse> {
        const profile = await this.getSellerProfile(userId);

        // Validate Aadhaar format (12 digits)
        const aadhaarRegex = /^\d{12}$/;
        if (!aadhaarRegex.test(data.aadhaar_number)) {
            throw new ValidationError("Invalid Aadhaar format. Expected 12 digit number.");
        }

        // Check if Aadhaar already exists
        const existing = await this.aadhaarRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (existing) {
            if (existing.verified) {
                throw new ValidationError("Aadhaar is already verified. Cannot update.");
            }

            // Update existing Aadhaar
            existing.aadhaar_name = data.aadhaar_name;
            existing.aadhaar_last4 = this.getLast4(data.aadhaar_number);
            existing.aadhaar_hash = this.hashValue(data.aadhaar_number);
            existing.verified = false;
            await this.aadhaarRepository.save(existing);
            return this.toAadhaarResponse(existing);
        }

        // Create new Aadhaar record
        const aadhaar = this.aadhaarRepository.create({
            seller_id: profile.id,
            aadhaar_name: data.aadhaar_name,
            aadhaar_last4: this.getLast4(data.aadhaar_number),
            aadhaar_hash: this.hashValue(data.aadhaar_number),
            verified: false
        });

        await this.aadhaarRepository.save(aadhaar);
        return this.toAadhaarResponse(aadhaar);
    }

    async updateAadhaarKyc(userId: number, data: UpdateAadhaarKycRequest): Promise<AadhaarKycResponse> {
        const profile = await this.getSellerProfile(userId);

        const aadhaar = await this.aadhaarRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!aadhaar) {
            throw new NotFoundError("Aadhaar KYC record not found. Please submit Aadhaar first.");
        }

        if (aadhaar.verified) {
            throw new ValidationError("Aadhaar is already verified. Cannot update.");
        }

        if (data.aadhaar_name) {
            aadhaar.aadhaar_name = data.aadhaar_name;
        }

        if (data.aadhaar_number) {
            const aadhaarRegex = /^\d{12}$/;
            if (!aadhaarRegex.test(data.aadhaar_number)) {
                throw new ValidationError("Invalid Aadhaar format. Expected 12 digit number.");
            }
            aadhaar.aadhaar_last4 = this.getLast4(data.aadhaar_number);
            aadhaar.aadhaar_hash = this.hashValue(data.aadhaar_number);
        }

        await this.aadhaarRepository.save(aadhaar);
        return this.toAadhaarResponse(aadhaar);
    }

    async deleteAadhaarKyc(userId: number): Promise<void> {
        const profile = await this.getSellerProfile(userId);

        const aadhaar = await this.aadhaarRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!aadhaar) {
            throw new NotFoundError("Aadhaar KYC record not found.");
        }

        if (aadhaar.verified) {
            throw new ValidationError("Cannot delete verified Aadhaar record.");
        }

        await this.aadhaarRepository.remove(aadhaar);
    }

    // ============== BANK KYC ==============

    async getBankKyc(userId: number): Promise<BankKycResponse | null> {
        const profile = await this.getSellerProfile(userId);

        const bank = await this.bankRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!bank) {
            return null;
        }

        return this.toBankResponse(bank);
    }

    async submitBankKyc(userId: number, data: SubmitBankKycRequest): Promise<BankKycResponse> {
        const profile = await this.getSellerProfile(userId);

        // Validate IFSC format (ABCD0123456)
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(data.ifsc_code.toUpperCase())) {
            throw new ValidationError("Invalid IFSC format. Expected format: ABCD0123456");
        }

        // Validate account number (9-18 digits typically)
        const accountRegex = /^\d{9,18}$/;
        if (!accountRegex.test(data.account_number)) {
            throw new ValidationError("Invalid account number. Expected 9-18 digit number.");
        }

        // Check if Bank already exists
        const existing = await this.bankRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (existing) {
            if (existing.verified) {
                throw new ValidationError("Bank account is already verified. Cannot update.");
            }

            // Update existing Bank
            existing.account_holder_name = data.account_holder_name;
            existing.account_last4 = this.getLast4(data.account_number);
            existing.account_hash = this.hashValue(data.account_number);
            existing.ifsc_code = data.ifsc_code.toUpperCase();
            existing.verified = false;
            await this.bankRepository.save(existing);
            return this.toBankResponse(existing);
        }

        // Create new Bank record
        const bank = this.bankRepository.create({
            seller_id: profile.id,
            account_holder_name: data.account_holder_name,
            account_last4: this.getLast4(data.account_number),
            account_hash: this.hashValue(data.account_number),
            ifsc_code: data.ifsc_code.toUpperCase(),
            verified: false
        });

        await this.bankRepository.save(bank);
        return this.toBankResponse(bank);
    }

    async updateBankKyc(userId: number, data: UpdateBankKycRequest): Promise<BankKycResponse> {
        const profile = await this.getSellerProfile(userId);

        const bank = await this.bankRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!bank) {
            throw new NotFoundError("Bank KYC record not found. Please submit bank details first.");
        }

        if (bank.verified) {
            throw new ValidationError("Bank account is already verified. Cannot update.");
        }

        if (data.account_holder_name) {
            bank.account_holder_name = data.account_holder_name;
        }

        if (data.account_number) {
            const accountRegex = /^\d{9,18}$/;
            if (!accountRegex.test(data.account_number)) {
                throw new ValidationError("Invalid account number. Expected 9-18 digit number.");
            }
            bank.account_last4 = this.getLast4(data.account_number);
            bank.account_hash = this.hashValue(data.account_number);
        }

        if (data.ifsc_code) {
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            if (!ifscRegex.test(data.ifsc_code.toUpperCase())) {
                throw new ValidationError("Invalid IFSC format. Expected format: ABCD0123456");
            }
            bank.ifsc_code = data.ifsc_code.toUpperCase();
        }

        await this.bankRepository.save(bank);
        return this.toBankResponse(bank);
    }

    async deleteBankKyc(userId: number): Promise<void> {
        const profile = await this.getSellerProfile(userId);

        const bank = await this.bankRepository.findOne({
            where: { seller_id: profile.id }
        });

        if (!bank) {
            throw new NotFoundError("Bank KYC record not found.");
        }

        if (bank.verified) {
            throw new ValidationError("Cannot delete verified bank record.");
        }

        await this.bankRepository.remove(bank);
    }

    // ============== GET OVERALL KYC STATUS ==============

    async getKycStatus(userId: number): Promise<KycStatusResponse> {
        const profile = await this.getSellerProfile(userId);

        const [pan, aadhaar, bank] = await Promise.all([
            this.panRepository.findOne({ where: { seller_id: profile.id } }),
            this.aadhaarRepository.findOne({ where: { seller_id: profile.id } }),
            this.bankRepository.findOne({ where: { seller_id: profile.id } })
        ]);

        const panStatus = pan
            ? pan.verified ? "verified" : "pending"
            : "not_submitted";

        const aadhaarStatus = aadhaar
            ? aadhaar.verified ? "verified" : "pending"
            : "not_submitted";

        const bankStatus = bank
            ? bank.verified ? "verified" : "pending"
            : "not_submitted";

        const isFullyVerified =
            panStatus === "verified" &&
            aadhaarStatus === "verified" &&
            bankStatus === "verified";

        return {
            is_fully_verified: isFullyVerified,
            pan: {
                status: panStatus as "verified" | "pending" | "not_submitted",
                data: pan ? this.toPanResponse(pan) : undefined
            },
            aadhaar: {
                status: aadhaarStatus as "verified" | "pending" | "not_submitted",
                data: aadhaar ? this.toAadhaarResponse(aadhaar) : undefined
            },
            bank: {
                status: bankStatus as "verified" | "pending" | "not_submitted",
                data: bank ? this.toBankResponse(bank) : undefined
            }
        };
    }

    // ============== HELPER METHODS ==============

    private async getSellerProfile(userId: number): Promise<SellerProfile> {
        const profile = await this.sellerProfileRepository.findOne({
            where: { user_id: userId }
        });

        if (!profile) {
            throw new NotFoundError("Seller profile not found. Please complete seller registration.");
        }

        return profile;
    }

    private toPanResponse(pan: SellerPanKyc): PanKycResponse {
        return {
            id: pan.id,
            pan_name: pan.pan_name,
            pan_last4: pan.pan_last4,
            verified: pan.verified,
            created_at: pan.created_at,
            updated_at: pan.updated_at
        };
    }

    private toAadhaarResponse(aadhaar: SellerAadhaarKyc): AadhaarKycResponse {
        return {
            id: aadhaar.id,
            aadhaar_name: aadhaar.aadhaar_name,
            aadhaar_last4: aadhaar.aadhaar_last4,
            verified: aadhaar.verified,
            created_at: aadhaar.created_at,
            updated_at: aadhaar.updated_at
        };
    }

    private toBankResponse(bank: SellerBankKyc): BankKycResponse {
        return {
            id: bank.id,
            account_holder_name: bank.account_holder_name,
            account_last4: bank.account_last4,
            ifsc_code: bank.ifsc_code,
            verified: bank.verified,
            created_at: bank.created_at,
            updated_at: bank.updated_at
        };
    }
}

// Export singleton instance
export const sellerDocumentsService = new SellerDocumentsService();
