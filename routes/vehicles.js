import { DB } from '../config/database.js';
import express from 'express'

const router = express.Router();


router.get("/", async (req, res) => {
    const { data, error } = await DB.from('vehiculos').select('*');
    if(error){
        return res.status(500).json({error: error.message});
    }

    res.status(200).json({data});
})

export default router;