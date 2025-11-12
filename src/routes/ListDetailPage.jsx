import { useMemo, useState, useEffect, useRef } from "react";
import ListHeader from "../components/ListHeader";
import ItemNewForm from "../components/ItemNewForm";
import ItemFilters from "../components/ItemFilters";
import ItemList from "../components/ItemList";
import RenameListModal from "../components/RenameListModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ListDetailPage({ state, setState, id, onBack }) {
  // Najdi list podle ID z globálního (perzistentního) stavu
  const baseList = useMemo(
    () => state.lists.find((l) => l.id === id),
    [state.lists, id]
  );

  // Když ID neexistuje, přesměruj až po renderu
  useEffect(() => {
    if (!baseList) onBack?.();
  }, [baseList, onBack]);

  if (!baseList) return null;

  const currentUserId = state.currentUserId;
  const isOwner = baseList.ownerId === currentUserId;

  // Safe fallbacks to avoid undefined arrays from older data
  const items = Array.isArray(baseList?.items) ? baseList.items : [];
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

  /** -------- Handlery: položky -------- */
  const handleAddItem = (payload) => {
    const text = payload?.name?.trim();
    if (!text || baseList.archived) return;

    const item = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `i_${Date.now().toString(36)}`,
      name: text,
      done: false,
    };

    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => {
        if (l.id !== id) return l;
        const prevItems = Array.isArray(l.items) ? l.items : [];
        const nextItems = [...prevItems, item];
        const itemsCount = nextItems.length;
        const doneCount = nextItems.filter((x) => x.done).length;
        return { ...l, items: nextItems, itemsCount, doneCount };
      }),
    }));
  };

  const handleToggleDone = (itemId, next) => {
    if (baseList.archived) return;
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => {
        if (l.id !== id) return l;
        const prevItems = Array.isArray(l.items) ? l.items : [];
        const nextItems = prevItems.map((it) => (it.id === itemId ? { ...it, done: next } : it));
        const doneCount = nextItems.filter((it) => it.done).length;
        return { ...l, items: nextItems, doneCount };
      }),
    }));
  };

  const handleEditItem = (itemId, name) => {
    if (baseList.archived) return;
    const text = (name || "").trim();
    if (!text) return;
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === id
          ? {
              ...l,
              items: (Array.isArray(l.items) ? l.items : []).map((it) =>
                it.id === itemId ? { ...it, name: text } : it
              ),
            }
          : l
      ),
    }));
  };

  const handleRemoveItem = (itemId) => {
    if (baseList.archived) return;
    setConfirm({
      text: "Smazat položku ze seznamu?",
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          lists: prev.lists.map((l) => {
            if (l.id !== id) return l;
            const prevItems = Array.isArray(l.items) ? l.items : [];
            const nextItems = prevItems.filter((it) => it.id !== itemId);
            const doneCount = nextItems.filter((it) => it.done).length;
            return { ...l, items: nextItems, itemsCount: nextItems.length, doneCount };
          }),
        }));
        setConfirm(null);
      },
    });
  };

  /** -------- Handlery: seznam -------- */
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

  /** -------- Handlery: členové -------- */
  const handleInviteMember = (payload) => {
    if (!isOwner || baseList.archived) return;
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
    if (!isOwner || baseList.archived) return;
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
    if (isOwner || baseList.archived) return; // owner nemůže odejít, ani v archivu
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
                <th scope="col" style={{ width: 200 }}>Akce</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isCurrent = m.id === currentUserId;
                const canRemove = isOwner && m.id !== baseList.ownerId;
                const badgeClass = m.role === "OWNER" ? "badge badge--owner" : "badge badge--member";
                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td><span className={badgeClass}>{m.role}</span></td>
                    <td>
                      {canRemove && (
                        <button className="btn btn--danger" disabled={!!baseList.archived} onClick={() => handleRemoveMember(m.id)}>
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