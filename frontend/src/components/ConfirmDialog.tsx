"use client";

import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  loading = false,
  error = "",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2>{title}</h2>
      <p>{message}</p>
      {error && <div className="alert" role="alert">{error}</div>}
      <div className="dialog-actions">
        <button className="btn" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Eliminando..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
