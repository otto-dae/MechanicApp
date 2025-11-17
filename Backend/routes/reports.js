import PDFDocument from "pdfkit";
import { DB } from "../config/database.js";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // or use your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use app-specific password for Gmail
  },
});

/** CREATE REPORT **/
router.post("/", async (req, res) => {
  const { vehiculo, mecanico, razon } = req.body;

  if (!vehiculo || !mecanico || !razon) {
    return res.status(400).json({ 
      error: "Missing required fields: vehiculo, mecanico, razon" 
    });
  }

  try {
    // Get latest sensor data
    const { data: sensorData, error: sensorError } = await DB
      .from("sensores")
      .select("*")
      .eq("vehiculo", vehiculo)
      .order("fecha", { ascending: false })
      .limit(1)
      .single();

    if (sensorError || !sensorData) {
      return res.status(404).json({ 
        error: "No sensor data found for this vehicle" 
      });
    }

    // Get vehicle owner info
    const { data: ownerData, error: ownerError } = await DB
      .from("usuarios")
      .select("*")
      .eq("vehiculo", vehiculo)
      .single();

    if (ownerError || !ownerData) {
      return res.status(404).json({ 
        error: "No owner found for this vehicle" 
      });
    }

    // Create report in database
    const { data: newReport, error: reportError } = await DB
      .from("reportes")
      .insert({
        kilometraje: sensorData.kilometraje,
        nivelaceite: sensorData.nivelaceite,
        frenos: sensorData.frenos,
        nivelanticongelante: sensorData.nivelanticongelante,
        nivelpresion: sensorData.nivelpresion,
        vehiculo: vehiculo,
        mecanico: mecanico,
        razon: razon,
        estado: false, // pending
      })
      .select()
      .single();

    if (reportError) {
      return res.status(500).json({ error: reportError.message });
    }

    // Generate PDF
    const pdfBuffer = await generatePDFBuffer(newReport, vehiculo, ownerData);

    // Send email
    await sendReportEmail(ownerData, newReport, pdfBuffer);

    return res.status(201).json({
      message: "Report created and email sent successfully",
      report: newReport,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return res.status(500).json({ error: error.message });
  }
});

/** GET ALL REPORTS **/
router.get("/", async (req, res) => {
  const { data, error } = await DB
    .from("reportes")
    .select(`
      *,
      vehiculo_info:vehiculo (noserie, marca, linea),
      mecanico_info:mecanico (numempleado, nombre)
    `)
    .order("fecha", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ data });
});

/** PDF GENERATION ENDPOINT **/
router.get("/:id/pdf", async (req, res) => {
  const { id } = req.params;

  const { data: report, error } = await DB
    .from("reportes")
    .select(`
      *,
      vehiculo_info:vehiculo (
        noserie,
        marca,
        linea,
        usuarios:usuarios (curp, tmbre, email)
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !report) {
    return res.status(404).json({ error: "Report not found" });
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=reporte_${id}.pdf`);
  doc.pipe(res);

  // Generate PDF content
  generatePDFContent(doc, report);
  doc.end();
});

/** Helper: Generate PDF Buffer **/
async function generatePDFBuffer(report, vehiculo, owner) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // PDF Content
    doc.fontSize(20).text("Reporte de Mantenimiento Vehicular", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`ID Reporte: ${report.id}`);
    doc.text(`Vehículo: ${vehiculo}`);
    doc.text(`Mecánico: ${report.mecanico}`);
    doc.text(`Razón: ${report.razon}`);
    doc.text(`Estado: PENDIENTE`);
    doc.text(`Fecha: ${new Date(report.fecha).toLocaleDateString()}`);

    doc.moveDown();
    doc.fontSize(14).text(" Información del propietario", { underline: true });
    doc.fontSize(12);
    doc.text(`Nombre: ${owner.tmbre}`);
    doc.text(`Email: ${owner.email}`);
    doc.text(`CURP: ${owner.curp}`);

    doc.moveDown();
    doc.fontSize(14).text("📟 Lecturas de Sensores", { underline: true });
    doc.fontSize(12);
    doc.text(`Kilometraje: ${report.kilometraje}`);
    doc.text(`Nivel de Aceite: ${report.nivelaceite}`);
    doc.text(`Frenos: ${report.frenos}`);
    doc.text(`Anticongelante: ${report.nivelanticongelante}`);
    doc.text(`Presión: ${report.nivelpresion}`);

    doc.moveDown();
    doc.fontSize(10).text("Reporte generado automáticamente — © 2025", {
      align: "center",
    });

    doc.end();
  });
}

/** Helper: Generate PDF Content **/
function generatePDFContent(doc, report) {
  doc.fontSize(20).text("Reporte de Mantenimiento Vehicular", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`ID Reporte: ${report.id}`);
  doc.text(`Vehículo: ${report.vehiculo_info.noserie}`);
  doc.text(`Mecánico: ${report.mecanico}`);
  doc.text(`Razón: ${report.razon}`);
  doc.text(`Estado: ${report.estado ? "COMPLETADO" : "PENDIENTE"}`);

  if (report.vehiculo_info.usuarios) {
    doc.moveDown();
    doc.fontSize(14).text(" Información del propietario", { underline: true });
    doc.fontSize(12);
    doc.text(`Nombre: ${report.vehiculo_info.usuarios.tmbre}`);
    doc.text(`Email: ${report.vehiculo_info.usuarios.email}`);
    doc.text(`CURP: ${report.vehiculo_info.usuarios.curp}`);
  }

  doc.moveDown();
  doc.fontSize(14).text("📟 Lecturas de Sensores", { underline: true });
  doc.fontSize(12);
  doc.text(`Kilometraje: ${report.kilometraje}`);
  doc.text(`Nivel de Aceite: ${report.nivelaceite}`);
  doc.text(`Frenos: ${report.frenos}`);
  doc.text(`Anticongelante: ${report.nivelanticongelante}`);
  doc.text(`Presión: ${report.nivelpresion}`);

  doc.moveDown();
  doc.fontSize(10).text("Reporte generado automáticamente — © 2025", {
    align: "center",
  });
}

/** Helper: Send Email **/
async function sendReportEmail(owner, report, pdfBuffer) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: owner.email,
    subject: `Reporte de Mantenimiento - Vehículo ${report.vehiculo}`,
    html: `
      <h2>Reporte de Mantenimiento Vehicular</h2>
      <p>Estimado/a <strong>${owner.tmbre}</strong>,</p>
      <p>Se ha generado un nuevo reporte de mantenimiento para su vehículo.</p>
      
      <h3>Detalles del Reporte:</h3>
      <ul>
        <li><strong>ID Reporte:</strong> ${report.id}</li>
        <li><strong>Vehículo:</strong> ${report.vehiculo}</li>
        <li><strong>Razón:</strong> ${report.razon}</li>
        <li><strong>Fecha:</strong> ${new Date(report.fecha).toLocaleString()}</li>
      </ul>

      <h3>Lecturas de Sensores:</h3>
      <ul>
        <li><strong>Kilometraje:</strong> ${report.kilometraje}</li>
        <li><strong>Nivel de Aceite:</strong> ${report.nivelaceite}</li>
        <li><strong>Frenos:</strong> ${report.frenos}</li>
        <li><strong>Anticongelante:</strong> ${report.nivelanticongelante}</li>
        <li><strong>Presión:</strong> ${report.nivelpresion}</li>
      </ul>

      <p>Por favor revise el PDF adjunto para más detalles.</p>
      <p>Saludos cordiales,<br>Equipo de Mantenimiento</p>
    `,
    attachments: [
      {
        filename: `reporte_${report.id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  return transporter.sendMail(mailOptions);
}

export default router;