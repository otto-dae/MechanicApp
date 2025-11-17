import express from "express";
import { DB } from "../config/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { data, error } = await DB.from("sensores").select("*");
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ data });
});

router.get("/:vehiculo", async (req, res) => {
    const { vehiculo } = req.params;

    const { data, error } = await DB
        .from("sensores")
        .select("*")
        .eq("vehiculo", vehiculo)
        .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "No hay datos de sensores para este vehículo" });

    return res.status(200).json({ data });
});

router.patch("/:vehiculo", async (req, res) => {
    const { vehiculo } = req.params;
    const body = req.body;

    const { data, error } = await DB
        .from("sensores")
        .update(body)
        .eq("vehiculo", vehiculo)
        .select()
        .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "No existe el registro para actualizar" });

    return res.status(200).json({ message: "Sensor actualizado", data });
});

export default router;
