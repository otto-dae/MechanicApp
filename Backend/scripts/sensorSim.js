import { DB } from '../config/database.js';

async function fillSensors() {
    while (true) {
        try {
            const { data: vehicles, error: vehicleError } = await DB.from('vehiculos').select('noserie');

            if (vehicleError) {
                console.error("Error fetching vehicles:", vehicleError.message);
                await sleep(10000);
                continue;
            }

            for (const vehicle of vehicles) {

                const { data: sensor, error: sensorError } = await DB.from("sensores").select("*").eq("vehiculo", vehicle.noserie).maybeSingle();

                if (sensorError && sensorError.code !== 'PGRST116') { 
                    console.error(`Error fetching sensor for ${vehicle.noserie}:`, sensorError.message);
                    continue;
                }

                if (!sensor) {
                    const initialValues = {
                        vehiculo: vehicle.noserie,
                        kilometraje: getRandomFloat(10000, 50000),       
                        nivelaceite: getRandomFloat(80, 100),            
                        frenos: getRandomFloat(80, 100),                 
                        nivelanticongelante: getRandomFloat(80, 100),    
                        nivelpresion: getRandomFloat(28, 35)             
                    };

                    const { error: insertError } = await DB.from("sensores").insert(initialValues);

                    if (insertError) {
                        console.error(`Failed initial sensor insert for ${vehicle.noserie}:`, insertError.message);
                    }

                } else {
                    const updatedValues = {
                        kilometraje: sensor.kilometraje + getRandomFloat(5, 15),
                        nivelaceite: sensor.nivelaceite - getRandomFloat(0.5, 1.5),
                        frenos: sensor.frenos - getRandomFloat(0.2, 1),
                        nivelanticongelante: sensor.nivelanticongelante - getRandomFloat(0.2, 1),
                        nivelpresion: sensor.nivelpresion - getRandomFloat(0.1, 0.5)
                    };

                    const { error: updateError } = await DB.from("sensores").update(updatedValues).eq("vehiculo", vehicle.noserie);

                    if (updateError) {
                        console.error(`Failed updating sensors for ${vehicle.noserie}:`, updateError.message);
                    }
                }
            }

        } catch (err) {
            console.error("Unexpected error:", err);
        }

        await sleep(10000);
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export default fillSensors;
