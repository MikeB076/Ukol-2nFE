import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useLanguage } from "../../context/LanguageContext";

export default function DetailPieChart({ itemsCount = 0, doneCount = 0 }) {
  const { t } = useLanguage();

  const total = Number(itemsCount) || 0;
  const done = Math.max(0, Number(doneCount) || 0);
  const pending = Math.max(0, total - done);

  const data = useMemo(
    () => [
      { name: t?.done ?? "Hotovo", value: done },
      { name: t?.pending ?? "Čeká", value: pending },
    ],
    [done, pending, t]
  );

  // Keep the container predictable so it doesn't get cut off
  const wrapStyle = {
    width: "100%",
    height: 260,
    minHeight: 260,
  };

  if (total === 0) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--card)",
          color: "var(--muted)",
        }}
      >
        {t?.noItemsYet ?? "Zatím žádné položky"}
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 8, fontWeight: 700, color: "var(--text)" }}>
      </div>

      <div
        style={{
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.02)",
          padding: 16,
        }}
      >
        <div style={wrapStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={2}
                stroke="rgba(0,0,0,0)"
              >
                <Cell fill="var(--success)" />
                <Cell fill="rgba(148,163,184,0.95)" />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--text)",
                  boxShadow: "var(--shadow)",
                  padding: "10px 12px",
                }}
               itemStyle={{ color: "var(--text)" }}
               labelStyle={{ color: "var(--muted)" }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ color: "var(--muted)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Small, clean summary row (you can keep this or remove later) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginTop: 14,
          }}
        >
          <Stat label={t?.done ?? "Hotovo"} value={done} />
          <Stat label={t?.pending ?? "Čeká"} value={pending} />
          <Stat label={t?.total ?? "Celkem"} value={total} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        padding: "10px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "var(--text)",
        gap: 12,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span style={{ color: "var(--muted)", fontSize: 13, marginRight: 8 }}>{label}</span>
      <span style={{ fontWeight: 800, fontSize: 16, minWidth: 24, textAlign: "right" }}>{value}</span>
    </div>
  );
}
