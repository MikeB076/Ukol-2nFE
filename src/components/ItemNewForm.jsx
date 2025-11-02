import { useState } from "react";

/**
 * @param {{onAdd:(payload:{name:string})=>void, disabled?:boolean}} p
 */
export default function ItemNewForm(p) {
  const [value, setValue] = useState("");

  const submit = () => {
    const v = (value || "").trim();
    if (!v || p.disabled) return;
    p.onAdd({ name: v });
    setValue("");
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      style={{ display: "flex", gap: 8, margin: "8px 0 16px" }}
      aria-label="Přidat novou položku"
    >
      <input
        placeholder="Přidat položku…"
        aria-label="Název nové položky"
        value={value}
        disabled={p.disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // submit řeší onSubmit
          }
          if (e.key === "Escape") {
            setValue("");
          }
        }}
        style={{ flex: 1, padding: 8 }}
      />
      <button type="submit" disabled={p.disabled || !value.trim()}>
        Přidat
      </button>
    </form>
  );
}