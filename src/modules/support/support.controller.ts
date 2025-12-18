import { Request, Response } from "express";
import { supportService } from "./support.service";
import {
    CreateSupportTicketRequest,
    UpdateSupportTicketRequest,
    SupportTicketQueryParams,
    SupportTicketNotFoundError,
    SupportValidationError
} from "./support.types";

export class SupportController {
    /**
     * POST /support/tickets
     * Create a new support ticket
     * Can be submitted by authenticated users or anonymously
     */
    async createTicket(req: Request, res: Response): Promise<void> {
        try {
            // Get user ID if authenticated (can be null for anonymous)
            const userId = req.userId || null;
            const data: CreateSupportTicketRequest = req.body;

            const ticket = await supportService.createTicket(userId, data);

            res.status(201).json({
                success: true,
                message: "Support ticket created successfully",
                data: ticket
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * GET /support/tickets
     * Get all support tickets with optional filtering
     * Admin only
     */
    async getTickets(req: Request, res: Response): Promise<void> {
        try {
            const params: SupportTicketQueryParams = {
                status: req.query.status as SupportTicketQueryParams["status"],
                priority: req.query.priority as SupportTicketQueryParams["priority"],
                category: req.query.category as SupportTicketQueryParams["category"],
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10
            };

            const result = await supportService.getTickets(params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * GET /support/tickets/:id
     * Get a single support ticket by ID
     */
    async getTicketById(req: Request, res: Response): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id, 10);

            if (isNaN(ticketId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid ticket ID"
                });
                return;
            }

            const ticket = await supportService.getTicketById(ticketId);

            res.status(200).json({
                success: true,
                data: ticket
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * GET /support/tickets/my
     * Get all tickets for the authenticated user
     */
    async getMyTickets(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const tickets = await supportService.getUserTickets(userId);

            res.status(200).json({
                success: true,
                data: tickets
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * PATCH /support/tickets/:id
     * Update a support ticket (admin only)
     */
    async updateTicket(req: Request, res: Response): Promise<void> {
        try {
            const adminId = req.adminId!;
            const ticketId = parseInt(req.params.id, 10);

            if (isNaN(ticketId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid ticket ID"
                });
                return;
            }

            const data: UpdateSupportTicketRequest = req.body;
            const ticket = await supportService.updateTicket(adminId, ticketId, data);

            res.status(200).json({
                success: true,
                message: "Ticket updated successfully",
                data: ticket
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * DELETE /support/tickets/:id
     * Delete a support ticket (admin only)
     */
    async deleteTicket(req: Request, res: Response): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id, 10);

            if (isNaN(ticketId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid ticket ID"
                });
                return;
            }

            await supportService.deleteTicket(ticketId);

            res.status(200).json({
                success: true,
                message: "Ticket deleted successfully"
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * GET /support/statistics
     * Get support ticket statistics (admin only)
     */
    async getStatistics(req: Request, res: Response): Promise<void> {
        try {
            const stats = await supportService.getStatistics();

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Centralized error handler for support controller
     */
    private handleError(res: Response, error: unknown): void {
        console.error("Support Controller Error:", error);

        if (error instanceof SupportTicketNotFoundError) {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }

        if (error instanceof SupportValidationError) {
            res.status(422).json({
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

export const supportController = new SupportController();
