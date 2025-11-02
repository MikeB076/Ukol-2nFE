/**
 * @param {{showDone:boolean, onToggle:(next:boolean)=>void}} p
 */
export default function ItemFilters(p) {
  return (
    <div style={{ marginBottom: 8, color: "#333" }}>
      <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={p.showDone}
          onChange={(e) => p.onToggle(e.target.checked)}
        />
        Zobrazit i vyřešené
      </label>
    </div>
  );
}