import express, { Request, Response } from "express";
import pdfMake from "pdfmake";
import { Invoice } from "../types";

const app = express();
app.use(express.json());

interface PDFRequest {
  invoice: Invoice;
}

app.get("/", (_req: Request, res: Response) => {
  res.send("PDF Service is running.");
});

app.post(
  "/generate",
  async (req: Request<any, any, PDFRequest>, res: Response) => {
    try {
      // TODO: Implement PDF generation logic
      res.json({ message: "PDF generation endpoint (Implementation pending)" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
});
