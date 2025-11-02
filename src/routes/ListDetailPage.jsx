import { useMemo, useState } from "react";
import ListHeader from "../components/ListHeader";
import ItemNewForm from "../components/ItemNewForm";
import ItemFilters from "../components/ItemFilters";
import ItemList from "../components/ItemList";
import RenameListModal from "../components/RenameListModal";
import ConfirmDialog from "../components/ConfirmDialog";

/** --- Inicializační data uložená na úrovni route  */
const INITIAL = {
  currentUserId: "u1", // změň na "u1", pokud chceš testovat roli ownera
  list: {
    id: "list-1",
    title: "Nákup na víkend",
    archived: false,
    ownerId: "u1",
    items: [
      { id: "i1", name: "Mléko 2×", done: false },
      { id: "i2", name: "Rohlíky 10×", done: true },
      { id: "i3", name: "Máslo", done: false },
      { id: "i4", name: "Pepř", done: false },
    ],
    members: [
      { id: "u1", name: "Owner", role: "OWNER" },
      { id: "u2", name: "Michal", role: "MEMBER" },
    ],
  },
};

export default function ListDetailPage() {
  const [title, setTitle] = useState(INITIAL.list.title);
  const [archived, setArchived] = useState(INITIAL.list.archived);
  const [items, setItems] = useState(INITIAL.list.items);
  const [members, setMembers] = useState(INITIAL.list.members);
  const [showDone, setShowDone] = useState(false); // default: jen nevyřešené

  // modaly
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { text, onConfirm }

  const isOwner = useMemo(
    () => INITIAL.currentUserId === INITIAL.list.ownerId,
    []
  );

  /** -------- Handlery: položky -------- */
  const handleAddItem = (payload) => {
    const text = payload?.name?.trim();
    if (!text || archived) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: text, done: false },
    ]);
  };

  const handleToggleDone = (id, next) => {
    if (archived) return;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: next } : it)));
  };

  const handleEditItem = (id, name) => {
    if (archived) return;
    const text = name.trim();
    if (!text) return;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, name: text } : it)));
  };

  const handleRemoveItem = (id) => {
    if (archived) return;
    setConfirm({
      text: "Smazat položku ze seznamu?",
      onConfirm: () => {
        setItems((prev) => prev.filter((it) => it.id !== id));
        setConfirm(null);
      },
    });
  };

  /** -------- Handlery: seznam -------- */
  const handleRename = (newName) => {
    if (!isOwner) return;
    const next = (newName || "").trim();
    if (!next) return;
    setTitle(next);
    setRenameOpen(false);
  };

  const handleArchiveToggle = (next) => {
    if (!isOwner) return;
    setArchived(!!next);
  };

  const handleDeleteList = () => {
    if (!isOwner) return;
    setConfirm({
      text: "Opravdu smazat tento nákupní seznam?",
      onConfirm: () => {
        setItems([]);
        setMembers((m) => m.filter(() => false));
        setConfirm(null);
      },
    });
  };

  /** -------- Handlery: členové -------- */
  const handleInviteMember = (payload) => {
    if (!isOwner || archived) return;
    const name = (payload?.user || "").trim();
    if (!name) return;
    setMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, role: "MEMBER" },
    ]);
  };

  const handleRemoveMember = (userId) => {
    if (!isOwner || archived) return;
    if (userId === INITIAL.list.ownerId) return; // ownera neodstraňuj
    setConfirm({
      text: "Odebrat člena ze seznamu?",
      onConfirm: () => {
        setMembers((prev) => prev.filter((m) => m.id !== userId));
        setConfirm(null);
      },
    });
  };

  const handleLeave = () => {
    const amIOwner = isOwner; // čitelněji
    if (amIOwner || archived) return; // owner nemůže odejít, ani v archivu
    setConfirm({
      text: "Opravdu chcete odejít ze seznamu?",
      onConfirm: () => {
        setMembers((prev) => prev.filter((m) => m.id !== INITIAL.currentUserId));
        setConfirm(null);
      },
    });
  };

  const onOpenMembers = () => {
    const info = document.getElementById("members-section");
    info?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** -------- Odvozeniny -------- */
  const filteredItems = useMemo(
    () => (showDone ? items : items.filter((i) => !i.done)),
    [items, showDone]
  );

  return (
    <div className="container">
      <div className="card vstack">
        <ListHeader
          title={title}
          isOwner={isOwner}
          isArchived={archived}
          onRename={() => setRenameOpen(true)}
          onArchiveToggle={handleArchiveToggle}
          onDelete={handleDeleteList}
          onOpenMembers={onOpenMembers}
        />

        <div className="section">
          <ItemNewForm onAdd={handleAddItem} disabled={archived} />
          <ItemFilters showDone={showDone} onToggle={setShowDone} />
          <ItemList
            items={filteredItems}
            onToggleDone={handleToggleDone}
            onEdit={handleEditItem}
            onRemove={handleRemoveItem}
            disabled={archived}
          />
        </div>

        {/* ---- Členové seznamu */}
        <section id="members-section" className="section vstack">
          <h3>Členové</h3>

          {/* přidání člena – povoleno jen ownerovi */}
          {isOwner && (
            <InlineInvite onInvite={handleInviteMember} disabled={archived} />
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
                const isCurrent = m.id === INITIAL.currentUserId;
                const canRemove = isOwner && m.id !== INITIAL.list.ownerId;
                const badgeClass = m.role === "OWNER" ? "badge badge--owner" : "badge badge--member";
                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td><span className={badgeClass}>{m.role}</span></td>
                    <td>
                      {canRemove && (
                        <button className="btn btn--danger" disabled={archived} onClick={() => handleRemoveMember(m.id)}>
                          Odebrat
                        </button>
                      )}
                      {!isOwner && isCurrent && (
                        <button
                          className="btn btn--ghost"
                          style={{ marginLeft: 8 }}
                          disabled={archived}
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