"use client";
import React from "react";

type Vehicle = {
  noserie: string; 
  marca?: string;
  submarca?: string;
  linea?: string;
  tipo?: string;
  color?: string;
};

type Props = {
  vehicle: Vehicle;
  onView?: (v: Vehicle) => void;
};

export default function CarCard({ vehicle, onView }: Props) {
  return (
    <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 w-82 hover:shadow-md transition duration-200">
      <header className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{vehicle.noserie}</h3>
          <p className="text-xs text-slate-500 mt-0.5">No. de serie</p>
        </div>

        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
          {vehicle.tipo || "—"}
        </span>
      </header>

      <div className="mt-3 text-sm text-slate-700 space-y-1.5">
        <p><strong className="text-slate-800">Marca:</strong> <span className="text-slate-600">{vehicle.marca ?? "—"}</span></p>
        <p><strong className="text-slate-800">Línea:</strong> <span className="text-slate-600">{vehicle.linea ?? "—"}</span></p>
        <p><strong className="text-slate-800">Color:</strong> <span className="text-slate-600">{vehicle.color ?? "—"}</span></p>
      </div>

      <div className="mt-4">
        <button
          onClick={() => onView?.(vehicle)}
          className="w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition shadow-sm"
        >
          Ver detalles
        </button>
      </div>
    </article>
  );
}