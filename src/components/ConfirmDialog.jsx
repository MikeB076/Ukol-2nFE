import React from 'react';

export default function ConfirmDialog({ isOpen, text, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="dialog">
        <h3 id="confirm-title">Potvrzení</h3>
        <p>{text}</p>
        <div className="actions">
          <button type="button" onClick={onCancel}>Zrušit</button>
          <button type="button" onClick={onConfirm}>Potvrdit</button>
        </div>
      </div>
    </div>
  );
}