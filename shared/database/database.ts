import { Pool } from 'pg';
import { 
    User, 
    Client, 
    Invoice, 
    CreateClientRequest, 
    CreateInvoiceRequest,
    MessengerPlatform,
    ClientWithInvoiceCount 
} from '../types';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

export class DatabaseService {
    // User operations
    async getUserByPlatformId(platformId: string, platformType: MessengerPlatform): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE platform_id = $1 AND platform_type = $2',
            [platformId, platformType]
        );
        return result.rows[0] || null;
    }

    // Client operations
    async createClient(userId: number, client: CreateClientRequest): Promise<Client> {
        const result = await pool.query(
            `INSERT INTO clients (user_id, name, abn, email, phone, address)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [userId, client.name, client.abn, client.email, client.phone, client.address]
        );
        return result.rows[0];
    }

    async getClientsByUserId(userId: number): Promise<ClientWithInvoiceCount[]> {
        const result = await pool.query(
            `SELECT 
                c.*,
                COUNT(i.id) as invoice_count,
                COALESCE(SUM(i.amount), 0) as total_amount
             FROM clients c
             LEFT JOIN invoices i ON c.id = i.client_id
             WHERE c.user_id = $1
             GROUP BY c.id
             ORDER BY c.is_favorite DESC, c.name ASC`,
            [userId]
        );
        return result.rows;
    }

    // Invoice operations
    async createInvoice(userId: number, invoice: CreateInvoiceRequest): Promise<Invoice> {
        const client = await this.getClientById(invoice.client_id);
        if (!client || client.user_id !== userId) {
            throw new Error('Client not found or does not belong to user');
        }

        // Get next invoice number
        const user = await pool.query('SELECT last_invoice_number FROM users WHERE id = $1', [userId]);
        const nextInvoiceNumber = (user.rows[0].last_invoice_number || 0) + 1;

        // Start transaction
        const client_pg = await pool.connect();
        try {
            await client_pg.query('BEGIN');

            // Create invoice
            const result = await client_pg.query(
                `INSERT INTO invoices (
                    user_id, client_id, invoice_number, date, description,
                    amount, gst_included, pdf_url
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [
                    userId,
                    invoice.client_id,
                    nextInvoiceNumber,
                    invoice.date || new Date(),
                    invoice.description,
                    invoice.amount,
                    invoice.gst_included,
                    '' // PDF URL will be updated later
                ]
            );

            // Update user's last invoice number
            await client_pg.query(
                'UPDATE users SET last_invoice_number = $1 WHERE id = $2',
                [nextInvoiceNumber, userId]
            );

            await client_pg.query('COMMIT');
            return result.rows[0];
        } catch (e) {
            await client_pg.query('ROLLBACK');
            throw e;
        } finally {
            client_pg.release();
        }
    }

    private async getClientById(clientId: number): Promise<Client | null> {
        const result = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
        return result.rows[0] || null;
    }
}
