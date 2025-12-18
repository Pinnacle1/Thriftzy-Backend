import { Repository } from "typeorm";
import { AppDataSource } from "../../db/data-source";
import { SupportTicket } from "./supportTicket.entity";
import {
    CreateSupportTicketRequest,
    UpdateSupportTicketRequest,
    SupportTicketResponse,
    SupportTicketListResponse,
    SupportTicketQueryParams,
    SupportTicketNotFoundError,
    SupportValidationError
} from "./support.types";

export class SupportService {
    private ticketRepository: Repository<SupportTicket>;

    constructor() {
        this.ticketRepository = AppDataSource.getRepository(SupportTicket);
    }

    // ============== CREATE SUPPORT TICKET ==============

    async createTicket(userId: number | null, data: CreateSupportTicketRequest): Promise<SupportTicketResponse> {
        // Validate required fields
        if (!data.name || !data.email || !data.subject || !data.message) {
            throw new SupportValidationError("Name, email, subject, and message are required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new SupportValidationError("Invalid email format");
        }

        // Create ticket
        const ticket = this.ticketRepository.create({
            user_id: userId ?? undefined,
            name: data.name.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone?.trim(),
            subject: data.subject.trim(),
            message: data.message.trim(),
            category: data.category || "other",
            status: "open",
            priority: "medium"
        });

        await this.ticketRepository.save(ticket);

        return this.toTicketResponse(ticket);
    }

    // ============== GET SUPPORT TICKETS (ADMIN) ==============

    async getTickets(params: SupportTicketQueryParams = {}): Promise<SupportTicketListResponse> {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 10, 50);
        const skip = (page - 1) * limit;

        const queryBuilder = this.ticketRepository
            .createQueryBuilder("ticket")
            .leftJoinAndSelect("ticket.user", "user");

        // Apply filters
        if (params.status) {
            queryBuilder.andWhere("ticket.status = :status", { status: params.status });
        }

        if (params.priority) {
            queryBuilder.andWhere("ticket.priority = :priority", { priority: params.priority });
        }

        if (params.category) {
            queryBuilder.andWhere("ticket.category = :category", { category: params.category });
        }

        // Get total count and results
        const [tickets, total] = await queryBuilder
            .orderBy("ticket.created_at", "DESC")
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            tickets: tickets.map(t => this.toTicketResponse(t)),
            total,
            page,
            limit
        };
    }

    // ============== GET TICKET BY ID ==============

    async getTicketById(ticketId: number): Promise<SupportTicketResponse> {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId },
            relations: ["user"]
        });

        if (!ticket) {
            throw new SupportTicketNotFoundError();
        }

        return this.toTicketResponse(ticket);
    }

    // ============== GET USER'S TICKETS ==============

    async getUserTickets(userId: number): Promise<SupportTicketResponse[]> {
        const tickets = await this.ticketRepository.find({
            where: { user_id: userId },
            order: { created_at: "DESC" }
        });

        return tickets.map(t => this.toTicketResponse(t));
    }

    // ============== UPDATE TICKET (ADMIN) ==============

    async updateTicket(
        adminId: number,
        ticketId: number,
        data: UpdateSupportTicketRequest
    ): Promise<SupportTicketResponse> {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId },
            relations: ["user"]
        });

        if (!ticket) {
            throw new SupportTicketNotFoundError();
        }

        // Update status
        if (data.status) {
            ticket.status = data.status;

            // Track resolution
            if (data.status === "resolved" || data.status === "closed") {
                ticket.resolved_by = adminId;
                ticket.resolved_at = new Date();
            }
        }

        // Update priority
        if (data.priority) {
            ticket.priority = data.priority;
        }

        // Add admin response
        if (data.admin_response) {
            ticket.admin_response = data.admin_response;
        }

        await this.ticketRepository.save(ticket);

        return this.toTicketResponse(ticket);
    }

    // ============== DELETE TICKET (ADMIN) ==============

    async deleteTicket(ticketId: number): Promise<void> {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId }
        });

        if (!ticket) {
            throw new SupportTicketNotFoundError();
        }

        await this.ticketRepository.remove(ticket);
    }

    // ============== GET STATISTICS ==============

    async getStatistics(): Promise<{
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
        closed: number;
    }> {
        const total = await this.ticketRepository.count();
        const open = await this.ticketRepository.count({ where: { status: "open" } });
        const inProgress = await this.ticketRepository.count({ where: { status: "in_progress" } });
        const resolved = await this.ticketRepository.count({ where: { status: "resolved" } });
        const closed = await this.ticketRepository.count({ where: { status: "closed" } });

        return {
            total,
            open,
            in_progress: inProgress,
            resolved,
            closed
        };
    }

    // ============== PRIVATE HELPER METHODS ==============


    private toTicketResponse(ticket: SupportTicket): SupportTicketResponse {
        return {
            id: ticket.id,
            name: ticket.name,
            email: ticket.email,
            phone: ticket.phone,
            subject: ticket.subject,
            message: ticket.message,
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            admin_response: ticket.admin_response,
            resolved_by: ticket.resolved_by,
            resolved_at: ticket.resolved_at,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            user: ticket.user ? {
                id: ticket.user.id,
                name: ticket.user.name,
                email: ticket.user.email
            } : undefined
        };
    }
}

// Export singleton instance
export const supportService = new SupportService();
