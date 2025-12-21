import { useLanguage } from "../../context/LanguageContext";
import { CheckCircle2, Circle } from "lucide-react";

const ListSummary = ({ list, itemsCount, doneCount }) => {
  const { t } = useLanguage();

  const toInt = (v) => {
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : 0;
  };

  const safeList = list ?? { items: [] };
  const items = Array.isArray(safeList.items) ? safeList.items : [];

  const totalItems = items.length > 0 ? items.length : toInt(itemsCount);
  const doneItems = items.length > 0 ? items.filter((item) => item.done).length : toInt(doneCount);
  const pendingItems = Math.max(0, totalItems - doneItems);

  const progressPct =
    totalItems > 0 ? Math.min(100, Math.max(0, Math.round((doneItems / totalItems) * 100))) : 0;

  const labelProgress = t?.progress ?? "Průběh";
  const labelDone = (t?.done ?? "Hotovo").toLowerCase();
  const labelPending = (t?.pending ?? "Čeká").toLowerCase();

  const styles = {
    wrap: {
      display: "grid",
      gap: 12,
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    topLeft: {
      fontSize: 12,
      color: "var(--muted)",
      letterSpacing: ".2px",
    },
    topRight: {
      fontSize: 12,
      color: "var(--muted)",
      fontVariantNumeric: "tabular-nums",
    },
    bar: {
      height: 8,
      borderRadius: 999,
      overflow: "hidden",
      border: "1px solid var(--border)",
      background: "rgba(255,255,255,.06)",
    },
    barFill: {
      height: "100%",
      width: `${progressPct}%`,
      background: "var(--success, #22c55e)",
      transition: "width 200ms ease",
      borderRadius: 999,
    },
    pills: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center",
    },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid var(--border)",
      color: "var(--text)",
      fontSize: 12,
      lineHeight: 1,
      background: "rgba(255,255,255,.04)",
    },
    pillDone: {
      background: "rgba(34,197,94,.12)",
    },
    pillPending: {
      background: "rgba(148,163,184,.10)",
    },
    icon: {
      width: 14,
      height: 14,
      flex: "0 0 auto",
      opacity: 0.95,
    },
  };

  return (
    <div style={styles.wrap}>
      {/* Progress */}
      <div>
        <div style={styles.topRow}>
          <span style={styles.topLeft}>{labelProgress}</span>
          <span style={styles.topRight}>
            {doneItems}/{totalItems}
          </span>
        </div>
        <div style={{ marginTop: 8, ...styles.bar }}>
          <div style={styles.barFill} />
        </div>
      </div>

      {/* Badges */}
      <div style={styles.pills}>
        <span style={{ ...styles.pill, ...styles.pillDone }}>
          <CheckCircle2 style={styles.icon} />
          {doneItems} {labelDone}
        </span>

        {pendingItems > 0 && (
          <span style={{ ...styles.pill, ...styles.pillPending }}>
            <Circle style={styles.icon} />
            {pendingItems} {labelPending}
          </span>
        )}
      </div>
    </div>
  );
};

export default ListSummary;
