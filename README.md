# InvoicyMate: Messenger Invoice Bot for ABN Holders (Australia)

A Facebook Messenger chatbot for Australian ABN holders to create, manage, and retrieve legally compliant invoices via Messenger. Built with n8n (workflow automation), Node.js (PDFMake for PDF generation), and PostgreSQL (data storage).

## Project Structure

- `messenger-webhook/` — Node.js Messenger webhook handler
- `n8n-workflows/` — n8n workflow files
- `pdf-service/` — Node.js microservice for PDF invoice generation
- `db-schema/` — Database schema and migration scripts
- `.github/copilot-instructions.md` — Copilot custom instructions

## Quick Start

1. Set up PostgreSQL and configure connection.
2. Run the Messenger webhook server (see `messenger-webhook/`).
3. Deploy n8n and import workflows from `n8n-workflows/`.
4. Start the PDF service (see `pdf-service/`).

## Features

- Create, edit, and retrieve invoices via Messenger
- PDF generation compliant with ATO requirements
- Per-user data storage (by Facebook ID)
- Automated invoice numbering and GST handling

## Tech Stack

- Facebook Messenger API
- n8n
- Node.js (Express, PDFMake)
- PostgreSQL

---

See each folder for implementation details.
