import { useState } from "react";
import {
  createPayment,
  type PaymentResponse,
} from "../services/paymentApi";

interface TransactionSimulatorProps {
  onPaymentCreated: () => void;
}

function TransactionSimulator({
  onPaymentCreated,
}: TransactionSimulatorProps) {
  const [senderId, setSenderId] = useState("dashboard-test-user");
  const [receiverId, setReceiverId] = useState("dashboard-test-merchant");
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [ipAddress, setIpAddress] = useState("10.10.0.1");
  const [deviceId, setDeviceId] = useState("dashboard-test-device");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PaymentResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      const response = await createPayment({
        senderId: senderId.trim(),
        receiverId: receiverId.trim(),
        amount: Number(amount),
        currency: currency.trim().toUpperCase(),
        ipAddress: ipAddress.trim(),
        deviceId: deviceId.trim(),
      });

      setResult(response);

      // Give Kafka/fraud detection a moment, then refresh dashboard.
      window.setTimeout(() => {
        onPaymentCreated();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to create payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="simulator-section">
      <div className="simulator-header">
        <div>
          <h2>Transaction Simulator</h2>
          <p>
            Send a real payment through the fraud detection pipeline.
          </p>
        </div>
      </div>

      <div className="scenario-buttons">
        <span>Quick Scenarios</span>

        <button
            type="button"
            onClick={() => {
              setSenderId("normal-user");
              setReceiverId("normal-merchant");
              setAmount("100");
              setCurrency("USD");
              setIpAddress("10.10.0.1");
              setDeviceId("normal-device");
            }}
        >
          Normal
        </button>

        <button
            type="button"
            onClick={() => {
              setSenderId("high-value-user");
              setReceiverId("merchant-001");
              setAmount("60000");
              setCurrency("USD");
              setIpAddress("10.10.0.1");
              setDeviceId("trusted-device");
            }}
        >
          High Amount
        </button>

        <button
            type="button"
            onClick={() => {
              setSenderId("suspicious-user");
              setReceiverId("merchant-001");
              setAmount("95000");
              setCurrency("USD");
              setIpAddress("45.33.32.156");
              setDeviceId("unknown-device-xyz");
            }}
        >
          Critical Fraud
        </button>
      </div>

      <form className="simulator-form" onSubmit={handleSubmit}>
        <div className="simulator-grid">
          <label>
            Sender ID
            <input
              value={senderId}
              onChange={(event) => setSenderId(event.target.value)}
              required
            />
          </label>

          <label>
            Receiver ID
            <input
              value={receiverId}
              onChange={(event) => setReceiverId(event.target.value)}
              required
            />
          </label>

          <label>
            Amount
            <input
              type="number"
              min="0.01"
              max="1000000"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

          <label>
            Currency
            <input
              value={currency}
              maxLength={3}
              onChange={(event) => setCurrency(event.target.value)}
              required
            />
          </label>

          <label>
            IP Address
            <input
              value={ipAddress}
              onChange={(event) => setIpAddress(event.target.value)}
              required
            />
          </label>

          <label>
            Device ID
            <input
              value={deviceId}
              onChange={(event) => setDeviceId(event.target.value)}
              required
            />
          </label>
        </div>

        {error && <p className="simulator-error">{error}</p>}

        {result && (
          <div className="simulator-success">
            <strong>Payment created successfully</strong>

            <span>
              Payment ID: <code>{result.id}</code>
            </span>

            <span>
              Status: <strong>{result.status}</strong>
            </span>
          </div>
        )}

        <button
          className="simulate-button"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Processing..." : "Send Transaction"}
        </button>
      </form>
    </section>
  );
}

export default TransactionSimulator;
