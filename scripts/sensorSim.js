import e from 'express';
import { DB } from '../config/database.js';

async function fillSensors() {
    while (true){

        try{
            const { data: vehicles, error: vehicleError} = await DB.from('vehiculos').select('NoSerie');

            if(error){
                return res.status(500).json({error: vehicleError.message});
            }

            if(vehicles){
                for (const item of vehicles) {
                    const {data: sensors, error: sensorError} = await DB.from('sensores').select().eq('vehiculo', item.NoSerie).single();


                    if(sensors){

                    }
                }
            }
            await sleep(10000);
        }catch{
            
        }


    }
}

async function fetchVehicles() {
    const { data, error } = await DB
        .from("vehiculos")
        .select("NoSerie");

    if (error) {
        console.error("Error fetching vehicles:", error.message);
        return [];
    }

    return data || [];
}

async function fetchSensorForVehicle(noSerie) {
    const { data, error } = await DB
        .from("sensores")
        .select("*")
        .eq("vehiculo", noSerie)
        .single();

    if (error) {
        console.error("Error fetching sensor:", error.message);
        return null;
    }

    return data;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export default fillSensors;