import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AlertStatus, FraudAlert, RiskLevel } from "../types/fraud";

interface AnalyticsProps {
  alerts: FraudAlert[];
}

const RISK_LEVELS: RiskLevel[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const STATUSES: AlertStatus[] = [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "FALSE_POSITIVE",
];

function Analytics({ alerts }: AnalyticsProps) {
  const riskData = RISK_LEVELS.map((level) => ({
    name: level,
    value: alerts.filter((alert) => alert.riskLevel === level).length,
  }));

  const statusData = STATUSES.map((status) => ({
    name: status.replace("_", " "),
    value: alerts.filter((alert) => alert.status === status).length,
  }));

  return (
    <section className="analytics-section">
      <div className="analytics-header">
        <div>
          <h2>Risk Analytics</h2>
          <p>Overview of analyzed transactions and investigation status</p>
        </div>

        <span className="analytics-count">
          {alerts.length} analyzed alerts
        </span>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Risk Distribution</h3>
            <p>Alerts by detected risk level</p>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, value }) =>
                    value > 0 ? `${name}: ${value}` : ""
                  }
                >
                  {riskData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={getRiskColor(entry.name as RiskLevel)}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#151922",
                    border: "1px solid #303747",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Investigation Status</h3>
            <p>Current alert workflow state</p>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#282e3c"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#8b93a7", fontSize: 11 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#8b93a7", fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#151922",
                    border: "1px solid #303747",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="value"
                  name="Alerts"
                  fill="#64748b"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "LOW":
      return "#22c55e";
    case "MEDIUM":
      return "#eab308";
    case "HIGH":
      return "#f97316";
    case "CRITICAL":
      return "#ef4444";
  }
}

export default Analytics;
