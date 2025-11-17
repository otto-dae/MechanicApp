"use client";
import { useEffect, useState } from "react";
import CarCard from "../components/carCard";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/vehicles")
      .then(r => r.json())
      .then(j => setVehicles(j.data || []))
      .catch(console.error);
  }, []);

  const router = useRouter();

function handleView(v: any) {
  router.push(`/vehicles/${v.noserie}`);
}

  async function handleReport(v: any) {
    const res = await fetch("http://localhost:3000/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehiculo: v.noserie, mecanico: 1 })
    });

    if (res.ok) alert("Reporte creado");
    else alert("Error al crear reporte");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vehículos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-start justify-center">
        {vehicles.map(v => (
          <CarCard
            key={v.noserie}
            vehicle={v}
            onView={handleView}
            onReport={handleReport}
          />
        ))}
      </div>
    </main>
  );
}
