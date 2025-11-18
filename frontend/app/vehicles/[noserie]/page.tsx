"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VehicleSensorsPage() {
  const params = useParams();
  const noserie = params?.noserie as string;

  const [sensor, setSensor] = useState<any | null>(null);
  const [owner, setOwner] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [completingReport, setCompletingReport] = useState<number | null>(null);
  const [hasPendingReport, setHasPendingReport] = useState(false);

  // Fetch all data
  useEffect(() => {
    if (!noserie) return;

    async function fetchData() {
      try {
        // Fetch sensor data
        const sensorRes = await fetch(`http://localhost:3000/sensors/${noserie}`);
        const sensorJson = await sensorRes.json();
        setSensor(sensorJson.data ?? null);
        
        // Fetch owner data
        const ownerRes = await fetch(`http://localhost:3000/vehicles/${noserie}/owner`);
        if (ownerRes.ok) {
          const ownerJson = await ownerRes.json();
          setOwner(ownerJson.data);
        }

        // Fetch reports for this vehicle
        const reportsRes = await fetch(`http://localhost:3000/reports/vehicle/${noserie}`);
        if (reportsRes.ok) {
          const reportsJson = await reportsRes.json();
          setReports(reportsJson.data || []);
          
          // Check if there's any pending report
          const pendingExists = reportsJson.data?.some((r: any) => !r.estado);
          setHasPendingReport(pendingExists);
        }
      } catch {
        setErr("Error cargando datos");
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
    if (value === null || value === undefined) return "text-slate-400";
    if (typeof value === "number" && value > 70) return "text-emerald-600";
    if (typeof value === "number" && value > 40) return "text-amber-600";
    return "text-rose-600";
  };

  async function createReport() {
    if (hasPendingReport) {
      alert("No se puede crear un nuevo reporte. Hay un reporte pendiente que debe completarse primero.");
      return;
    }

    const razon = prompt("Razón del reporte:");
    if (!razon) return alert("Debes escribir una razón.");

    setCreating(true);

    try {
      const res = await fetch("http://localhost:3000/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehiculo: noserie,
          mecanico: 1,
          razon,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Error al crear reporte");
      }

      alert("Reporte creado exitosamente y email enviado al propietario");
      
      // Refresh reports
      const reportsRes = await fetch(`http://localhost:3000/reports/vehicle/${noserie}`);
      if (reportsRes.ok) {
        const reportsJson = await reportsRes.json();
        setReports(reportsJson.data || []);
        const pendingExists = reportsJson.data?.some((r: any) => !r.estado);
        setHasPendingReport(pendingExists);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setCreating(false);
    }
  }

  async function completeReport(reportId: number) {
    if (!confirm("¿Marcar este reporte como completado y restablecer sensores?")) {
      return;
    }

    setCompletingReport(reportId);

    try {
      const res = await fetch(`http://localhost:3000/reports/${reportId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehiculo: noserie }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Error al completar reporte");
      }

      alert("✅ Reporte completado y sensores restablecidos");
      
      // Refresh data
      const reportsRes = await fetch(`http://localhost:3000/reports/vehicle/${noserie}`);
      if (reportsRes.ok) {
        const reportsJson = await reportsRes.json();
        setReports(reportsJson.data || []);
        const pendingExists = reportsJson.data?.some((r: any) => !r.estado);
        setHasPendingReport(pendingExists);
      }

      const sensorRes = await fetch(`http://localhost:3000/sensors/${noserie}`);
      const sensorJson = await sensorRes.json();
      setSensor(sensorJson.data ?? null);
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setCompletingReport(null);
    }
  }

  if (loading)
    return <p className="p-6 text-slate-600 animate-pulse text-center">Cargando datos...</p>;
  if (err)
    return <p className="p-6 text-rose-600 font-semibold text-center">{err}</p>;
  if (!sensor)
    return <p className="p-6 text-slate-600 text-center">No hay datos disponibles.</p>;

  const items = [
    { label: "Kilometraje", value: sensor.kilometraje },
    { label: "Nivel de Aceite", value: sensor.nivelaceite },
    { label: "Frenos", value: sensor.frenos },
    { label: "Anticongelante", value: sensor.nivelanticongelante },
    { label: "Presión", value: sensor.nivelpresion },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Detalles del Vehículo</h1>
          <span className="px-3 py-1 text-sm font-semibold rounded-lg bg-slate-600 text-slate-50">
            {noserie}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Owner Info */}
          {owner ? (
            <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-slate-700 mb-3">Propietario</h2>
              <p className="text-slate-600 mb-1"><strong className="text-slate-700">Nombre:</strong> {owner.tmbre}</p>
              <p className="text-slate-600 mb-1"><strong className="text-slate-700">CURP:</strong> {owner.curp}</p>
              <p className="text-slate-600"><strong className="text-slate-700">Email:</strong> {owner.email}</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
              <p className="text-slate-500">Sin información del propietario</p>
            </div>
          )}

          {/* Current Sensors */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 mb-3">Estado Actual de Sensores</h2>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <div key={item.label}>
                  <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                  <p className={`text-xl font-semibold ${checkStatusColor(item.value)}`}>
                    {item.value !== undefined ? item.value : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Report Button */}
        <div className="mb-6">
          <button
            onClick={createReport}
            disabled={creating || hasPendingReport}
            className={`px-5 py-2.5 rounded-lg text-white font-medium text-sm transition ${
              creating || hasPendingReport
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 shadow-sm"
            }`}
          >
            {creating ? "Creando reporte..." : hasPendingReport ? "Reporte pendiente - Complete primero" : "Crear Nuevo Reporte"}
          </button>
          {hasPendingReport && (
            <p className="text-amber-600 text-sm mt-2">
              Hay un reporte pendiente. Debe completarse antes de crear uno nuevo.
            </p>
          )}
        </div>

        {/* Reports History */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Historial de Reportes</h2>
          
          {reports.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay reportes para este vehículo</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-800">Reporte #{report.id}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          report.estado 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {report.estado ? "Completado" : "Pendiente"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {new Date(report.fecha).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    
                    {!report.estado && (
                      <button
                        onClick={() => completeReport(report.id)}
                        disabled={completingReport === report.id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          completingReport === report.id
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {completingReport === report.id ? "Completando..." : "Marcar Completo"}
                      </button>
                    )}
                  </div>

                  <p className="text-slate-700 mb-3">
                    <strong className="text-slate-800">Razón:</strong> {report.razon}
                  </p>

                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Lecturas de sensores al momento del reporte:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Kilometraje</p>
                        <p className={`font-semibold ${checkStatusColor(report.kilometraje)}`}>
                          {report.kilometraje}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Aceite</p>
                        <p className={`font-semibold ${checkStatusColor(report.nivelaceite)}`}>
                          {report.nivelaceite}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Frenos</p>
                        <p className={`font-semibold ${checkStatusColor(report.frenos)}`}>
                          {report.frenos}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Anticongelante</p>
                        <p className={`font-semibold ${checkStatusColor(report.nivelanticongelante)}`}>
                          {report.nivelanticongelante}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Presión</p>
                        <p className={`font-semibold ${checkStatusColor(report.nivelpresion)}`}>
                          {report.nivelpresion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => history.back()}
            className="px-5 py-2.5 rounded-lg bg-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-300 transition shadow-sm"
          >
            Regresar
          </button>
        </div>
      </div>
    </main>
  );
}