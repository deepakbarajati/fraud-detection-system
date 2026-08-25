export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AlertStatus =
  | "OPEN"
  | "REVIEWING"
  | "RESOLVED"
  | "FALSE_POSITIVE";

export interface DashboardStats {
  totalAlerts: number;
  openAlerts: number;
  reviewingAlerts: number;
  resolvedAlerts: number;
  falsePositiveAlerts: number;
  highRiskAlerts: number;
  criticalRiskAlerts: number;
}

export interface FraudAlert {
  id: string;
  paymentId: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: AlertStatus;
  riskReasons: string;
  aiExplanation: string;
  ipAddress: string;
  deviceId: string;
  createdAt: string;
}

export interface AlertResponse {
  alerts: FraudAlert[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
