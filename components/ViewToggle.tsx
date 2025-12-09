"use client";

type Props = {
  view: "map" | "list";
  onViewChange: (view: "map" | "list") => void;
};

export default function ViewToggle({ view, onViewChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border overflow-hidden">
      <button
        onClick={() => onViewChange("map")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          view === "map"
            ? "bg-black text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        Map
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          view === "list"
            ? "bg-black text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        List
      </button>
    </div>
  );
}
