"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { completeOnboardingAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  currentName: string;
  currentUsername: string;
}

export function SetupForm({ currentName, currentUsername }: Props) {
  const [name, setName] = useState(currentName);
  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await completeOnboardingAction(name, username);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/parties");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-lg bg-red-600/20 border border-red-600/30 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="Nickname / Nombre visible"
        hint="Este es el nombre que verán otros jugadores"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre en la plataforma"
        maxLength={32}
        required
      />

      <Input
        label="Usuario (@handle)"
        hint="Solo minúsculas, números y _ (sin espacios)"
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
        placeholder="gamer123"
        maxLength={24}
        required
      />

      <Button type="submit" loading={isPending} size="lg">
        Guardar y entrar
      </Button>
    </form>
  );
}
