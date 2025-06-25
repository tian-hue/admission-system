import { promises as fsPromises } from "fs";
import * as fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import { Admission } from "@prisma/client";

export const generatePDF = async (admission: Admission): Promise<string> => {
  const pdfDir = path.join(process.cwd(), "public", "pdfs");
  console.log("Checking directory:", pdfDir);
  if (!fs.existsSync(pdfDir)) {
    console.log("Creating directory:", pdfDir);
    await fsPromises.mkdir(pdfDir, { recursive: true });
  }

  const pdfFilePath = path.join(pdfDir, `admission_${admission.id}.pdf`);
  console.log("Generating PDF at:", pdfFilePath);
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(pdfFilePath));

  doc.fontSize(20).text("Bukti Pendaftaran", { align: "center" });
  doc.moveDown();
  doc
    .fontSize(12)
    .text(`Nama: ${admission.name}`)
    .text(`Email: ${admission.email}`)
    .text(`Telepon: ${admission.phone}`)
    .text(`Alamat: ${admission.address}`)
    .text(
      `Tanggal Pendaftaran: ${new Date(
        admission.createdAt
      ).toLocaleDateString()}`
    );

  doc.end();

  return new Promise((resolve) => {
    doc.on("finish", () => {
      console.log("PDF generation completed:", pdfFilePath);
      resolve(pdfFilePath);
    });
    doc.on("error", (err) => {
      console.error("PDF generation error:", err);
    });
  });
};
