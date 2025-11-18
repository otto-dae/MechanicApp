import { DB } from '../config/database.js';
import express from 'express';

const router = express.Router();

router.get("/", async (req, res) => {
  const { data, error } = await DB
    .from('mecanicos')
    .select('*')
    .order('numempleado', { ascending: true });
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.status(200).json({ data });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await DB
    .from('mecanicos')
    .select('*')
    .eq('numempleado', id)
    .single();
    
  if (error) {
    return res.status(404).json({ error: "Mechanic not found" });
  }
  
  res.status(200).json({ data });
});

export default router;