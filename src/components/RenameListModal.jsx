import { useEffect, useState } from "react";

/**
 * @param {{
 *  isOpen:boolean,
 *  defaultValue?:string,
 *  onClose:()=>void,
 *  onSubmit:(name:string)=>void
 * }} p
 */
export default function RenameListModal(p) {
  const [value, setValue] = useState(p.defaultValue ?? "");

  // Sync default value when dialog opens or when defaultValue changes
  useEffect(() => {
    if (p.isOpen) setValue(p.defaultValue ?? "");
  }, [p.defaultValue, p.isOpen]);

  if (!p.isOpen) return null;

  const submit = () => {
    const v = value.trim();
    if (v) p.onSubmit(v);
  };

  return (
    <div style={backdrop} role="dialog" aria-modal="true" aria-labelledby="rename-title">
      <div style={modal}>
        <h3 id="rename-title" style={{ marginTop: 0 }}>Přejmenovat seznam</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          style={{ display: "grid", gap: 12 }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span className="sr-only">Nový název</span>
            <input
              autoFocus
              aria-label="Nový název seznamu"
              value={value}
              placeholder="Nový název…"
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") p.onClose();
              }}
              style={{ padding: 8 }}
            />
          </label>

          <div style={buttonRow}>
            <button type="button" onClick={p.onClose}>Zrušit</button>
            <button type="submit" disabled={!value.trim()} style={saveButton}>Uložit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "grid",
  placeItems: "center",
  zIndex: 999,
};

const modal = {
  background: "#fff",
  padding: "20px 24px",
  borderRadius: 8,
  width: 360,
  boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
};

const buttonRow = {
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
  marginTop: 4,
};

const saveButton = {
  background: "#1976d2",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 4,
  cursor: "pointer",
};