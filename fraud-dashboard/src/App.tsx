import { useCallback, useEffect, useState } from "react";
import "./App.css";

import AlertFilters from "./components/AlertFilters";
import AlertTable from "./components/AlertTable";
import Pagination from "./components/Pagination";
import InvestigationPanel from "./components/InvestigationPanel";
import Analytics from "./components/Analytics";
import TransactionSimulator from "./components/TransactionSimulator";

import {
  getDashboardStats,
  searchAlerts,
} from "./services/fraudApi";

import type {
  AlertStatus,
  DashboardStats,
  FraudAlert,
  RiskLevel,
} from "./types/fraud";

function App() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [analyticsAlerts, setAnalyticsAlerts] = useState<FraudAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [riskLevel, setRiskLevel] = useState<RiskLevel | "">("");
  const [status, setStatus] = useState<AlertStatus | "">("");
  const [senderId, setSenderId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const pageSize = 10;

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [statsData, alertsData, analyticsData] = await Promise.all([
        getDashboardStats(),

        searchAlerts(
          page,
          pageSize,
          riskLevel || undefined,
          status || undefined,
          senderId,
        ),

        searchAlerts(0, 1000),
      ]);

      setStats(statsData);
      setAlerts(alertsData.alerts);
      setAnalyticsAlerts(analyticsData.alerts);
      setTotalPages(alertsData.totalPages);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Unable to connect to fraud detection service.");
    } finally {
      setLoading(false);
    }
  }, [page, riskLevel, status, senderId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Live monitoring: refresh dashboard every 10 seconds.
  useEffect(() => {
    const interval = window.setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  const clearFilters = () => {
    setRiskLevel("");
    setStatus("");
    setSenderId("");
    setPage(0);
  };

  const handleRiskChange = (value: RiskLevel | "") => {
    setRiskLevel(value);
    setPage(0);
  };

  const handleStatusChange = (value: AlertStatus | "") => {
    setStatus(value);
    setPage(0);
  };

  const handleSenderChange = (value: string) => {
    setSenderId(value);
    setPage(0);
  };

  if (loading && !stats) {
    return (
      <div className="app loading-screen">
        <div className="loader" />
        <p>Loading fraud detection dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="title-row">
            <h1>Fraud Detection</h1>

            <span className="live-indicator">
              <span className="live-dot" />
              LIVE
            </span>
          </div>

          <p>Real-time transaction risk monitoring</p>

          {lastUpdated && (
            <span className="last-updated">
              Last updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <button
          className="refresh-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <section className="stats-grid">
          <StatCard
            title="Total Alerts"
            value={stats.totalAlerts}
            icon="◉"
          />

          <StatCard
            title="Open Alerts"
            value={stats.openAlerts}
            icon="○"
          />

          <StatCard
            title="High Risk"
            value={stats.highRiskAlerts}
            icon="▲"
          />

          <StatCard
            title="Critical"
            value={stats.criticalRiskAlerts}
            icon="!"
          />
        </section>
      )}

      <section className="content-section">
        <TransactionSimulator onPaymentCreated={loadDashboard} />

        <Analytics alerts={analyticsAlerts} />

        <div className="section-header">
          <div>
            <h2>Fraud Alerts</h2>
            <p>
              Investigate transactions identified by the risk engine
            </p>
          </div>
        </div>

        <AlertFilters
          riskLevel={riskLevel}
          status={status}
          senderId={senderId}
          onRiskLevelChange={handleRiskChange}
          onStatusChange={handleStatusChange}
          onSenderChange={handleSenderChange}
          onClear={clearFilters}
        />

        <AlertTable
          alerts={alerts}
          onSelect={(alert) => setSelectedAlert(alert)}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {selectedAlert && (
          <InvestigationPanel
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onUpdated={(updatedAlert) => {
              setSelectedAlert(updatedAlert);

              setAlerts((currentAlerts) =>
                currentAlerts.map((alert) =>
                  alert.id === updatedAlert.id
                    ? updatedAlert
                    : alert,
                ),
              );

              setSelectedAlert(null);

              loadDashboard();
            }}
          />
        )}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

export default App;
