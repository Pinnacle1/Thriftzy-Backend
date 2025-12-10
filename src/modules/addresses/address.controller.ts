import { Request, Response } from "express";
import { addressService } from "./address.service";
import {
    CreateAddressRequest,
    UpdateAddressRequest
} from "./address.types";
import { AuthError } from "../auth/auth.types";

export class AddressController {

    /**
     * GET /addresses
     * Get all addresses for the current user
     */
    async getAddresses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const addresses = await addressService.getAddresses(userId);

            res.status(200).json({
                success: true,
                data: addresses
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /addresses/default
     * Get default address
     */
    async getDefaultAddress(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const address = await addressService.getDefaultAddress(userId);

            res.status(200).json({
                success: true,
                data: address
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /addresses/formatted
     * Get formatted addresses for display
     */
    async getFormattedAddresses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const addresses = await addressService.getFormattedAddresses(userId);

            res.status(200).json({
                success: true,
                data: addresses
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /addresses/:id
     * Get address by ID
     */
    async getAddressById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const addressId = parseInt(req.params.id, 10);

            if (isNaN(addressId)) {
                res.status(400).json({ success: false, message: "Invalid address ID" });
                return;
            }

            const address = await addressService.getAddressById(userId, addressId);

            res.status(200).json({
                success: true,
                data: address
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /addresses
     * Create a new address
     */
    async createAddress(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: CreateAddressRequest = req.body;

            // Validate required fields
            if (!data.name || !data.phone || !data.line1 || !data.city || !data.state || !data.country || !data.pincode) {
                res.status(400).json({
                    success: false,
                    message: "name, phone, line1, city, state, country, and pincode are required"
                });
                return;
            }

            const address = await addressService.createAddress(userId, data);

            res.status(201).json({
                success: true,
                message: "Address created successfully",
                data: address
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PATCH /addresses/:id
     * Update an address
     */
    async updateAddress(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const addressId = parseInt(req.params.id, 10);
            const data: UpdateAddressRequest = req.body;

            if (isNaN(addressId)) {
                res.status(400).json({ success: false, message: "Invalid address ID" });
                return;
            }

            const address = await addressService.updateAddress(userId, addressId, data);

            res.status(200).json({
                success: true,
                message: "Address updated successfully",
                data: address
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PUT /addresses/:id/default
     * Set address as default
     */
    async setDefaultAddress(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const addressId = parseInt(req.params.id, 10);

            if (isNaN(addressId)) {
                res.status(400).json({ success: false, message: "Invalid address ID" });
                return;
            }

            const address = await addressService.setDefaultAddress(userId, addressId);

            res.status(200).json({
                success: true,
                message: "Default address updated successfully",
                data: address
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /addresses/:id
     * Delete an address
     */
    async deleteAddress(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const addressId = parseInt(req.params.id, 10);

            if (isNaN(addressId)) {
                res.status(400).json({ success: false, message: "Invalid address ID" });
                return;
            }

            await addressService.deleteAddress(userId, addressId);

            res.status(200).json({
                success: true,
                message: "Address deleted successfully"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("Address Error:", error);

        if (error instanceof AuthError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

// Export singleton instance
export const addressController = new AddressController();
