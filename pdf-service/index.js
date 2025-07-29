// Express server for PDF invoice generation
import express from "express";
import pdfMake from "pdfmake";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PDF Service is running.");
});

// TODO: Add endpoint to generate PDF invoices

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
});
