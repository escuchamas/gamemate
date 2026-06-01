"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  defaultTab?: string;
  slots: Record<string, React.ReactNode>;
}

export function ProfileTabs({ tabs, defaultTab, slots }: Props) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 bg-[var(--muted)] rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              active === tab.id
                ? "bg-[var(--card)] text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {slots[active]}
    </div>
  );
}
