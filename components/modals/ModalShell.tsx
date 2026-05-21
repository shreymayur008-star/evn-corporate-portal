"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ModalType } from "@/app/_types";

export function ModalShell({
  activeModal,
  closeModal,
  children,
}: {
  activeModal: ModalType;
  closeModal: () => void;
  children: React.ReactNode;
}) {
  const isWide = activeModal === "DASHBOARD" || activeModal === "SIMULADOR";

  return (
    <AnimatePresence>
      {activeModal !== "NONE" && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.97, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 40 }}
            className={`w-full relative flex flex-col overflow-hidden max-h-[95vh] rounded-t-[2rem] sm:rounded-[2rem] ${isWide ? "sm:max-w-6xl" : "sm:max-w-4xl"}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(8,8,12,0.97)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 8px 64px 0 rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
              color: "#e2e8f0",
            }}
          >
            {/* Drag handle on mobile */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-1 shrink-0" />

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full z-50 transition-colors"
              style={{ background: "rgba(255,255,255,0.08)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
            </button>

            <div className="overflow-y-auto w-full h-full custom-scrollbar modal-scroll">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
