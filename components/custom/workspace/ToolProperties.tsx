"use client";

import React from "react";

type Props = {
  activeTool: string;
  appState: any;
  onToolPropertyChange: (property: string, value: any) => void;
};

const COLORS = [
  "#1e1e1e",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#1971c2",
  "#6741d9",
];

const BACKGROUNDS = [
  "transparent",
  "#ffc9c9",
  "#ffec99",
  "#b2f2bb",
  "#a5d8ff",
  "#d0bfff",
];

const STROKE_WIDTHS = [
  { value: 1, label: "S" },
  { value: 2, label: "M" },
  { value: 4, label: "L" },
];

const STROKE_STYLES = ["solid", "dashed", "dotted"] as const;

const FILL_STYLES = [
  { value: "hachure", label: "Hachure" },
  { value: "cross-hatch", label: "Cross" },
  { value: "solid", label: "Solid" },
];

const ROUGHNESS = [
  { value: 0, label: "Architect" },
  { value: 1, label: "Artist" },
  { value: 2, label: "Cartoon" },
];

const FONT_FAMILIES = [
  { value: 1, label: "Hand" },
  { value: 2, label: "Normal" },
  { value: 3, label: "Mono" },
];

const FONT_SIZES = [
  { value: 16, label: "S" },
  { value: 20, label: "M" },
  { value: 28, label: "L" },
  { value: 36, label: "XL" },
];

const SHOW_FOR = [
  "rectangle",
  "ellipse",
  "diamond",
  "arrow",
  "line",
  "freedraw",
  "text",
];

function ToolProperties({ activeTool, appState, onToolPropertyChange }: Props) {
  if (!SHOW_FOR.includes(activeTool) || !appState) return null;

  const isText = activeTool === "text";
  const isFreeDraw = activeTool === "freedraw";
  const isShape = ["rectangle", "ellipse", "diamond"].includes(activeTool);
  const isLinear = ["arrow", "line"].includes(activeTool);

  return (
    <div className="absolute left-20 top-1/2 z-40 max-h-[80vh] w-56 -translate-y-1/2 overflow-y-auto rounded-xl border bg-white p-4 shadow-lg">
      {/* STROKE COLOR */}
      <Label>{isText ? "Text color" : "Stroke"}</Label>
      <div className="mb-4 flex items-center gap-2">
        {COLORS.map((color) => (
          <Swatch
            key={color}
            color={color}
            active={appState.currentItemStrokeColor === color}
            onClick={() =>
              onToolPropertyChange("currentItemStrokeColor", color)
            }
          />
        ))}
      </div>

      {/* BACKGROUND — shapes only */}
      {isShape && (
        <>
          <Label>Background</Label>
          <div className="mb-4 flex items-center gap-2">
            {BACKGROUNDS.map((color) => (
              <Swatch
                key={color}
                color={color}
                active={appState.currentItemBackgroundColor === color}
                onClick={() =>
                  onToolPropertyChange("currentItemBackgroundColor", color)
                }
              />
            ))}
          </div>

          <Label>Fill</Label>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {FILL_STYLES.map((f) => (
              <Option
                key={f.value}
                active={appState.currentItemFillStyle === f.value}
                onClick={() =>
                  onToolPropertyChange("currentItemFillStyle", f.value)
                }
              >
                {f.label}
              </Option>
            ))}
          </div>
        </>
      )}

      {/* TEXT CONTROLS */}
      {isText && (
        <>
          <Label>Font family</Label>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {FONT_FAMILIES.map((f) => (
              <Option
                key={f.value}
                active={appState.currentItemFontFamily === f.value}
                onClick={() =>
                  onToolPropertyChange("currentItemFontFamily", f.value)
                }
              >
                {f.label}
              </Option>
            ))}
          </div>

          <Label>Font size</Label>
          <div className="mb-4 grid grid-cols-4 gap-1.5">
            {FONT_SIZES.map((s) => (
              <Option
                key={s.value}
                active={appState.currentItemFontSize === s.value}
                onClick={() =>
                  onToolPropertyChange("currentItemFontSize", s.value)
                }
              >
                {s.label}
              </Option>
            ))}
          </div>
        </>
      )}

      {/* STROKE WIDTH — everything except text */}
      {!isText && (
        <>
          <Label>{isFreeDraw ? "Thickness" : "Stroke width"}</Label>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {STROKE_WIDTHS.map((w) => (
              <Option
                key={w.value}
                active={appState.currentItemStrokeWidth === w.value}
                onClick={() =>
                  onToolPropertyChange("currentItemStrokeWidth", w.value)
                }
              >
                {w.label}
              </Option>
            ))}
          </div>
        </>
      )}

      {/* STROKE STYLE — shapes and lines */}
      {(isShape || isLinear) && (
        <>
          <Label>Stroke style</Label>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {STROKE_STYLES.map((style) => (
              <Option
                key={style}
                active={appState.currentItemStrokeStyle === style}
                onClick={() =>
                  onToolPropertyChange("currentItemStrokeStyle", style)
                }
              >
                <span
                  className="w-7 border-t-2 border-current"
                  style={{ borderStyle: style }}
                />
              </Option>
            ))}
          </div>

          <Label>Sloppiness</Label>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {ROUGHNESS.map((r) => (
              <Option
                key={r.value}
                active={appState.currentItemRoughness === r.value}
                onClick={() =>
                  onToolPropertyChange("currentItemRoughness", r.value)
                }
              >
                {r.label}
              </Option>
            ))}
          </div>
        </>
      )}

      {/* EDGES — shapes only */}
      {isShape && (
        <>
          <Label>Edges</Label>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            <Option
              active={appState.currentItemRoundness === "sharp"}
              onClick={() => onToolPropertyChange("currentItemRoundness", "sharp")}
            >
              Sharp
            </Option>
            <Option
              active={appState.currentItemRoundness === "round"}
              onClick={() => onToolPropertyChange("currentItemRoundness", "round")}
            >
              Round
            </Option>
          </div>
        </>
      )}

      {/* OPACITY — all tools */}
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-gray-500">Opacity</span>
        <span className="text-[11px] text-gray-400">
          {appState.currentItemOpacity ?? 100}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={10}
        value={appState.currentItemOpacity ?? 100}
        onChange={(e) =>
          onToolPropertyChange("currentItemOpacity", Number(e.target.value))
        }
        className="w-full accent-blue-600"
      />
    </div>
  );
}

/* ---------- building blocks ---------- */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-medium text-gray-500">{children}</div>
  );
}

function Swatch({
  color,
  active,
  onClick,
}: {
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const isTransparent = color === "transparent";
  return (
    <button
      onClick={onClick}
      title={color}
      style={{ backgroundColor: isTransparent ? "#fff" : color }}
      className={`h-6 w-6 rounded-full transition hover:scale-110 ${
        isTransparent ? "border border-gray-300" : ""
      } ${active ? "ring-2 ring-gray-400 ring-offset-2" : ""}`}
    />
  );
}

function Option({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 items-center justify-center rounded-lg border text-[11px] transition ${
        active
          ? "border-blue-400 bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

export default ToolProperties;