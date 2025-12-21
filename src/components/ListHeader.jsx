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
import { useLanguage } from "../context/LanguageContext";

export default function ListHeader(p) {
  const { t } = useLanguage();
  return (
    <header style={{ marginBottom: 16 }}>
      <div className="list-header-row">
        <h2 style={{ margin: 0, flex: 1 }}>{p.title}</h2>

        <button className="btn btn--ghost" onClick={p.onOpenMembers}>
          {t.members ?? "Members"}
        </button>

        {p.isOwner && (
          <div className="list-header-actions">
            <button className="btn btn--ghost" onClick={p.onRename}>
              {t.rename ?? "Rename"}
            </button>
            <button className="btn btn--ghost" onClick={() => p.onArchiveToggle(!p.isArchived)}>
              {p.isArchived ? (t.unarchive ?? "Unarchive") : (t.archive ?? "Archive")}
            </button>
            <button className="btn btn--danger" onClick={p.onDelete}>
              {t.delete ?? "Delete"}
            </button>
          </div>
        )}
      </div>
      {p.isArchived && (
        <div style={{ marginTop: 6, color: "#666" }}>
          {t.listArchivedInfo ?? "This list is archived"}
        </div>
      )}
    </header>
  );
}
<div className="list-header-row">
  <h2 className="list-title">{title}</h2>

  <div className="list-header-actions">
    <button className="btn btn--ghost" onClick={onOpenMembers}>
      {t.members ?? "Members"}
    </button>

    {isOwner && (
      <>
        <button className="btn btn--ghost" onClick={onRename}>
          {t.rename ?? "Rename"}
        </button>

        <button className="btn btn--ghost" onClick={() => onArchiveToggle(!isArchived)}>
          {isArchived ? (t.unarchive ?? "Unarchive") : (t.archive ?? "Archive")}
        </button>

        <button className="btn btn--danger" onClick={onDelete}>
          {t.delete ?? "Delete"}
        </button>
      </>
    )}
  </div>
</div>