export interface PaymentRequest {
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  ipAddress: string;
  deviceId: string;
}

export interface PaymentResponse {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: string;
  ipAddress: string;
  deviceId: string;
  createdAt: string;
  message: string;
}

const PAYMENT_API = "http://localhost:8081/api/v1/payments";

export async function createPayment(
  payment: PaymentRequest,
): Promise<PaymentResponse> {
  const response = await fetch(PAYMENT_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment");
  }

  return response.json();
}
