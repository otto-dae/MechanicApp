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
  onReport?: (v: Vehicle) => void;
};

export default function CarCard({ vehicle, onView, onReport }: Props) {
  return (
    <article className="bg-gray-100 border border-gray-300 rounded-lg shadow-sm p-4 w-82 hover:shadow-md transition duration-200">
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{vehicle.noserie}</h3>
          <p className="text-[11px] text-gray-500"># No. de serie</p>
        </div>

        <span className="text-[11px] font-medium px-2 py-1 rounded bg-gray-200 text-gray-700">
          {vehicle.tipo || "—"}
        </span>
      </header>

      <div className="mt-2 text-sm text-gray-700 space-y-1">
        <p><strong>Marca:</strong> {vehicle.marca ?? "—"}</p>
        <p><strong>Submarca:</strong> {vehicle.submarca ?? "—"}</p>
        <p><strong>Linea:</strong> {vehicle.linea ?? "—"}</p>
        <p><strong>Color:</strong> {vehicle.color ?? "—"}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onView?.(vehicle)}
          className="flex-1 py-1.5 rounded-md bg-[#6c8ebf] text-white text-xs font-medium hover:bg-[#5e7da8]"
        >
          Ver detalles
        </button>


        <button
          onClick={() => onReport?.(vehicle)}
          className="py-1.5 px-3 rounded-md bg-[#d8c972] text-xs font-medium text-gray-800 hover:bg-[#c8b862]"
        >
          Reporte
        </button>
      </div>
    </article>
  );
}
