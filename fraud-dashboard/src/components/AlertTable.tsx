import type { FraudAlert } from "../types/fraud";

interface AlertTableProps {
  alerts: FraudAlert[];
  onSelect: (alert: FraudAlert) => void;
}

function AlertTable({ alerts, onSelect }: AlertTableProps) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Payment</th>
            <th>Sender</th>
            <th>Amount</th>
            <th>Risk</th>
            <th>Score</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {alerts.map((alert) => (
            <tr
              key={alert.id}
              className="alert-row"
              onClick={() => onSelect(alert)}
            >
              <td>
                <span className="payment-id">
                  {alert.paymentId.slice(0, 8)}...
                </span>
              </td>

              <td>{alert.senderId}</td>

              <td>
                {alert.amount.toLocaleString()} {alert.currency}
              </td>

              <td>
                <span
                  className={`risk-badge ${alert.riskLevel.toLowerCase()}`}
                >
                  {alert.riskLevel}
                </span>
              </td>

              <td>
                <strong>{alert.riskScore}</strong>
              </td>

              <td>
                <span
                  className={`status-badge ${alert.status.toLowerCase()}`}
                >
                  {alert.status.replace("_", " ")}
                </span>
              </td>

              <td>
                {new Date(alert.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {alerts.length === 0 && (
        <div className="empty-state">
          No fraud alerts match the selected filters.
        </div>
      )}
    </div>
  );
}

export default AlertTable;

