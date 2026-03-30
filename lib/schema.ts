import { z } from "zod";

// --- DOMAIN B: INCIDENT DEPLOYMENT (AVARIA) ---
export const IncidentSchema = z.object({
  faultType: z.enum(["Power Outage", "Router/Node Disconnect", "Mesh Failure"]),
  lat: z.number({ required_error: "GPS Target Lock Required" }).min(-90).max(90),
  lng: z.number({ required_error: "GPS Target Lock Required" }).min(-180).max(180),
  description: z.string().min(10, "Diagnostic description must be at least 10 characters."),
});

export type IncidentPayload = z.infer<typeof IncidentSchema>;

// --- DOMAIN C: ENTERPRISE CREDIT (CREDELEC) ---
export const CreditTransactionSchema = z.object({
  meterNumber: z.string().length(11, "Meter signature must be exactly 11 digits."),
  amount: z.number().min(100, "Minimum acquisition is 100 MZN."),
  twoFactorCode: z.string().length(6, "2FA requires a 6-digit cryptographic hash.").optional(),
});

export type CreditTransaction = z.infer<typeof CreditTransactionSchema>;

// --- DOMAIN A: TELEMETRY STATE ---
export interface TelemetryNode {
  timestamp: string;
  load: number;
  capacity: number;
  sector: string;
}

export interface GridState {
  systemStatus: "OPTIMAL" | "DEGRADED" | "CRITICAL";
  activeAnomalies: number;
  globalCreditState: number;
}