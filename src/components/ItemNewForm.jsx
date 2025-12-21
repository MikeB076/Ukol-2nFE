import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * @param {{onAdd:(payload:{name:string})=>void, disabled?:boolean}} p
 */
export default function ItemNewForm(p) {
  const [value, setValue] = useState("");
  const { t } = useLanguage();

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
      aria-label={t?.addNewItemAriaLabel ?? "Add new item"}
    >
      <input
        placeholder={t?.addItemPlaceholder ?? "Add item…"}
        aria-label={t?.newItemNameAriaLabel ?? "New item name"}
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
        {t?.add ?? "Add"}
      </button>
    </form>
  );
}