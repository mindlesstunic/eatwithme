/**
 * View Toggle Component
 *
 * Switches between map and list views.
 * Uses warm accent color for active state.
 */

"use client";

type Props = {
  view: "map" | "list";
  onViewChange: (view: "map" | "list") => void;
};

export default function ViewToggle({ view, onViewChange }: Props) {
  return (
    <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
      <button
        onClick={() => onViewChange("map")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          view === "map"
            ? "bg-[var(--color-primary)] text-white"
            : "bg-[var(--color-background)] text-[var(--color-foreground-secondary)] hover:bg-[var(--color-background-secondary)]"
        }`}
      >
        Map
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          view === "list"
            ? "bg-[var(--color-primary)] text-white"
            : "bg-[var(--color-background)] text-[var(--color-foreground-secondary)] hover:bg-[var(--color-background-secondary)]"
        }`}
      >
        List
      </button>
    </div>
  );
}
