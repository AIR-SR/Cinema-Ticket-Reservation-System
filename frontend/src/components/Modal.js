import React from "react";

const Modal = ({ title, children, onClose, onSave }) => {
  return (
    <div className="modal-overlay">
      <div className="modal d-block modal-centered">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              {onSave && (
                <button type="button" className="btn btn-primary" onClick={onSave}>
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;