"use client";

import { Printer } from "lucide-react";

export function YazdirButton() {
  return (
    <button onClick={() => window.print()} className="btn-primary btn-sm">
      <Printer size={16} /> Yazdır / PDF kaydet
    </button>
  );
}
