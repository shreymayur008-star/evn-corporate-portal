"use client";

import { useState, useMemo } from "react";
import { ShieldAlert, AlertCircle, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const AVARIA_TYPES = ["Poste Caído","Cabo Partido","Falha de Fornecimento","Transformador Avariado","Iluminação Pública","Outro"];

export function AvariaModal({ closeModal }: { closeModal: () => void }) {
  const [data, setData] = useState({ type: "Poste Caído", lat: 0, lng: 0, desc: "" });
  const [isCapturing, setIsCapturing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValid = useMemo(() => (data.lat !== 0 || data.lng !== 0) && data.desc.trim().length >= 10, [data]);

  const handleGPS = () => {
    setIsCapturing(true);
    if (!("geolocation" in navigator)) {
      setIsCapturing(false); setErrors(e => ({ ...e, gps: "Geolocalização não suportada neste dispositivo." })); return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => { setData(d => ({ ...d, lat: pos.coords.latitude, lng: pos.coords.longitude })); setIsCapturing(false); setErrors(e => ({ ...e, gps: "" })); toast.success("Coordenadas GPS capturadas com precisão!"); },
      err => { setIsCapturing(false); const msg = err.code === err.PERMISSION_DENIED ? "Permissão de localização negada." : "Não foi possível obter as coordenadas."; setErrors(e => ({ ...e, gps: msg })); toast.error(msg); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!data.lat) newErrors.gps = "A captura de coordenadas GPS é obrigatória.";
    if (data.desc.trim().length < 10) newErrors.desc = "Forneça mais detalhes sobre o incidente (min. 10 caracteres).";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    try {
      const res = await fetch("/api/avaria", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: data.type, lat: data.lat, lng: data.lng, description: data.desc }) });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Alerta Vermelho registado! A equipa técnica EVN foi despachada.");
      closeModal();
      setData({ type: "Poste Caído", lat: 0, lng: 0, desc: "" });
    } catch { toast.error("Não foi possível enviar o alerta. Tente novamente."); }
  };

  return (
    <div className="p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-red-400" style={{ background: "rgba(239,68,68,0.12)" }}><ShieldAlert className="w-8 h-8" /></div>
        <div><h2 className="text-3xl font-black text-white">Piquete EVN (Emergência)</h2><p className="text-slate-400">Reporte falhas elétricas graves na sua zona.</p></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300 font-medium">AVISO: Não se aproxime de cabos de alta tensão caídos no solo. Mantenha distância.</p>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-300 block mb-3">Tipo de Avaria</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AVARIA_TYPES.map(opt => {
              const active = data.type === opt;
              return (
                <button key={opt} type="button"
                  style={{ cursor: "pointer", background: active ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.04)", border: `2px solid ${active ? "#f97316" : "rgba(255,255,255,0.1)"}`, color: active ? "#f97316" : "#94a3b8", borderRadius: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.8rem", fontWeight: "bold", transition: "all 0.15s ease", textAlign: "left" }}
                  onClick={() => setData(d => ({ ...d, type: opt }))}
                >{opt}</button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-300 block mb-2">Coordenadas GPS (Obrigatórias) <span className="text-red-400">*</span></label>
          <div className="rounded-xl p-4 flex justify-between items-center" style={{ background: "rgba(255,255,255,0.05)", border: `2px solid ${errors.gps ? "#ef4444" : "rgba(255,255,255,0.1)"}` }}>
            <div className="flex items-center gap-2 font-bold">
              <MapPin className={`w-5 h-5 ${data.lat ? "text-green-400" : "text-slate-500"}`} />
              {data.lat ? <span className="text-green-400">Localização ({data.lat.toFixed(4)}, {data.lng.toFixed(4)})</span> : <span className="text-slate-500">A aguardar sensor do dispositivo...</span>}
            </div>
            <button type="button" onClick={handleGPS} disabled={isCapturing} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors">{isCapturing ? "A ler..." : "Capturar"}</button>
          </div>
          {errors.gps && <p className="text-red-400 text-sm mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.gps}</p>}
        </div>

        <div>
          <label className="text-sm font-bold text-slate-300 block mb-2">Descrição Visual da Avaria <span className="text-red-400">*</span></label>
          <textarea rows={4} className={`w-full border-2 p-4 rounded-xl outline-none resize-none transition-colors text-slate-100 placeholder:text-slate-600 ${errors.desc ? "border-red-500" : "border-white/10 focus:border-orange-500"}`} style={{ background: errors.desc ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.05)" }} placeholder="Descreva a ocorrência..." value={data.desc} onChange={e => setData(d => ({ ...d, desc: e.target.value }))} />
          {errors.desc && <p className="text-red-400 text-sm mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.desc}</p>}
        </div>

        <button type="submit" disabled={!isValid} style={{ opacity: isValid ? 1 : 0.42, cursor: isValid ? "pointer" : "not-allowed" }} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-lg shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-opacity">Emitir Alerta à Central EVN</button>
      </form>
    </div>
  );
}
