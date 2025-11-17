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
  const [creating, setCreating] = useState(false);

  // Auto-refresh every 7 seconds
  useEffect(() => {
    if (!noserie) return;

    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:3000/sensors/${noserie}`);
        const json = await res.json();

        setSensor(json.data ?? null);
        
        // Fetch owner data
        const ownerRes = await fetch(`http://localhost:3000/vehicles/${noserie}/owner`);
        if (ownerRes.ok) {
          const ownerJson = await ownerRes.json();
          setOwner(ownerJson.data);
        }
      } catch {
        setErr("Error cargando sensores");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 7000);
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

    setCreating(true);

    try {
      const res = await fetch("http://localhost:3000/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehiculo: noserie,
          mecanico: 1, // Default mechanic ID
          razon,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Error al crear reporte");
      }

      alert("Reporte creado exitosamente y email enviado al propietario");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setCreating(false);
    }
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
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Sensores del Vehículo</h1>
          <span className="px-3 py-1 text-sm font-semibold rounded-lg bg-slate-600 text-slate-50">
            {noserie}
          </span>
        </div>

        {owner ? (
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-3">Propietario</h2>
            <p className="text-slate-600 mb-1"><strong className="text-slate-700">Nombre:</strong> {owner.tmbre}</p>
            <p className="text-slate-600 mb-1"><strong className="text-slate-700">CURP:</strong> {owner.curp}</p>
            <p className="text-slate-600"><strong className="text-slate-700">Email:</strong> {owner.email}</p>
          </div>
        ) : (
          <p className="text-slate-500 mb-6">Sin información del propietario.</p>
        )}

        {/* Sensors Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {items.map((item) => (
            <div key={item.label} className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
              <p className="text-slate-500 text-sm mb-2 font-medium">{item.label}</p>
              <p className={`text-2xl font-semibold ${checkStatusColor(item.value)}`}>
                {item.value !== undefined ? item.value : "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={createReport}
            disabled={creating}
            className={`flex-1 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition ${
              creating 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-400 shadow-sm"
            }`}
          >
            {creating ? "Creando reporte..." : "Crear Reporte"}
          </button>

          <button
            onClick={() => history.back()}
            className="px-5 py-2.5 rounded-lg bg-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-300 transition shadow-sm"
          >
            ← Regresar
          </button>
        </div>
      </div>
    </main>
  );
}