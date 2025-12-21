import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchListsOverview, createList, deleteList } from "../api/mockApi";
import ListSummary from "../components/charts/ListSummary";
import { useLanguage } from "../context/LanguageContext";

/** Fallback otevření detailu jedním reloadem, pokud není předán onOpen */
function openList(id) {
  window.location.href = `/lists/${id}`;
}

export default function ListsPage({ state, setState, onOpen }) {
  // defaultně prázdné pole, ať se to nikdy neláme na undefined
  const { currentUserId, lists = [] } = state || { currentUserId: "u1", lists: [] };

  const cleanLists = useMemo(() => (lists || []).filter(Boolean), [lists]);

  const [status, setStatus] = useState("pending"); // pending | ready | error

  // UI-only stavy
  const [showArchived, setShowArchived] = useState(false); // zobrazit i archiv
  const [scope, setScope] = useState("all"); // all | owned | member
  const [createOpen, setCreateOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // {text, onConfirm}

  const { t, language } = useLanguage();

  // Načtení seznamů z mock "serveru"
  useEffect(() => {
    let cancelled = false;

    setStatus("pending");
    fetchListsOverview()
      .then((data) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          lists: data,
        }));
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Chyba při načítání seznamů:", err);
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [setState]);

  /** Odvozené seznamy dle filtrů – HOOKY MUSÍ BÝT NAD RETURN! */
  const filtered = useMemo(() => {
    let out = cleanLists;
    if (!showArchived) out = out.filter((l) => !l.archived);
    if (scope === "owned") out = out.filter((l) => l.ownerId === currentUserId);
    if (scope === "member") out = out.filter((l) => l.ownerId !== currentUserId);
    return out;
  }, [cleanLists, showArchived, scope, currentUserId]);

  const myListsCount = useMemo(
    () => cleanLists.filter((l) => l.ownerId === currentUserId).length,
    [cleanLists, currentUserId]
  );

  const archivedCount = useMemo(() => cleanLists.filter((l) => l.archived).length, [cleanLists]);

  const canDelete = (list) => list.ownerId === currentUserId;

  function handleOpen(id) {
    if (typeof onOpen === "function") onOpen(id);
    else openList(id);
  }

  const handleDelete = (id) => {
    const list = lists.find((l) => l.id === id);
    if (!list || !canDelete(list)) return;
    setConfirm({
      text:
        language === "cs"
          ? `Opravdu smazat seznam „${list.name}“?`
          : `Delete the list “${list.name}”?`,
      onConfirm: async () => {
        try {
          await deleteList(id);
          const updated = await fetchListsOverview();
          setState((prev) => ({
            ...prev,
            lists: updated,
          }));
        } catch (e) {
          console.error("Chyba při mazání seznamu:", e);
          alert(
            language === "cs"
              ? "Seznam se nepodařilo smazat. Zkuste to prosím znovu."
              : "Failed to delete the list. Please try again."
          );
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  const handleCreate = async (payload) => {
    const name = (payload?.name || "").trim();
    if (!name) return;

    try {
      const result = await createList(name, currentUserId);

      let nextLists = null;

      if (Array.isArray(result)) {
        nextLists = result;
      } else if (result && typeof result === "object") {
        setState((prev) => {
          const base = Array.isArray(prev.lists) ? prev.lists.filter(Boolean) : [];
          const idx = base.findIndex((l) => l.id === result.id);
          if (idx >= 0) base[idx] = result;
          else base.unshift(result);
          return { ...prev, lists: base };
        });
      }

      if (!nextLists) {
        const updated = await fetchListsOverview();
        if (Array.isArray(updated)) nextLists = updated;
      }

      if (Array.isArray(nextLists)) {
        setState((prev) => ({
          ...prev,
          lists: nextLists.filter(Boolean),
        }));
      }

      setCreateOpen(false);
    } catch (e) {
      console.error("Chyba při vytváření seznamu:", e);
      alert(
        language === "cs"
          ? "Seznam se nepodařilo vytvořit. Zkuste to prosím znovu."
          : "Failed to create the list. Please try again."
      );
    }
  };

  if (status === "pending") {
    return (
      <div style={{ maxWidth: 980, margin: "32px auto", padding: "0 16px" }}>
        <div className="alert alert--info">
          <p>{t.loadingLists ?? (language === "cs" ? "Načítám nákupní seznamy…" : "Loading shopping lists…")}</p>
          <p className="alert__detail">{t.loadingListsDetail ?? (language === "cs" ? "Prosím čekejte, data se načítají z mock serveru." : "Please wait, data is being loaded from the mock server.")}</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ maxWidth: 980, margin: "32px auto", padding: "0 16px" }}>
        <div className="alert alert--error">
          <p>{t.failedLoadLists ?? (language === "cs" ? "Nepodařilo se načíst nákupní seznamy." : "Failed to load shopping lists.")}</p>
          <p className="alert__detail">{t.failedLoadListsDetail ?? (language === "cs" ? "Zkuste to prosím znovu později nebo obnovte stránku." : "Please try again later or refresh the page.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "32px auto", padding: "0 16px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>{t.shoppingLists}</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.7, fontSize: 14 }}>
            {t.tagline || "Spravuj seznamy, sdílej s členy a sleduj progres."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
            + {t.newList ? t.newList : "Nový seznam"}
          </button>
        </div>
      </header>

      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          margin: "0 0 10px",
          color: "var(--muted, #aaa)",
        }}
      >
        <li>
          {t.allLists}: <strong style={{ color: "var(--text, #fff)" }}>{cleanLists.length}</strong>
        </li>
        <li>
          {(t.myListsLabel ?? t.mine ?? (language === "cs" ? "Moje" : "Mine"))}:{" "}
          <strong style={{ color: "var(--text, #fff)" }}>{myListsCount}</strong>
        </li>
        <li>
          {(t.archiveLabel ?? t.archived ?? (language === "cs" ? "Archiv" : "Archive"))}:{" "}
          <strong style={{ color: "var(--text, #fff)" }}>{archivedCount}</strong>
        </li>
      </ul>

      <div style={toolbarStyle}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "owned", "member"].map((key) => (
            <button key={key} onClick={() => setScope(key)} style={pillStyle(scope === key)}>
              {key === "all" ? (t.all ?? (language === "cs" ? "Vše" : "All")) : key === "owned" ? (t.mine ?? (language === "cs" ? "Jen moje" : "Mine")) : (t.shared ?? (language === "cs" ? "Sdílené" : "Shared"))}
            </button>
          ))}
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginLeft: "auto",
          }}
        >
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          {t.showArchived ?? (language === "cs" ? "Zobrazit archivované" : "Show archived")}
        </label>
      </div>

      <TilesGrid>
        {filtered.map((l) => {
          const rawItemsCount =
            l.itemsCount ?? l.totalCount ?? l.items_total ?? l.totalItems ?? l.items?.length ?? 0;

          const rawDoneCount =
            l.doneCount ??
            l.doneItemsCount ??
            l.completedCount ??
            l.items_done ??
            l.doneItems ??
            (Array.isArray(l.items) ? l.items.filter((it) => it?.done).length : 0) ??
            0;

          const itemsCount = Number.isFinite(Number(rawItemsCount)) ? Number(rawItemsCount) : 0;
          const doneCount = Number.isFinite(Number(rawDoneCount)) ? Number(rawDoneCount) : 0;

          return (
            <ListTile
              key={l.id}
              name={l.name}
              owner={l.ownerId === currentUserId ? (language === "cs" ? "Ty" : "You") : l.ownerId}
              itemsCount={itemsCount}
              doneCount={doneCount}
              archived={l.archived}
              onOpen={() => handleOpen(l.id)}
              onDelete={canDelete(l) ? () => handleDelete(l.id) : null}
            />
          );
        })}

        {filtered.length === 0 && (
          <div style={emptyStyle} className="card">
            <h3 style={{ margin: "0 0 6px" }}>{t.noListsYet}</h3>
            <p style={{ margin: 0, opacity: 0.7 }}>{t.createFirstList || "Změň filtr nebo založ nový seznam."}</p>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
                {t.createFirstList}
              </button>
            </div>
          </div>
        )}
      </TilesGrid>

      {createOpen && (
        <CreateListModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        text={confirm?.text ?? ""}
        onConfirm={() => confirm?.onConfirm?.()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function TilesGrid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16,
        marginTop: 12,
      }}
    >
      {children}
    </div>
  );
}

function ListTile({ name, owner, itemsCount, doneCount, archived, onOpen, onDelete }) {
  const first = (name?.[0] || "S").toUpperCase();
  const { t, language } = useLanguage();

  return (
    <article style={tileStyle} className="tile tile--accent">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={avatarStyle}>{first}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </h3>
          <div style={{ opacity: 0.75, fontSize: 13, marginTop: 2 }}>
            {(t.ownerLabel ?? "Owner")}: {owner}
          </div>
        </div>
        {archived && (
          <span style={badgeStyle}>
            {t.archived ?? (language === "cs" ? "ARCHIV" : "ARCHIVED")}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <ListSummary itemsCount={itemsCount} doneCount={doneCount} />
      </div>

      <div className="tile-actions" style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button className="btn btn--ghost" onClick={onOpen}>
          {t.open ? t.open : "Otevřít"}
        </button>
        {onDelete && (
          <button className="btn btn--danger" style={{ marginLeft: "auto" }} onClick={onDelete}>
            {t.delete ? t.delete : "Smazat"}
          </button>
        )}
      </div>
    </article>
  );
}

function CreateListModal({ isOpen, onClose, onCreate }) {
  const [v, setV] = useState("");
  const { t, language } = useLanguage();

  if (!isOpen) return null;
  return (
    <div style={modalBackdropStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>{t.newList ?? (language === "cs" ? "Nový seznam" : "New list")}</h3>
        <input
          placeholder={t.listNamePlaceholder ?? (language === "cs" ? "Název seznamu" : "List name")}
          value={v}
          onChange={(e) => setV(e.target.value)}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={onClose}>{t.cancel ?? (language === "cs" ? "Zrušit" : "Cancel")}</button>
          <button style={{ marginLeft: "auto" }} disabled={!v.trim()} onClick={() => onCreate({ name: v })}>
            {t.create ?? (language === "cs" ? "Vytvořit" : "Create")}
          </button>
        </div>
      </div>
    </div>
  );
}

const toolbarStyle = {
  position: "sticky",
  top: 0,
  zIndex: 5,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 0",
  backdropFilter: "blur(6px)",
};

const pillStyle = (active) => ({
  border: "1px solid var(--border)",
  background: active ? "rgba(79,140,255,.15)" : "transparent",
  color: active ? "var(--primary)" : "var(--text)",
  padding: ".4rem .7rem",
  borderRadius: 999,
  cursor: "pointer",
  transition: "150ms",
  outline: active ? "3px solid rgba(79,140,255,.15)" : "none",
});

const emptyStyle = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "24px 16px",
  border: "1px dashed #333",
  borderRadius: 12,
  background: "#0e0e0e",
};

const tileStyle = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 14,
  background: "var(--card)",
  position: "relative",
  overflow: "hidden",
  boxShadow: "var(--shadow)",
};

const avatarStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(79,140,255,.35), rgba(79,140,255,.15))",
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
};

const badgeStyle = {
  fontSize: 11,
  padding: "2px 8px",
  borderRadius: 999,
  background: "#333",
  letterSpacing: ".06em",
};

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.5)",
  display: "grid",
  placeItems: "center",
  zIndex: 20,
};

const modalStyle = {
  background: "#111",
  border: "1px solid #333",
  padding: 16,
  borderRadius: 12,
  minWidth: 320,
};