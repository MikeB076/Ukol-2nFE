import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * @param {{
 *  id:string,
 *  name:string,
 *  done:boolean,
 *  onToggleDone:(id:string,next:boolean)=>void,
 *  onEdit:(id:string,name:string)=>void,
 *  onRemove:(id:string)=>void
 * }} p
 */
export default function ItemRow(p) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(p.name);

  const save = () => {
    const v = (value ?? "").trim();
    if (!v) return; // nic neukládej na prázdno
    if (v !== p.name) p.onEdit(p.id, v);
    setEditing(false);
  };

  const cancel = () => {
    setValue(p.name);
    setEditing(false);
  };

  return (
    <div style={rowStyle}>
      <input
        type="checkbox"
        checked={p.done}
        onChange={(e) => p.onToggleDone(p.id, e.target.checked)}
        aria-label={`${t.toggleItem ?? "Toggle item"} \"${p.name}\"`}
        title={p.done ? (t.markUndone ?? "Mark as not done") : (t.markDone ?? "Mark as done")}
      />

      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          aria-label={t.editItemName ?? "Edit item name"}
          style={{ flex: 1, padding: 6 }}
        />
      ) : (
        <span
          style={{
            flex: 1,
            textDecoration: p.done ? "line-through" : "none",
            color: p.done ? "#777" : "inherit",
            cursor: "text",
          }}
          onDoubleClick={() => setEditing(true)}
          title={t.doubleClickToEdit ?? "Double click to edit"}
        >
          {p.name}
        </span>
      )}

      {editing ? (
        <div style={btnGroup}>
          <button onClick={cancel}>{t.cancel ?? "Cancel"}</button>
          <button onClick={save} style={primaryBtn} disabled={!value.trim()}>
            {t.save ?? "Save"}
          </button>
        </div>
      ) : (
        <div style={btnGroup}>
          <button onClick={() => setEditing(true)}>{t.edit ?? "Edit"}</button>
          <button onClick={() => p.onRemove(p.id)} style={dangerBtn}>
            {t.delete ?? "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}

const rowStyle = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  padding: "10px 0",
};

const btnGroup = { display: "flex", gap: 8 };

const primaryBtn = {
  background: "#1976d2",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 4,
  cursor: "pointer",
};

const dangerBtn = {
  background: "#c62828",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 4,
  cursor: "pointer",
};