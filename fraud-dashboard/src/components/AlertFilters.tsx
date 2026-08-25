import type { AlertStatus, RiskLevel } from "../types/fraud";

interface AlertFiltersProps {
  riskLevel: RiskLevel | "";
  status: AlertStatus | "";
  senderId: string;
  onRiskLevelChange: (value: RiskLevel | "") => void;
  onStatusChange: (value: AlertStatus | "") => void;
  onSenderChange: (value: string) => void;
  onClear: () => void;
}

function AlertFilters({
  riskLevel,
  status,
  senderId,
  onRiskLevelChange,
  onStatusChange,
  onSenderChange,
  onClear,
}: AlertFiltersProps) {
  return (
    <div className="filters">
      <div className="filter-group">
        <label>Risk Level</label>

        <select
          value={riskLevel}
          onChange={(e) =>
            onRiskLevelChange(e.target.value as RiskLevel | "")
          }
        >
          <option value="">All Risk Levels</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>

        <select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as AlertStatus | "")
          }
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="RESOLVED">Resolved</option>
          <option value="FALSE_POSITIVE">False Positive</option>
        </select>
      </div>

      <div className="filter-group sender-filter">
        <label>Sender</label>

        <input
          type="text"
          placeholder="Search sender..."
          value={senderId}
          onChange={(e) => onSenderChange(e.target.value)}
        />
      </div>

      <button className="clear-button" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

export default AlertFilters;
