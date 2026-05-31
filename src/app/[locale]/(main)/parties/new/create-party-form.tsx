"use client";

import { useState, useActionState } from "react";
import { useTranslations } from "next-intl";
import { createPartyAction } from "@/actions/party";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_RULES,
  RULE_CATEGORY_LABELS,
  LANGUAGES,
  SKILL_CRITERIA,
  POPULAR_MODPACKS,
  MINECRAFT_VERSION_LABELS,
} from "@/lib/constants";
import type { Game } from "@/generated/prisma/client";

type RuleCategory = "BEHAVIOR" | "GAMEPLAY" | "COMMUNICATION" | "CUSTOM";

interface CustomRule {
  category: RuleCategory;
  text: string;
}

type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export function CreatePartyForm() {
  const [state, action, isPending] = useActionState(createPartyAction, {});
  const [selectedGame, setSelectedGame] = useState<Game | "">("");
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | "">("");
  const [showSkillGuide, setShowSkillGuide] = useState(false);
  const [modded, setModded] = useState(false);
  const [modTags, setModTags] = useState<string[]>([]);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [newRuleText, setNewRuleText] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState<RuleCategory>("CUSTOM");
  const t = useTranslations("createParty");

  const gameRules = selectedGame ? DEFAULT_RULES[selectedGame] : [];
  const requiredRules = gameRules.filter((r) => r.isRequired);
  const optionalRules = gameRules.filter((r) => !r.isRequired);

  const toggleRule = (text: string) => {
    setSelectedRules((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };

  const toggleModTag = (tag: string) => {
    setModTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomRule = () => {
    if (newRuleText.trim().length < 5) return;
    setCustomRules((prev) => [
      ...prev,
      { category: newRuleCategory, text: newRuleText.trim() },
    ]);
    setNewRuleText("");
  };

  const removeCustomRule = (idx: number) => {
    setCustomRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const skillLevels: { value: SkillLevel; label: string }[] = [
    { value: "BEGINNER", label: "Principiante — nuevo en el juego" },
    { value: "INTERMEDIATE", label: "Intermedio — conozco lo básico" },
    { value: "ADVANCED", label: "Avanzado — tengo mucha experiencia" },
    { value: "EXPERT", label: "Experto — domino todo el juego" },
  ];

  const popularPacks =
    selectedGame && selectedGame in POPULAR_MODPACKS
      ? POPULAR_MODPACKS[selectedGame as keyof typeof POPULAR_MODPACKS]
      : [];

  return (
    <form action={action} className="flex flex-col gap-6">
      <input
        type="hidden"
        name="selectedRules"
        value={JSON.stringify(Array.from(selectedRules))}
      />
      <input
        type="hidden"
        name="customRules"
        value={JSON.stringify(customRules)}
      />
      <input
        type="hidden"
        name="modTags"
        value={JSON.stringify(modTags)}
      />

      {state.error && (
        <div className="rounded-lg bg-red-600/20 border border-red-600/30 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {/* Basic info */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-white">{t("sections.basic")}</h2>

        <Input
          name="name"
          label={t("fields.name")}
          placeholder={t("fields.namePlaceholder")}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {t("fields.description")}
          </label>
          <textarea
            name="description"
            placeholder={t("fields.descriptionPlaceholder")}
            className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={3}
            maxLength={300}
          />
        </div>

        <Select
          name="game"
          label={t("fields.game")}
          value={selectedGame}
          onChange={(e) => {
            setSelectedGame(e.target.value as Game);
            setModTags([]);
          }}
          options={[
            { value: "MINECRAFT", label: "⛏️ Minecraft" },
            { value: "PROJECT_ZOMBOID", label: "🧟 Project Zomboid" },
          ]}
          placeholder={t("selectGameFirst")}
          required
        />

        {selectedGame === "MINECRAFT" && (
          <Select
            name="minecraftVersion"
            label="Versión de Minecraft"
            options={Object.entries(MINECRAFT_VERSION_LABELS).map(([value, label]) => ({ value, label }))}
            placeholder="Selecciona versión"
            required
          />
        )}

        {/* Skill level selector + criteria guide */}
        <div className="flex flex-col gap-1.5">
          <Select
            name="skillLevel"
            label={t("fields.skillLevel")}
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value as SkillLevel)}
            options={skillLevels}
            placeholder="Selecciona un nivel"
            required
          />

          {selectedGame && (
            <button
              type="button"
              onClick={() => setShowSkillGuide((v) => !v)}
              className="text-xs text-orange-400 hover:text-orange-300 text-left transition-colors"
            >
              {showSkillGuide ? "▲ Ocultar guía de niveles" : "▼ ¿Qué significa cada nivel?"}
            </button>
          )}

          {showSkillGuide && selectedGame && selectedGame in SKILL_CRITERIA && (
            <div className="rounded-lg bg-[var(--muted)] border border-[var(--card-border)] p-3 flex flex-col gap-2 mt-1">
              {skillLevels.map(({ value, label }) => {
                const criteria = SKILL_CRITERIA[selectedGame as keyof typeof SKILL_CRITERIA][value];
                const isSelected = selectedSkill === value;
                return (
                  <div
                    key={value}
                    className={`rounded-lg px-3 py-2 border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-orange-600/15 border-orange-600/40"
                        : "bg-[var(--card)] border-[var(--card-border)]"
                    }`}
                    onClick={() => setSelectedSkill(value)}
                  >
                    <p className="text-xs font-semibold text-white mb-0.5">
                      {label.split(" — ")[0]}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {criteria}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Players & settings */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-white">{t("sections.players")}</h2>

        <div className="grid grid-cols-2 gap-3">
          <Select
            name="minPlayers"
            label={t("fields.minPlayers")}
            options={[2, 3, 4, 5, 6].map((n) => ({
              value: String(n),
              label: `${n}`,
            }))}
          />
          <Select
            name="maxPlayers"
            label={t("fields.maxPlayers")}
            options={[2, 3, 4, 5, 6].map((n) => ({
              value: String(n),
              label: `${n}`,
            }))}
            defaultValue="4"
          />
        </div>

        <Select
          name="language"
          label={t("fields.language")}
          options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
          defaultValue="es"
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="modded"
                value="true"
                checked={modded}
                className="w-4 h-4 rounded accent-orange-600"
                onChange={(e) => {
                  setModded(e.target.checked);
                  if (!e.target.checked) setModTags([]);
                  const hiddenInput = document.querySelector(
                    'input[name="modded"][type="hidden"]'
                  ) as HTMLInputElement;
                  if (hiddenInput) hiddenInput.value = String(e.target.checked);
                }}
              />
              <span className="text-sm text-[var(--foreground)]">
                {t("fields.modded")}
              </span>
            </label>
          </div>
          <input type="hidden" name="modded" value={String(modded)} />

          {/* Popular modpacks — shown when modded + game selected */}
          {modded && selectedGame && popularPacks.length > 0 && (
            <div className="rounded-lg bg-[var(--muted)] border border-[var(--card-border)] p-3 flex flex-col gap-2">
              <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                Modpacks populares — toca para añadir
              </p>
              <div className="flex flex-wrap gap-1.5">
                {popularPacks.map((pack) => {
                  const active = modTags.includes(pack);
                  return (
                    <button
                      key={pack}
                      type="button"
                      onClick={() => toggleModTag(pack)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                        active
                          ? "bg-orange-600 border-orange-500 text-white"
                          : "bg-[var(--card)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:border-orange-500/50 hover:text-[var(--foreground)]"
                      }`}
                    >
                      {active ? "✓ " : ""}{pack}
                    </button>
                  );
                })}
              </div>
              {modTags.length > 0 && (
                <p className="text-xs text-orange-400">
                  Seleccionados: {modTags.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>

        <Input
          name="modsNote"
          label={t("fields.modsNote")}
          placeholder={t("fields.modsNotePlaceholder")}
        />

        <Input
          name="serverInfo"
          label={t("fields.serverInfo")}
          placeholder={t("fields.serverInfoPlaceholder")}
          hint={t("fields.serverInfoHint")}
        />
      </div>

      {/* Rules */}
      {selectedGame && (
        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold text-white">{t("sections.rules")}</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {t("rules.subtitle")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
              {t("rules.required")}
            </p>
            <div className="flex flex-col gap-2">
              {requiredRules.map((rule) => (
                <div
                  key={rule.text}
                  className="flex items-start gap-2 px-3 py-2 rounded-lg bg-green-600/10 border border-green-600/20"
                >
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  <span className="flex-1 text-xs text-[var(--foreground)]">
                    {rule.text}
                  </span>
                  <Badge variant="success" className="flex-shrink-0">
                    {RULE_CATEGORY_LABELS[rule.category]}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
              {t("rules.optional")}
            </p>
            <div className="flex flex-col gap-2">
              {optionalRules.map((rule) => (
                <label
                  key={rule.text}
                  className={`flex items-start gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedRules.has(rule.text)
                      ? "bg-orange-600/15 border-orange-600/40"
                      : "bg-[var(--muted)] border-[var(--card-border)] hover:border-orange-500/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRules.has(rule.text)}
                    onChange={() => toggleRule(rule.text)}
                    className="mt-0.5 w-4 h-4 accent-orange-600 flex-shrink-0"
                  />
                  <span className="flex-1 text-xs text-[var(--foreground)]">
                    {rule.text}
                  </span>
                  <Badge variant="default" className="flex-shrink-0">
                    {RULE_CATEGORY_LABELS[rule.category]}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
              {t("rules.custom")}
            </p>

            {customRules.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {customRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg bg-purple-600/10 border border-purple-600/20"
                  >
                    <span className="flex-1 text-xs text-[var(--foreground)]">
                      {rule.text}
                    </span>
                    <Badge variant="default">
                      {RULE_CATEGORY_LABELS[rule.category]}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => removeCustomRule(idx)}
                      className="text-[var(--muted-foreground)] hover:text-red-400 text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <select
                value={newRuleCategory}
                onChange={(e) =>
                  setNewRuleCategory(e.target.value as RuleCategory)
                }
                className="px-2 py-1.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 flex-shrink-0"
              >
                <option value="BEHAVIOR">{t("rules.categories.BEHAVIOR")}</option>
                <option value="GAMEPLAY">{t("rules.categories.GAMEPLAY")}</option>
                <option value="COMMUNICATION">{t("rules.categories.COMMUNICATION")}</option>
                <option value="CUSTOM">{t("rules.categories.CUSTOM")}</option>
              </select>
              <input
                type="text"
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                placeholder={t("rules.addPlaceholder")}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomRule();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomRule}
                className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs hover:bg-orange-500 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        loading={isPending}
        size="lg"
        disabled={!selectedGame}
      >
        {t("submit")}
      </Button>
    </form>
  );
}
