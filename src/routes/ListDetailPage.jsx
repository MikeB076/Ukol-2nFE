import { useMemo, useState, useEffect, useRef } from "react";
import ListHeader from "../components/ListHeader";
import ItemNewForm from "../components/ItemNewForm";
import ItemFilters from "../components/ItemFilters";
import ItemList from "../components/ItemList";
import RenameListModal from "../components/RenameListModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchListDetail, addItem, updateItem, deleteItem } from "../api/mockApi";

// Pomocné funkce – tenké obaly nad mock API z api/mockApi.js
// (upravujeme jen komunikaci, ve zbytku komponenty necháváme logiku nedotčenou)
async function apiGetListDetail(listId) {
  // vrací rovnou JS objekt z mock API
  return fetchListDetail(listId);
}

async function apiAddItem(listId, payload) {
  // stávající kód předává payload { name: "text" } – převedeme to na signaturu mockApi.addItem(listId, text)
  const text = (payload?.name ?? "").trim();
  if (!text) throw new Error("Text položky je prázdný");
  return addItem(listId, text);
}

async function apiPatchItem(listId, itemId, payload) {
  // mockApi.updateItem(listId, itemId, patch)
  return updateItem(listId, itemId, payload || {});
}

async function apiDeleteItem(listId, itemId) {
  // mockApi.deleteItem(listId, itemId)
  return deleteItem(listId, itemId);
}

export default function ListDetailPage({ state, setState, id, onBack }) {
  // Logoický pomocník – vloží nový/aktualizovaný seznam do globálního stavu
  const applyUpdatedList = (nextList) => {
    setState((prev) => {
      const prevLists = Array.isArray(prev.lists) ? prev.lists.filter(Boolean) : [];
      const exists = prevLists.some((l) => l.id === nextList.id);
      return {
        ...prev,
        lists: exists
          ? prevLists.map((l) => (l.id === nextList.id ? nextList : l))
          : [...prevLists, nextList],
      };
    });
  };

  const refreshList = async () => {
    try {
      const detail = await apiGetListDetail(id);
      applyUpdatedList(detail);
    } catch (e) {
      console.error(e);
      alert("Nepodařilo se aktualizovat seznam po změně položek.");
    }
  };

  // Najdi list podle ID z globálního (perzistentního) stavu
  const baseList = useMemo(
    () =>
      Array.isArray(state.lists)
        ? state.lists.filter(Boolean).find((l) => l.id === id)
        : undefined,
    [state.lists, id]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Načtení detailu ze serveru (GET /api/lists/:id)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const detail = await apiGetListDetail(id);
        if (!cancelled) {
          applyUpdatedList(detail);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Nepodařilo se načíst detail seznamu.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Pokud ID neexistuje ani po načtení, vrať se zpět
  useEffect(() => {
    if (!loading && !baseList) onBack?.();
  }, [baseList, loading, onBack]);

  const currentUserId = state.currentUserId;
  const isOwner = baseList && baseList.ownerId === currentUserId;

  // Safe fallbacks to avoid undefined arrays from older data
const rawItems = Array.isArray(baseList?.items) ? baseList.items : [];

// Normalizace názvů – každý item bude mít jak `text`, tak `name`
const items = rawItems.map((item) => ({
  ...item,
  text: item.text ?? item.name ?? "",
  name: item.name ?? item.text ?? "",
}));

const members = Array.isArray(baseList?.members) ? baseList.members : [];
  // Toggle sekce "Členové" (rozbalit/schovat) + automatický scroll při otevření
  const [showMembers, setShowMembers] = useState(false);
  const membersRef = useRef(null);
  useEffect(() => {
    if (showMembers && membersRef.current) {
      membersRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showMembers]);

  // UI-only stavy
  const [showDone, setShowDone] = useState(false); // default: jen nevyřešené
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { text, onConfirm }

  if (!baseList) {
    return (
      <div className="container">
        <button onClick={onBack} style={{ marginBottom: 12 }}>
          &larr; Zpět
        </button>

        {loading && (
          <div className="alert alert--info">
            <p>Načítám detail seznamu…</p>
          </div>
        )}

        {!loading && (
          <div className="alert alert--error">
            <p>Seznam nebyl nalezen nebo se ho nepodařilo načíst.</p>
            {error && <p className="alert__detail">{error}</p>}
          </div>
        )}
      </div>
    );
  }

  /** -------- Handlery: položky – nyní přes API -------- */
  const handleAddItem = async (payload) => {
  if (!baseList || baseList.archived) return;

  // Zkusíme postupně různé názvy polí, podle toho, co posílá ItemNewForm
  const text = (
    payload?.name ??
    payload?.text ??
    payload?.value ??
    ""
  ).trim();

  if (!text) return;

  try {
    // apiAddItem očekává objekt s name, tak ho tam zkonvertujeme
    await apiAddItem(id, { name: text });
    await refreshList();
  } catch (e) {
    console.error(e);
    alert("Nepodařilo se přidat položku.");
  }
};

  const handleToggleDone = async (itemId, next) => {
    if (!baseList || baseList.archived) return;
    try {
      await apiPatchItem(id, itemId, { done: next });
      await refreshList();
    } catch (e) {
      console.error(e);
      alert("Nepodařilo se aktualizovat položku.");
    }
  };

  const handleEditItem = async (itemId, name) => {
    if (!baseList || baseList.archived) return;
    const text = (name || "").trim();
    if (!text) return;
    try {
      await apiPatchItem(id, itemId, { name: text });
      await refreshList();
    } catch (e) {
      console.error(e);
      alert("Nepodařilo se upravit položku.");
    }
  };

  const handleRemoveItem = (itemId) => {
    if (!baseList || baseList.archived) return;
    setConfirm({
      text: "Smazat položku ze seznamu?",
      onConfirm: async () => {
        try {
          await apiDeleteItem(id, itemId);
          await refreshList();
        } catch (e) {
          console.error(e);
          alert("Nepodařilo se smazat položku.");
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  /** -------- Handlery: seznam (zatím lokálně, bez API) -------- */
  const handleRename = (newName) => {
    if (!isOwner) return;
    const next = (newName || "").trim();
    if (!next) return;
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === id ? { ...l, title: next, name: next } : l)),
    }));
    setRenameOpen(false);
  };

  const handleArchiveToggle = (next) => {
    if (!isOwner) return;
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === id ? { ...l, archived: !!next } : l)),
    }));
  };

  const handleDeleteList = () => {
    if (!isOwner) return;
    setConfirm({
      text: "Opravdu smazat tento nákupní seznam?",
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          lists: prev.lists.filter((l) => l.id !== id),
        }));
        setConfirm(null);
        onBack?.();
      },
    });
  };

  /** -------- Handlery: členové (zatím lokálně) -------- */
  const handleInviteMember = (payload) => {
    if (!baseList || !isOwner || baseList.archived) return;
    const name = (payload?.user || "").trim();
    if (!name) return;
    const member = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `u_${Date.now().toString(36)}`,
      name,
      role: "MEMBER",
    };
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === id
          ? { ...l, members: [...(Array.isArray(l.members) ? l.members : []), member] }
          : l
      ),
    }));
  };

  const handleRemoveMember = (userId) => {
    if (!baseList || !isOwner || baseList.archived) return;
    if (userId === baseList.ownerId) return; // ownera neodstraňuj
    setConfirm({
      text: "Odebrat člena ze seznamu?",
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          lists: prev.lists.map((l) =>
            l.id === id
              ? {
                  ...l,
                  members: (Array.isArray(l.members) ? l.members : []).filter((m) => m.id !== userId),
                }
              : l
          ),
        }));
        setConfirm(null);
      },
    });
  };

  const handleLeave = () => {
    if (!baseList || isOwner || baseList.archived) return; // owner nemůže odejít, ani v archivu
    setConfirm({
      text: "Opravdu chcete odejít ze seznamu?",
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          lists: prev.lists.map((l) =>
            l.id === id
              ? {
                  ...l,
                  members: (Array.isArray(l.members) ? l.members : []).filter(
                    (m) => m.id !== currentUserId
                  ),
                }
              : l
          ),
        }));
        setConfirm(null);
      },
    });
  };

  const onOpenMembers = () => {
    setShowMembers((prev) => !prev);
  };

  /** -------- Odvozeniny -------- */
  const filteredItems = useMemo(
    () => (showDone ? items : items.filter((i) => !i.done)),
    [items, showDone]
  );

  const title = baseList.title ?? baseList.name; // pro jistotu podporuj obě pole

  return (
    <div className="container">
      <button onClick={onBack} style={{ marginBottom: 12 }}>
        &larr; Zpět
      </button>

      {loading && (
        <div className="alert alert--info" style={{ marginBottom: 12 }}>
          <p>Načítám aktuální stav seznamu…</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert--error" style={{ marginBottom: 12 }}>
          <p>{error}</p>
        </div>
      )}

      <div className="card vstack">
        <ListHeader
          title={title}
          isOwner={isOwner}
          isArchived={!!baseList.archived}
          onRename={() => setRenameOpen(true)}
          onArchiveToggle={handleArchiveToggle}
          onDelete={handleDeleteList}
          onOpenMembers={onOpenMembers}
        />

        <div className="section">
          <ItemNewForm onAdd={handleAddItem} disabled={!!baseList.archived} />
          <ItemFilters showDone={showDone} onToggle={setShowDone} />
          <ItemList
            items={filteredItems}
            onToggleDone={handleToggleDone}
            onEdit={handleEditItem}
            onRemove={handleRemoveItem}
            disabled={!!baseList.archived}
          />
        </div>

        {/* ---- Členové seznamu */}
        {showMembers && (
          <section id="members-section" ref={membersRef} className="section vstack">
            <h3>Členové</h3>

            {/* přidání člena – povoleno jen ownerovi */}
            {isOwner && (
              <InlineInvite onInvite={handleInviteMember} disabled={!!baseList.archived} />
            )}

            <table className="table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th scope="col">Uživatel</th>
                  <th scope="col">Role</th>
                  <th scope="col" style={{ width: 200 }}>
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isCurrent = m.id === currentUserId;
                  const canRemove = isOwner && m.id !== baseList.ownerId;
                  const badgeClass =
                    m.role === "OWNER" ? "badge badge--owner" : "badge badge--member";
                  return (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>
                        <span className={badgeClass}>{m.role}</span>
                      </td>
                      <td>
                        {canRemove && (
                          <button
                            className="btn btn--danger"
                            disabled={!!baseList.archived}
                            onClick={() => handleRemoveMember(m.id)}
                          >
                            Odebrat
                          </button>
                        )}
                        {!isOwner && isCurrent && (
                          <button
                            className="btn btn--ghost"
                            style={{ marginLeft: 8 }}
                            disabled={!!baseList.archived}
                            onClick={handleLeave}
                          >
                            Odejít
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
      </div>

      {/* Modaly */}
      <RenameListModal
        isOpen={renameOpen}
        onClose={() => setRenameOpen(false)}
        onSubmit={handleRename}
        defaultValue={title}
      />
      <ConfirmDialog
        isOpen={!!confirm}
        text={confirm?.text ?? ""}
        onConfirm={() => {
          confirm?.onConfirm?.();
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

/** Jednoduchý inline formulář  */
function InlineInvite({ onInvite, disabled }) {
  const [v, setV] = useState("");
  return (
    <div className="input-group">
      <input
        className="input"
        placeholder="E-mail / jméno"
        value={v}
        disabled={disabled}
        onChange={(e) => setV(e.target.value)}
      />
      <button
        className="btn btn--primary"
        disabled={disabled || !v.trim()}
        onClick={() => {
          onInvite({ user: v });
          setV("");
        }}
      >
        Pozvat
      </button>
    </div>
  );
}