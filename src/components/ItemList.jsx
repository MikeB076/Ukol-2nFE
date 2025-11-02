import ItemRow from "./ItemRow";

/**
 * @param {object} p
 * @param {{id:string,name:string,done:boolean}[]} p.items
 * @param {(id:string, next:boolean)=>void} p.onToggleDone
 * @param {(id:string, name:string)=>void} p.onEdit
 * @param {(id:string)=>void} p.onRemove
 * @param {boolean} [p.disabled]
 */
export default function ItemList(p) {
  if (!p.items.length)
    return (
      <div style={{ color: "#777" }} aria-live="polite">
        Žádné položky…
      </div>
    );

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
      {p.items.map((it) => (
        <li key={it.id} style={{ borderBottom: "1px solid #eee", paddingBottom: 4 }}>
          <ItemRow
            id={it.id}
            name={it.name}
            done={it.done}
            onToggleDone={p.onToggleDone}
            onEdit={p.onEdit}
            onRemove={p.onRemove}
            disabled={p.disabled}
          />
        </li>
      ))}
    </ul>
  );
}