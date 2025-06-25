import { PrismaClient } from "@prisma/client";
import { generatePDF } from "../utils/pdf.generator";
import * as fs from "fs"; // Impor fs

const prisma = new PrismaClient();

export const createAdmission = async (
  data: { name: string; email: string; phone: string; address: string },
  userId: number
) => {
  const admission = await prisma.admission.create({
    data: { ...data, createdById: userId },
  });
  const pdfPath = await generatePDF(admission).catch((err) => {
    console.error("PDF generation failed:", err);
    return null;
  });
  if (pdfPath) {
    await prisma.admission.update({
      where: { id: admission.id },
      data: { pdfPath },
    });
  }
  return admission;
};

export const updateAdmission = async (
  id: number,
  data: { name?: string; email?: string; phone?: string; address?: string },
  userId: number
) => {
  const admission = await prisma.admission.update({
    where: { id },
    data: { ...data, createdById: userId },
  });
  const pdfPath = await generatePDF(admission).catch((err) => {
    console.error("PDF generation failed:", err);
    return null;
  });
  if (pdfPath) {
    await prisma.admission.update({
      where: { id: admission.id },
      data: { pdfPath },
    });
  }
  return admission;
};

export const getAdmissions = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [admissions, total] = await Promise.all([
    prisma.admission.findMany({ skip, take: limit }),
    prisma.admission.count(),
  ]);
  return { admissions, total, page, limit };
};

export const getAdmissionById = async (id: number) => {
  return prisma.admission.findUnique({ where: { id } });
};

export const deleteAdmission = async (id: number) => {
  const admission = await prisma.admission.findUnique({ where: { id } });
  if (admission?.pdfPath && fs.existsSync(admission.pdfPath)) {
    fs.unlinkSync(admission.pdfPath); // Hapus file PDF secara sinkronus
  }
  return prisma.admission.delete({ where: { id } });
};
