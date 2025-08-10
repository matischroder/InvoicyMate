-- PostgreSQL schema for InvoicyMate

-- Enum for different messenger platforms
CREATE TYPE messenger_platform AS ENUM ('telegram', 'facebook');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    platform_id VARCHAR(64) NOT NULL,  -- Telegram chat_id or Facebook user_id
    platform_type messenger_platform NOT NULL,
    name TEXT NOT NULL,
    abn VARCHAR(20) NOT NULL,
    email TEXT,
    gst_registered BOOLEAN NOT NULL DEFAULT FALSE,
    last_invoice_number INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform_id, platform_type)
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    name TEXT NOT NULL,
    abn VARCHAR(20),
    email TEXT,
    phone TEXT,
    address TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    last_invoice_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)  -- Evita duplicados de nombres de clientes para un mismo usuario
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    invoice_number INTEGER NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    gst_amount NUMERIC(10,2),
    gst_included BOOLEAN NOT NULL,
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled'))
);

-- Indices
CREATE INDEX idx_users_platform ON users(platform_id, platform_type);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_abn ON clients(abn);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update client's last_invoice_date
CREATE OR REPLACE FUNCTION update_client_last_invoice_date()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE clients 
    SET last_invoice_date = NEW.date
    WHERE id = NEW.client_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update client's last_invoice_date when a new invoice is created
CREATE TRIGGER update_client_invoice_date
    AFTER INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_client_last_invoice_date();
