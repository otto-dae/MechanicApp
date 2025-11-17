import PDFDocument from "pdfkit";
import { DB } from "../config/database.js";
import express from "express";
const router = express.Router();

/** PDF GENERATION **/
router.get("/:id/pdf", async (req, res) => {
    const { id } = req.params;

    // Fetch report + vehicle + owner
    const { data: report, error } = await DB
        .from("reportes")
        .select(`
            *,
            vehiculo_info:vehiculo (
                NoSerie:noserie,
                usuarios:usuarios (CURP, Tmbre, email)
            )
        `)
        .eq("id", id)
        .maybeSingle();

    if (error || !report) {
        return res.status(404).json({ error: "No se encontró el reporte" });
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=reporte_${id}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Reporte de Mantenimiento Vehicular", { align: "center" });
    doc.moveDown();

    // Report data
    doc.fontSize(12);
    doc.text(`ID Reporte: ${report.id}`);
    doc.text(`Vehículo: ${report.vehiculo_info.NoSerie}`);
    doc.text(`Mecánico: ${report.mecanico}`);
    doc.text(`Razón: ${report.razon}`);
    doc.text(`Estado: ${report.estado ? "COMPLETADO" : "PENDIENTE"}`);

    doc.moveDown().fontSize(14).text("👤 Información del propietario", { underline: true });
    doc.fontSize(12);
    doc.text(`Nombre: ${report.vehiculo_info.usuarios.Tmbre}`);
    doc.text(`Email: ${report.vehiculo_info.usuarios.email}`);
    doc.text(`CURP: ${report.vehiculo_info.usuarios.CURP}`);

    doc.moveDown().fontSize(14).text("📟 Lecturas de Sensores", { underline: true });
    doc.fontSize(12);
    doc.text(`Kilometraje: ${report.kilometraje}`);
    doc.text(`Nivel de Aceite: ${report.nivelaceite}`);
    doc.text(`Frenos: ${report.frenos}`);
    doc.text(`Anticongelante: ${report.nivelanticongelante}`);
    doc.text(`Presión: ${report.nivelpresion}`);

    // Footer
    doc.moveDown();
    doc.fontSize(10).text("Reporte generado automáticamente — © 2025", {
        align: "center"
    });

    doc.end();
});

export default router;
