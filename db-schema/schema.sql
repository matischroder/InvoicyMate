-- PostgreSQL schema for InvoicyMate

CREATE TABLE users (
    facebook_id VARCHAR(64) PRIMARY KEY,
    name TEXT NOT NULL,
    abn VARCHAR(20) NOT NULL,
    email TEXT,
    gst_registered BOOLEAN NOT NULL DEFAULT FALSE,
    last_invoice_number INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    facebook_id VARCHAR(64) REFERENCES users(facebook_id),
    invoice_number INTEGER NOT NULL,
    date DATE NOT NULL,
    client_name TEXT NOT NULL,
    client_abn VARCHAR(20),
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    gst_included BOOLEAN NOT NULL,
    pdf_url TEXT NOT NULL
);

CREATE INDEX idx_invoices_facebook_id ON invoices(facebook_id);
