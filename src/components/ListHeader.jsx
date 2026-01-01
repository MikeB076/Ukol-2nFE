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

export default function ListHeader({
  title,
  isOwner,
  isArchived,
  onRename,
  onArchiveToggle,
  onDelete,
  onOpenMembers,
}) {
  const { t } = useLanguage();

  return (
    <header style={{ marginBottom: 16 }}>
      <div className="list-header-row">
        <h2 style={{ margin: 0, flex: 1 }}>{title}</h2>

        {/* All actions inline next to the title */}
        <div className="list-header-actions" role="group" aria-label="List actions">
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

      {isArchived && (
        <div style={{ marginTop: 6, color: "var(--muted, #9aa0a6)" }}>
          {t.listArchivedInfo ?? "This list is archived"}
        </div>
      )}
    </header>
  );
}