import { DatabaseService } from "../services/database";
import {
  User,
  Client,
  CreateClientRequest,
  CreateInvoiceRequest,
  ClientWithInvoiceCount,
} from "../types";

interface ParsedCommand {
  action:
    | "create_invoice"
    | "list_clients"
    | "add_client"
    | "list_invoices"
    | "help";
  params: Record<string, any>;
}

export class BotAIService {
  constructor(private db: DatabaseService) {}

  async processMessage(userId: number, message: string): Promise<string> {
    try {
      const command = await this.parseUserIntent(message);
      return await this.executeCommand(userId, command);
    } catch (error) {
      console.error("Error processing message:", error);
      return "Lo siento, hubo un error procesando tu mensaje. ¿Podrías intentarlo de nuevo?";
    }
  }

  private async parseUserIntent(message: string): Promise<ParsedCommand> {
    const lowerMessage = message.toLowerCase();

    // Crear factura
    if (lowerMessage.includes("factura") || lowerMessage.includes("invoice")) {
      const amount = this.extractAmount(message);
      if (amount) {
        return {
          action: "create_invoice",
          params: { amount },
        };
      }
    }

    // Listar clientes
    if (lowerMessage.includes("clientes") || lowerMessage.includes("clients")) {
      return {
        action: "list_clients",
        params: {},
      };
    }

    // Agregar cliente
    if (
      lowerMessage.includes("agregar cliente") ||
      lowerMessage.includes("add client")
    ) {
      const clientInfo = this.extractClientInfo(message);
      return {
        action: "add_client",
        params: clientInfo,
      };
    }

    // Ver facturas
    if (
      lowerMessage.includes("ver facturas") ||
      lowerMessage.includes("mostrar facturas")
    ) {
      return {
        action: "list_invoices",
        params: {},
      };
    }

    // Default: Help
    return {
      action: "help",
      params: {},
    };
  }

  private async executeCommand(
    userId: number,
    command: ParsedCommand
  ): Promise<string> {
    switch (command.action) {
      case "create_invoice":
        if (!command.params.clientId) {
          const clients = await this.db.getClientsByUserId(userId);
          if (clients.length === 0) {
            return 'Primero necesitas agregar un cliente. Usa el comando "agregar cliente"';
          }
          return this.formatClientSelection(clients);
        }
        // TODO: Implement invoice creation logic
        return "Creando factura...";

      case "list_clients":
        const clients = await this.db.getClientsByUserId(userId);
        return this.formatClientList(clients);

      case "add_client":
        const clientRequest: CreateClientRequest = {
          name: command.params.name || "",
          abn: command.params.abn,
          email: command.params.email,
          phone: command.params.phone,
          address: command.params.address,
        };
        if (!clientRequest.name) {
          return "¿Cuál es el nombre del cliente que quieres agregar?";
        }
        await this.db.createClient(userId, clientRequest);
        return `Cliente "${clientRequest.name}" agregado exitosamente.`;

      case "list_invoices":
        // TODO: Implement invoice listing logic
        return "Mostrando facturas...";

      case "help":
      default:
        return this.getHelpMessage();
    }
  }

  private extractAmount(message: string): number | null {
    const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
    return amountMatch ? parseFloat(amountMatch[1]) : null;
  }

  private extractClientInfo(message: string): Partial<CreateClientRequest> {
    // TODO: Implement more sophisticated client info extraction
    const nameMatch = message.match(
      /(?:agregar cliente|add client)\s+(.+?)(?:\s+abn|\s*$)/i
    );
    const abnMatch = message.match(/abn\s+([A-Z0-9\s]+)/i);

    return {
      name: nameMatch ? nameMatch[1].trim() : "",
      abn: abnMatch ? abnMatch[1].trim() : undefined,
    };
  }

  private formatClientList(clients: ClientWithInvoiceCount[]): string {
    if (clients.length === 0) {
      return 'No tienes clientes registrados aún. Usa "agregar cliente" para crear uno nuevo.';
    }

    return (
      "Tus clientes:\n\n" +
      clients
        .map(
          (client) =>
            `${client.name}${client.is_favorite ? " ⭐" : ""}\n` +
            `${client.invoice_count} facturas - Total: $${client.total_amount}\n`
        )
        .join("\n")
    );
  }

  private formatClientSelection(clients: ClientWithInvoiceCount[]): string {
    return (
      "Selecciona un cliente para la factura:\n\n" +
      clients
        .map(
          (client, index) =>
            `${index + 1}. ${client.name}${client.is_favorite ? " ⭐" : ""}`
        )
        .join("\n") +
      "\n\nResponde con el número del cliente."
    );
  }

  private getHelpMessage(): string {
    return `¡Hola! Puedo ayudarte con:

1. Crear facturas:
   "Crear factura por $100"
   "Nueva factura para [cliente] por $500"

2. Gestionar clientes:
   "Agregar cliente Juan Pérez"
   "Ver clientes"
   "Agregar cliente Juan Pérez ABN 12345678"

3. Ver facturas:
   "Ver mis facturas"
   "Mostrar facturas de [cliente]"

¿En qué te puedo ayudar?`;
  }
}
