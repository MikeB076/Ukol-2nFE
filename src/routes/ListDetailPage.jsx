import { useMemo, useState, useEffect, useRef } from "react";
import ListHeader from "../components/ListHeader";
import ItemNewForm from "../components/ItemNewForm";
import ItemFilters from "../components/ItemFilters";
import ItemList from "../components/ItemList";
import RenameListModal from "../components/RenameListModal";
import ConfirmDialog from "../components/ConfirmDialog";
import DetailPieChart from "../components/charts/DetailPieChart";
import { useLanguage } from "../context/LanguageContext";
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

  const { t } = useLanguage();

  const refreshList = async () => {
    try {
      const detail = await apiGetListDetail(id);
      applyUpdatedList(detail);
    } catch (e) {
      console.error(e);
      alert(t.failedUpdateAfterItems ?? "Nepodařilo se aktualizovat seznam po změně položek.");
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
          setError(t.failedLoadDetail ?? "Nepodařilo se načíst detail seznamu.");
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

  // Odvozené položky podle filtru (zobrazit i vyřešené)
  const filteredItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    return showDone ? safeItems : safeItems.filter((i) => !i.done);
  }, [items, showDone]);

  if (!baseList) {
    return (
      <div className="container">
        <button onClick={onBack} style={{ marginBottom: 12 }}>
          &larr; {t.backToLists ?? "Zpět"}
        </button>

        {loading && (
          <div className="alert alert--info">
            <p>{t.loadingListDetail ?? "Načítám detail seznamu…"}</p>
          </div>
        )}

        {!loading && (
          <div className="alert alert--error">
            <p>{t.listNotFound ?? "Seznam nebyl nalezen nebo se ho nepodařilo načíst."}</p>
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
      alert(t.failedAddItem ?? "Nepodařilo se přidat položku.");
    }
  };

  const handleToggleDone = async (itemId, next) => {
    if (!baseList || baseList.archived) return;
    try {
      await apiPatchItem(id, itemId, { done: next });
      await refreshList();
    } catch (e) {
      console.error(e);
      alert(t.failedUpdateItem ?? "Nepodařilo se aktualizovat položku.");
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
      alert(t.failedEditItem ?? "Nepodařilo se upravit položku.");
    }
  };

  const handleRemoveItem = (itemId) => {
    if (!baseList || baseList.archived) return;
    setConfirm({
      text: t.confirmDeleteItem ?? "Smazat položku ze seznamu?",
      onConfirm: async () => {
        try {
          await apiDeleteItem(id, itemId);
          await refreshList();
        } catch (e) {
          console.error(e);
          alert(t.failedDeleteItem ?? "Nepodařilo se smazat položku.");
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
      text: t.confirmDeleteList ?? "Opravdu smazat tento nákupní seznam?",
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
      text: t.confirmRemoveMember ?? "Odebrat člena ze seznamu?",
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
      text: t.confirmLeaveList ?? "Opravdu chcete odejít ze seznamu?",
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
  const title = baseList.title ?? baseList.name; // pro jistotu podporuj obě pole

  const doneCount = items.reduce((acc, it) => acc + (it.done ? 1 : 0), 0);
  const totalCount = items.length;
  const pendingCount = Math.max(0, totalCount - doneCount);

  return (
    <div className="detail-wrap">
      <div className="container">
        <button className="btn btn--ghost btn--back" onClick={onBack}>
          &larr; {t.backToLists ?? "Zpět"}
        </button>

        {loading && (
          <div className="alert alert--info alert--spaced">
            <p>{t.loadingList ?? "Načítám aktuální stav seznamu…"}</p>
          </div>
        )}

        {error && !loading && (
          <div className="alert alert--error alert--spaced">
            <p>{error}</p>
          </div>
        )}

        <div className="card detail-card vstack" style={{ overflow: "visible" }}>
        <ListHeader
          title={title}
          isOwner={isOwner}
          isArchived={!!baseList.archived}
          onRename={() => setRenameOpen(true)}
          onArchiveToggle={handleArchiveToggle}
          onDelete={handleDeleteList}
          onOpenMembers={onOpenMembers}
        />

        <div className="section detail-stats">
          {/* Left: KPIs (nicely formatted) */}
          <div className="detail-stats-panel">
            <h3 className="detail-section-title">{t.statistics ?? "Statistiky"}</h3>

            <dl className="stats-list">
              <div className="stats-item">
                <dt className="label">{t.done ?? "Hotovo"}</dt>
                <dd className="value">{doneCount}</dd>
              </div>
              <div className="stats-item">
                <dt className="label">{t.pending ?? "Čeká"}</dt>
                <dd className="value">{pendingCount}</dd>
              </div>
              <div className="stats-item">
                <dt className="label">{t.total ?? "Celkem"}</dt>
                <dd className="value">{totalCount}</dd>
              </div>
            </dl>
          </div>

          {/* Right: chart in its own box so it won't get cut */}
          <div className="detail-stats-panel">
            <div className="chart-box detail-chart" aria-label="Progress chart">
              <DetailPieChart items={items} itemsCount={totalCount} doneCount={doneCount} />
            </div>
          </div>
        </div>

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
            <h3>{t.members ?? "Členové"}</h3>

            {/* přidání člena – povoleno jen ownerovi */}
            {isOwner && (
              <InlineInvite onInvite={handleInviteMember} disabled={!!baseList.archived} />
            )}

            <table className="table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th scope="col">{t.user ?? "Uživatel"}</th>
                  <th scope="col">{t.role ?? "Role"}</th>
                  <th scope="col" style={{ width: 200 }}>
                    {t.action ?? "Akce"}
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
                            {t.remove ?? "Odebrat"}
                          </button>
                        )}
                        {!isOwner && isCurrent && (
                          <button
                            className="btn btn--ghost"
                            style={{ marginLeft: 8 }}
                            disabled={!!baseList.archived}
                            onClick={handleLeave}
                          >
                            {t.leave ?? "Odejít"}
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
    </div>
  );
}

/** Jednoduchý inline formulář  */
function InlineInvite({ onInvite, disabled }) {
  const [v, setV] = useState("");
  const { t } = useLanguage();
  return (
    <div className="input-group">
      <input
        className="input"
        placeholder={t.emailOrName ?? "E-mail / jméno"}
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
        {t.invite ?? "Pozvat"}
      </button>
    </div>
  );
}