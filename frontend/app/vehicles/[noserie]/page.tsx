"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VehicleSensorsPage() {
  const params = useParams();
  const noserie = params?.noserie as string;

  const [sensor, setSensor] = useState<any | null>(null);
  const [owner, setOwner] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Auto-refresh every 7 seconds
  useEffect(() => {
    if (!noserie) return;

    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:3000/sensors/${noserie}`);
        const json = await res.json();

        setSensor(json.data ?? null);
        setOwner(json.data?.owner ?? null);
      } catch {
        setErr("Error cargando sensores");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 7000); // Auto refresh
    return () => clearInterval(interval);
  }, [noserie]);

  // Status color helper
  const checkStatusColor = (value: any) => {
    if (value === null || value === undefined) return "text-gray-400";
    if (typeof value === "number" && value > 70) return "text-green-600 font-bold";
    if (typeof value === "number" && value > 40) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
  };

  async function createReport() {
    const razon = prompt("Razón del reporte:");
    if (!razon) return alert("Debes escribir una razón.");

    const res = await fetch("http://localhost:3000/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehiculo: noserie,
        mecanico: "Automático",
        razon,
        estado: false,
      }),
    });

    const out = await res.json();
    if (!res.ok) return alert("Error: " + out.error);
    alert("Reporte creado exitosamente");
  }

  if (loading)
    return <p className="p-6 text-gray-600 animate-pulse text-center">Cargando datos...</p>;
  if (err)
    return <p className="p-6 text-red-600 font-semibold text-center">{err}</p>;
  if (!sensor)
    return <p className="p-6 text-gray-600 text-center">No hay datos disponibles.</p>;

  const items = [
    { label: "Kilometraje", value: sensor.kilometraje },
    { label: "Nivel de Aceite", value: sensor.nivelaceite },
    { label: "Frenos", value: sensor.frenos },
    { label: "Anticongelante", value: sensor.nivelanticongelante },
    { label: "Presión", value: sensor.nivelpresion },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sensores del Vehículo</h1>
          <span className="px-3 py-1 text-sm font-semibold rounded bg-blue-600 text-white">
            {noserie}
          </span>
        </div>

        {owner ? (
          <div className="bg-white border p-4 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Propietario</h2>
            <p className="text-gray-700"><strong>Nombre:</strong> {owner.Tmbre}</p>
            <p className="text-gray-700"><strong>CURP:</strong> {owner.CURP}</p>
            <p className="text-gray-700"><strong>Email:</strong> {owner.email}</p>
          </div>
        ) : (
          <p className="text-gray-600 mb-6">Sin información del propietario.</p>
        )}

        {/* Sensors Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="bg-white p-5 border rounded-xl shadow-sm">
              <p className="text-gray-500 text-xs mb-1">{item.label}</p>
              <p className={`text-xl ${checkStatusColor(item.value)}`}>
                {item.value !== undefined ? item.value : "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={createReport}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500 transition"
          >
              Crear Reporte
          </button>

          <button
            onClick={() => history.back()}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600 transition"
          >
            ← Regresar
          </button>
        </div>
      </div>
    </main>
  );
}
