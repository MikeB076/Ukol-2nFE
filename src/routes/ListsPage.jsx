import { useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

/** Fallback otevření detailu jedním reloadem, pokud není předán onOpen */
function openList(id) {
  window.location.href = `/lists/${id}`;
}

export default function ListsPage({ state, setState, onOpen }) {
  const { currentUserId, lists } = state;

  // UI-only stavy
  const [showArchived, setShowArchived] = useState(false); // zobrazit i archiv
  const [scope, setScope] = useState("all"); // all | owned | member
  const [createOpen, setCreateOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // {text, onConfirm}

  function handleOpen(id) {
    if (typeof onOpen === "function") onOpen(id);
    else openList(id);
  }

  /** Odvozené seznamy dle filtrů */
  const filtered = useMemo(() => {
    let out = lists || [];
    if (!showArchived) out = out.filter((l) => !l.archived);
    if (scope === "owned") out = out.filter((l) => l.ownerId === currentUserId);
    if (scope === "member") out = out.filter((l) => l.ownerId !== currentUserId);
    return out;
  }, [lists, showArchived, scope, currentUserId]);

  const myListsCount = useMemo(
    () => (lists || []).filter((l) => l.ownerId === currentUserId).length,
    [lists, currentUserId]
  );
  const archivedCount = useMemo(
    () => (lists || []).filter((l) => l.archived).length,
    [lists]
  );

  const canDelete = (list) => list.ownerId === currentUserId;

  const handleDelete = (id) => {
    const list = lists.find((l) => l.id === id);
    if (!list || !canDelete(list)) return;
    setConfirm({
      text: `Opravdu smazat seznam „${list.name}“?`,
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          lists: prev.lists.filter((l) => l.id !== id),
        }));
        setConfirm(null);
      },
    });
  };

  const handleCreate = (payload) => {
    const name = (payload?.name || "").trim();
    if (!name) return;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `l_${Date.now().toString(36)}`;

    setState((prev) => ({
      ...prev,
      lists: [
        {
          id,
          name,
          archived: false,
          ownerId: currentUserId,
          itemsCount: 0,
          doneCount: 0,
          items: [],
        },
        ...prev.lists,
      ],
    }));
    setCreateOpen(false);
  };

  /** UI */
  return (
    <div style={{ maxWidth: 980, margin: "32px auto", padding: "0 16px" }}>
      {/* Hero */}
      <header style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Moje nákupní seznamy</h1>
          <p style={{ margin: "6px 0 0", opacity: .7, fontSize: 14 }}>
            Spravuj seznamy, sdílej s členy a sleduj progres.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn--secondary" onClick={() => alert("Demo: import…")}>Importovat</button>
          <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>+ Nový seznam</button>
        </div>
      </header>

      {/* Quick stats */}
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "1rem", margin: "0 0 10px", color: "var(--muted, #aaa)" }}>
        <li>Celkem: <strong style={{ color: "var(--text, #fff)" }}>{lists.length}</strong></li>
        <li>Moje: <strong style={{ color: "var(--text, #fff)" }}>{myListsCount}</strong></li>
        <li>Archiv: <strong style={{ color: "var(--text, #fff)" }}>{archivedCount}</strong></li>
      </ul>

      {/* Toolbar s filtry (pills) */}
      <div style={toolbarStyle}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "owned", "member"].map((key) => (
            <button
              key={key}
              onClick={() => setScope(key)}
              style={pillStyle(scope === key)}
            >
              {key === "all" ? "Vše" : key === "owned" ? "Jen moje" : "Sdílené"}
            </button>
          ))}
        </div>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Zobrazit archivované
        </label>
      </div>

      {/* Grid */}
      <TilesGrid>
        {filtered.map((l) => (
          <ListTile
            key={l.id}
            name={l.name}
            owner={l.ownerId === currentUserId ? "Ty" : l.ownerId}
            itemsCount={l.itemsCount}
            doneCount={l.doneCount}
            archived={l.archived}
            onOpen={() => handleOpen(l.id)}
            onDelete={canDelete(l) ? () => handleDelete(l.id) : null}
          />
        ))}
        {filtered.length === 0 && (
          <div style={emptyStyle} className="card">
            <h3 style={{ margin: "0 0 6px" }}>Žádné seznamy</h3>
            <p style={{ margin: 0, opacity: .7 }}>Změň filtr nebo založ nový seznam.</p>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>Vytvořit první seznam</button>
            </div>
          </div>
        )}
      </TilesGrid>

      {/* Modaly & potvrzení */}
      {createOpen && (
        <CreateListModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreate}
        />
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

/** --- Grid wrapper */
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

/** --- Jedna dlaždice s avatarem a progresem */
function ListTile({ name, owner, itemsCount, doneCount, archived, onOpen, onDelete }) {
  const first = (name?.[0] || "S").toUpperCase();
  const ratio = itemsCount ? Math.min(100, Math.round((doneCount / itemsCount) * 100)) : 0;

  return (
    <article style={tileStyle} className="tile tile--accent">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={avatarStyle}>{first}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</h3>
          <div style={{ opacity: .75, fontSize: 13, marginTop: 2 }}>Owner: {owner}</div>
        </div>
        {archived && <span style={badgeStyle}>ARCHIV</span>}
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={progressTrackStyle}>
          <div style={{ ...progressBarStyle, width: `${ratio}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 12, opacity: .8 }}>
          <span>Hotovo {doneCount}/{itemsCount}</span>
          <span>{ratio}%</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btn--ghost" onClick={onOpen}>Otevřít</button>
        {onDelete && (
          <button className="btn btn--danger" style={{ marginLeft: "auto" }} onClick={onDelete}>
            Smazat
          </button>
        )}
      </div>
    </article>
  );
}

/** --- Modal pro vytvoření nového seznamu */
function CreateListModal({ isOpen, onClose, onCreate }) {
  const [v, setV] = useState("");

  if (!isOpen) return null;
  return (
    <div style={modalBackdropStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>Nový seznam</h3>
        <input
          placeholder="Název seznamu"
          value={v}
          onChange={(e) => setV(e.target.value)}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={onClose}>Zrušit</button>
          <button
            style={{ marginLeft: "auto" }}
            disabled={!v.trim()}
            onClick={() => onCreate({ name: v })}
          >
            Vytvořit
          </button>
        </div>
      </div>
    </div>
  );
}

/** --- Stylové objekty (inline kvůli jednoduché integraci) */
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
  border: "1px solid var(--border, #2c2c2c)",
  background: active ? "rgba(79,140,255,.15)" : "#141414",
  color: "var(--text, #fff)",
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
  border: "1px solid #2c2c2c",
  borderRadius: 12,
  padding: 14,
  background: "#111",
  position: "relative",
  overflow: "hidden",
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

const progressTrackStyle = {
  height: 8,
  background: "#1a1a1a",
  borderRadius: 999,
  overflow: "hidden",
  border: "1px solid #242424",
};

const progressBarStyle = {
  height: "100%",
  background: "linear-gradient(90deg, #4f8cff, #53e68a)",
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