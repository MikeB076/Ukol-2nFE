/**
 * @param {object} p
 * @param {string} p.title
 * @param {boolean} p.isOwner
 * @param {boolean} p.isArchived
 * @param {() => void} p.onRename
 * @param {(next: boolean) => void} p.onArchiveToggle
 * @param {() => void} p.onDelete
 * @param {() => void} p.onOpenMembers
 */
export default function ListHeader(p) {
  return (
    <header style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>{p.title}</h2>

        <button onClick={p.onOpenMembers}>Členové</button>

        {p.isOwner && (
          <>
            <button onClick={p.onRename}>Přejmenovat</button>
            <button onClick={() => p.onArchiveToggle(!p.isArchived)}>
              {p.isArchived ? "Odarchivovat" : "Archivovat"}
            </button>
            <button onClick={p.onDelete}>Smazat</button>
          </>
        )}
      </div>
      {p.isArchived && (
        <div style={{ marginTop: 6, color: "#666" }}>Seznam je archivovaný</div>
      )}
    </header>
  );
}