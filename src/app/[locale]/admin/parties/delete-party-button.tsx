"use client";

import { deletePartyAdminAction } from "@/actions/admin";

export function DeletePartyButton({ partyId, partyName }: { partyId: string; partyName: string }) {
  return (
    <form
      action={deletePartyAdminAction.bind(null, partyId)}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar "${partyName}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
        Eliminar
      </button>
    </form>
  );
}
