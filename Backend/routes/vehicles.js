import { DB } from '../config/database.js';
import express from 'express';

const router = express.Router();

// Get all vehicles
router.get("/", async (req, res) => {
  const { data, error } = await DB.from('vehiculos').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({ data });
});

// Get vehicle by ID
router.get("/:noserie", async (req, res) => {
  const { noserie } = req.params;
  
  const { data, error } = await DB
    .from('vehiculos')
    .select('*')
    .eq('noserie', noserie)
    .single();
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: "Vehicle not found" });
  }
  
  res.status(200).json({ data });
});

// Get vehicle owner
router.get("/:noserie/owner", async (req, res) => {
  const { noserie } = req.params;
  
  const { data, error } = await DB
    .from('usuarios')
    .select('*')
    .eq('vehiculo', noserie)
    .single();
    
  if (error) {
    return res.status(404).json({ error: "Owner not found" });
  }
  
  res.status(200).json({ data });
});

export default router;