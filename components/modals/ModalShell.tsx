"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle2 } from "lucide-react";
import type { ModalType, DownloadState } from "@/app/_types";

export function ModalShell({
  activeModal,
  closeModal,
  downloadState,
  children,
}: {
  activeModal: ModalType;
  closeModal: () => void;
  downloadState: DownloadState;
  children: React.ReactNode;
}) {
  const isWide = activeModal === "DASHBOARD" || activeModal === "SIMULADOR";

  return (
    <AnimatePresence>
      {activeModal !== "NONE" && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className={`w-full rounded-[2rem] relative flex flex-col overflow-hidden max-h-[95vh] ${isWide ? "max-w-6xl" : "max-w-4xl"}`}
            style={{
              background: "rgba(8,8,12,0.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 8px 64px 0 rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
              color: "#e2e8f0",
            }}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full z-50 transition-colors"
              style={{ background: "rgba(255,255,255,0.08)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            >
              <X className="w-6 h-6 text-slate-300" />
            </button>

            <div className="overflow-y-auto w-full h-full custom-scrollbar relative">
              {/* Secure download overlay */}
              <AnimatePresence>
                {downloadState.show && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center"
                    style={{ background: "rgba(2,6,23,0.95)" }}
                  >
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center mb-6 relative"
                      style={{ background: "rgba(59,130,246,0.1)", border: "4px solid rgba(59,130,246,0.2)" }}
                    >
                      {downloadState.progress === 100
                        ? <CheckCircle2 className="w-12 h-12 text-green-400" />
                        : <Lock className="w-10 h-10 text-blue-400 animate-pulse" />
                      }
                      {downloadState.progress < 100 && (
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="46" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                          <circle cx="50" cy="50" r="46" fill="transparent" stroke="#3b82f6" strokeWidth="8"
                            strokeDasharray={`${(downloadState.progress / 100) * 289} 289`}
                            transform="rotate(-90 50 50)" className="transition-all duration-300" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3">
                      {downloadState.progress === 100 ? "Documento PDF Preparado!" : "A Gerar Ficheiro PDF Seguro"}
                    </h3>
                    <p className="text-slate-400 max-w-md font-medium mb-8 text-lg">
                      {downloadState.progress === 100
                        ? "A abrir o documento oficial para guardar/imprimir..."
                        : "A estabelecer ligação encriptada à base de dados EVN..."}
                    </p>
                    <div className="px-8 py-4 rounded-xl max-w-lg w-full truncate" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <span className="text-base font-mono text-slate-300 font-bold">{downloadState.filename}.pdf</span>
                    </div>
                    {downloadState.progress < 100 && (
                      <p className="text-blue-400 font-black text-2xl mt-8">{downloadState.progress}%</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
