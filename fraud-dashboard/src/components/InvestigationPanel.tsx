import { useEffect, useState } from "react";
import type { AlertStatus, FraudAlert } from "../types/fraud";
import { updateAlertStatus } from "../services/fraudApi";

interface InvestigationPanelProps {
  alert: FraudAlert;
  onClose: () => void;
  onUpdated: (alert: FraudAlert) => void;
}

function InvestigationPanel({
                              alert,
                              onClose,
                              onUpdated,
                            }: InvestigationPanelProps) {
  const [status, setStatus] = useState<AlertStatus>(alert.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setStatus(alert.status);
    setError("");
    setSuccess("");
  }, [alert]);

  const isLocked =
      alert.status === "RESOLVED" ||
      alert.status === "FALSE_POSITIVE";

  const handleStatusUpdate = async () => {
    if (status === alert.status || isLocked) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedAlert = await updateAlertStatus(alert.id, status);

      onUpdated(updatedAlert);

      setStatus(updatedAlert.status);

      setSuccess(
          `Alert status updated to ${formatStatus(updatedAlert.status)}.`,
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update alert status.");
    } finally {
      setSaving(false);
    }
  };

  const riskReasons = alert.riskReasons
      ? alert.riskReasons
          .split(";")
          .map((reason) => reason.trim())
          .filter(Boolean)
      : [];

  const availableStatuses = getAvailableStatuses(alert.status);

  return (
      <div className="panel-overlay" onClick={onClose}>
        <aside
            className="investigation-panel"
            onClick={(event) => event.stopPropagation()}
        >
          <div className="panel-header">
            <div>
              <p className="panel-label">Fraud Investigation</p>
              <h2>Alert Details</h2>
            </div>

            <button
                className="close-button"
                onClick={onClose}
                aria-label="Close investigation panel"
            >
              ×
            </button>
          </div>

          <div className="panel-content">
            {/* Transaction Details */}
            <section className="investigation-section">
              <h3>Transaction</h3>

              <div className="detail-grid">
                <Detail
                    label="Payment ID"
                    value={alert.paymentId}
                />

                <Detail
                    label="Sender"
                    value={alert.senderId}
                />

                <Detail
                    label="Receiver"
                    value={alert.receiverId}
                />

                <Detail
                    label="Amount"
                    value={`${alert.amount.toLocaleString()} ${alert.currency}`}
                />

                <Detail
                    label="IP Address"
                    value={alert.ipAddress}
                />

                <Detail
                    label="Device ID"
                    value={alert.deviceId}
                />
              </div>
            </section>

            {/* Risk Summary */}
            <section className="risk-summary">
              <div>
                <span>Risk Score</span>
                <strong>{alert.riskScore}</strong>
              </div>

              <div>
                <span>Risk Level</span>

                <span
                    className={`risk-badge ${alert.riskLevel.toLowerCase()}`}
                >
                {alert.riskLevel}
              </span>
              </div>

              <div>
                <span>Status</span>

                <span
                    className={`status-badge ${alert.status.toLowerCase()}`}
                >
                {formatStatus(alert.status)}
              </span>
              </div>
            </section>

            {/* Risk Reasons */}
            <section className="investigation-section">
              <h3>Why was this flagged?</h3>

              {riskReasons.length > 0 ? (
                  <div className="risk-reasons">
                    {riskReasons.map((reason, index) => (
                        <div
                            className="risk-reason"
                            key={`${reason}-${index}`}
                        >
                          <span>!</span>

                          <p>{reason}</p>
                        </div>
                    ))}
                  </div>
              ) : (
                  <p className="muted-text">
                    No specific risk factors detected.
                  </p>
              )}
            </section>

            {/* AI Investigation */}
            <section className="investigation-section">
              <h3>AI Investigation</h3>

              <div className="ai-box">
                <div className="ai-title">
                  <span>✦</span>
                  <strong>Risk Analysis</strong>
                </div>

                <p>{alert.aiExplanation}</p>
              </div>
            </section>

            {/* Investigation Status */}
            <section className="investigation-section">
              <h3>Investigation Status</h3>

              <select
                  className="status-select"
                  value={status}
                  disabled={saving || isLocked}
                  onChange={(event) => {
                    setStatus(
                        event.target.value as AlertStatus,
                    );

                    setSuccess("");
                    setError("");
                  }}
              >
                {availableStatuses.map((availableStatus) => (
                    <option
                        key={availableStatus}
                        value={availableStatus}
                    >
                      {formatStatus(availableStatus)}
                    </option>
                ))}
              </select>

              {isLocked && (
                  <p className="status-locked-message">
                    This alert is closed and cannot be modified.
                  </p>
              )}

              {error && (
                  <p className="panel-error">
                    {error}
                  </p>
              )}

              {success && (
                  <p className="panel-success">
                    {success}
                  </p>
              )}

              <button
                  className="update-status-button"
                  onClick={handleStatusUpdate}
                  disabled={
                      saving ||
                      isLocked ||
                      status === alert.status
                  }
              >
                {saving
                    ? "Updating..."
                    : "Update Status"}
              </button>
            </section>

            {/* Transaction Time */}
            <section className="investigation-section">
              <h3>Transaction Time</h3>

              <p className="muted-text">
                {new Date(
                    alert.createdAt,
                ).toLocaleString()}
              </p>
            </section>
          </div>
        </aside>
      </div>
  );
}

function getAvailableStatuses(
    currentStatus: AlertStatus,
): AlertStatus[] {
  switch (currentStatus) {
    case "OPEN":
      return [
        "OPEN",
        "REVIEWING",
        "FALSE_POSITIVE",
      ];

    case "REVIEWING":
      return [
        "REVIEWING",
        "OPEN",
        "RESOLVED",
        "FALSE_POSITIVE",
      ];

    case "RESOLVED":
      return ["RESOLVED"];

    case "FALSE_POSITIVE":
      return ["FALSE_POSITIVE"];

    default:
      return [currentStatus];
  }
}

function formatStatus(
    status: AlertStatus,
): string {
  return status
      .toLowerCase()
      .replace("_", " ")
      .replace(
          /\b\w/g,
          (letter) => letter.toUpperCase(),
      );
}

function Detail({
                  label,
                  value,
                }: {
  label: string;
  value: string;
}) {
  return (
      <div className="detail-item">
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
  );
}

export default InvestigationPanel;