import React from 'react';
import { AlertOctagon, X } from 'lucide-react';

export function ValidationModal({ isOpen, errorMessage, onClose, t }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <AlertOctagon className="modal-icon-danger" size={24} />
            <h3 className="modal-title">{t.validationTitle}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            The imported file failed schema or consistency validation checks:
          </p>
          <div className="validation-error-box">
            <code>{errorMessage}</code>
          </div>
          <div className="validation-rules-summary">
            <strong>Requirements checklist:</strong>
            <ul>
              <li>2 to 60 nodes; 1 to 150 undirected edges</li>
              <li>At least one room or junction, and at least one exit</li>
              <li>Unique IDs, positive integer costs, no self-loops, no repeated edge pairs</li>
              <li>Initial state IDs must reference valid existing graph entities</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-primary" onClick={onClose}>
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
}
