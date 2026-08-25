import type {
  AlertResponse,
  AlertStatus,
  DashboardStats,
  FraudAlert,
  RiskLevel,
} from "../types/fraud";

const API = "http://localhost:8082/api/v1/fraud";

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API}/dashboard/stats`);

  if (!response.ok) {
    throw new Error("Failed to load dashboard statistics");
  }

  return response.json();
}

export async function searchAlerts(
  page: number,
  size: number,
  riskLevel?: RiskLevel,
  status?: AlertStatus,
  senderId?: string,
): Promise<AlertResponse> {
  const params = new URLSearchParams();

  params.set("page", page.toString());
  params.set("size", size.toString());

  if (riskLevel) {
    params.set("riskLevel", riskLevel);
  }

  if (status) {
    params.set("status", status);
  }

  if (senderId?.trim()) {
    params.set("senderId", senderId.trim());
  }

  const response = await fetch(`${API}/alerts/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load fraud alerts");
  }

  return response.json();
}

export async function getAlertByPaymentId(
  paymentId: string,
): Promise<FraudAlert> {
  const response = await fetch(
    `${API}/alerts/payment/${encodeURIComponent(paymentId)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load fraud alert");
  }

  return response.json();
}

export async function updateAlertStatus(
  alertId: string,
  status: AlertStatus,
): Promise<FraudAlert> {
  const response = await fetch(`${API}/alerts/${alertId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update alert status");
  }

  return response.json();
}

