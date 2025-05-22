import React from "react";

const Modal = ({
  title,
  children,
  onClose,
  onSave,
  saveText = "Save Changes",
  cancelText = "Cancel",
  saveButtonType = "primary",
  cancelButtonType = "secondary",
  showSave = true,
  showCancel = true,
  saveDisabled = false,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal d-block modal-centered">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <>
                {showCancel && (
                  <button
                    type="button"
                    className={`btn btn-${cancelButtonType}`}
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                )}
                {showSave && onSave && (
                  <button
                    type="button"
                    className={`btn btn-${saveButtonType}`}
                    onClick={onSave}
                    disabled={saveDisabled}
                  >
                    {saveText}
                  </button>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
