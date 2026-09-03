"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpToLine,
  Circle,
  Copy,
  Diamond,
  Droplet,
  GripVertical,
  Lock,
  Minus,
  MoreHorizontal,
  Palette,
  Pencil,
  Square,
  Trash2,
  Type,
  X,
} from "lucide-react";

type Props = {
  selectedElement: any;
  position: { left: number; top: number };
  excalidrawAPI: any;
};

const COLORS = [
  "#1e1e1e",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#1971c2",
  "#6741d9",
];

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 64];

const FONT_FAMILIES = [
  { value: 1, label: "Hand" },
  { value: 2, label: "Normal" },
  { value: 3, label: "Mono" },
];

const STROKE_WIDTHS = [
  { value: 1, label: "1 px — Thin" },
  { value: 2, label: "2 px — Medium" },
  { value: 4, label: "4 px — Bold" },
];

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

const ARROWHEADS = [
  { value: null, label: "None" },
  { value: "arrow", label: "Arrow" },
  { value: "triangle", label: "Triangle" },
  { value: "dot", label: "Dot" },
];

const TYPE_ICONS: Record<string, any> = {
  rectangle: Square,
  ellipse: Circle,
  diamond: Diamond,
  text: Type,
  line: Minus,
  arrow: ArrowRight,
  freedraw: Pencil,
};

function FloatingProperties({
  selectedElement,
  position,
  excalidrawAPI,
}: Props) {
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showOptions) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowOptions(false);
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showOptions]);

  useEffect(() => {
    setShowOptions(false);
  }, [selectedElement?.id]);

  if (!selectedElement) return null;

  const type = selectedElement.type;
  const isText = type === "text";
  const isShape = ["rectangle", "ellipse", "diamond"].includes(type);
  const isLine = type === "line";
  const isArrow = type === "arrow";
  const isFreeDraw = type === "freedraw";
  const isLinear = isLine || isArrow;

  const TypeIcon = TYPE_ICONS[type] ?? Square;

  const panelTitle = isText
    ? "Text options"
    : isShape
      ? "Shape options"
      : isArrow
        ? "Arrow options"
        : isLine
          ? "Line options"
          : isFreeDraw
            ? "Draw options"
            : "Options";

  const updateElement = (props: Record<string, any>) => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();

    excalidrawAPI.updateScene({
      elements: elements.map((el: any) =>
        el.id === selectedElement.id
          ? {
              ...el,
              ...props,
              version: el.version + 1,
              versionNonce: Math.floor(Math.random() * 1000000),
            }
          : el
      ),
    });
  };

  const bringToFront = () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const target = elements.find((el: any) => el.id === selectedElement.id);
    const rest = elements.filter((el: any) => el.id !== selectedElement.id);
    excalidrawAPI.updateScene({ elements: [...rest, target] });
  };

  const sendToBack = () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const target = elements.find((el: any) => el.id === selectedElement.id);
    const rest = elements.filter((el: any) => el.id !== selectedElement.id);
    excalidrawAPI.updateScene({ elements: [target, ...rest] });
  };

  const duplicateElement = () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const copy = {
      ...selectedElement,
      id: crypto.randomUUID(),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      seed: Math.floor(Math.random() * 1000000),
      versionNonce: Math.floor(Math.random() * 1000000),
    };
    excalidrawAPI.updateScene({ elements: [...elements, copy] });
  };

  const deleteElement = () => {
    updateElement({ isDeleted: true });
    setShowOptions(false);
  };

  const toggleLock = () => updateElement({ locked: !selectedElement.locked });

  return (
    <div
      ref={containerRef}
      className="absolute z-[100] -translate-x-1/2"
      style={{ left: position.left, top: position.top }}
    >
      {/* TOOLBAR */}
      <div className="flex items-center gap-0.5 rounded-xl border bg-white p-1.5 shadow-lg">
        <GripVertical size={16} className="cursor-grab text-gray-300" />

        <div className="flex h-8 w-8 items-center justify-center" title={type}>
          <TypeIcon size={17} className="text-gray-700" />
        </div>

        <IconButton title="Color" onClick={() => setShowOptions((v) => !v)}>
          <Palette size={17} className="text-gray-700" />
        </IconButton>

        {isShape && (
          <IconButton
            title="Background"
            onClick={() => setShowOptions((v) => !v)}
          >
            <Droplet size={17} className="text-gray-700" />
          </IconButton>
        )}

        {isText && (
          <IconButton
            title="Alignment"
            onClick={() => setShowOptions((v) => !v)}
          >
            <AlignLeft size={17} className="text-gray-700" />
          </IconButton>
        )}

        <Divider />

        <IconButton title="Duplicate" onClick={duplicateElement}>
          <Copy size={17} className="text-gray-700" />
        </IconButton>

        <IconButton title="Lock" onClick={toggleLock}>
          <Lock
            size={17}
            className={
              selectedElement.locked ? "text-blue-600" : "text-gray-700"
            }
          />
        </IconButton>

        <IconButton title="Delete" onClick={deleteElement}>
          <Trash2 size={17} className="text-red-500" />
        </IconButton>

        <IconButton title="More" onClick={() => setShowOptions((v) => !v)}>
          <MoreHorizontal size={17} className="text-gray-700" />
        </IconButton>
      </div>

      {/* OPTIONS PANEL */}
      {showOptions && (
        <div className="mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl border bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800">{panelTitle}</h3>
            <button
              onClick={() => setShowOptions(false)}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100"
            >
              <X size={15} />
            </button>
          </div>

          {/* LAYERS — all types */}
          <div className="mb-5 grid grid-cols-2 gap-2">
            <button
              onClick={bringToFront}
              className="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              <ArrowUpToLine size={14} />
              Bring front
            </button>
            <button
              onClick={sendToBack}
              className="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              <ArrowDownToLine size={14} />
              Send back
            </button>
          </div>

          {/* ---------- TEXT ---------- */}
          {isText && (
            <>
              <Label>Font</Label>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {FONT_FAMILIES.map((f) => (
                  <OptionButton
                    key={f.value}
                    active={selectedElement.fontFamily === f.value}
                    onClick={() => updateElement({ fontFamily: f.value })}
                  >
                    {f.label}
                  </OptionButton>
                ))}
              </div>

              <Label>Font size</Label>
              <select
                value={selectedElement.fontSize ?? 20}
                onChange={(e) =>
                  updateElement({ fontSize: Number(e.target.value) })
                }
                className="mb-5 w-full rounded-lg border px-3 py-2 text-xs text-gray-700"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} px
                  </option>
                ))}
              </select>

              <Label>Alignment</Label>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  { value: "left", Icon: AlignLeft },
                  { value: "center", Icon: AlignCenter },
                  { value: "right", Icon: AlignRight },
                ].map(({ value, Icon }) => (
                  <OptionButton
                    key={value}
                    active={selectedElement.textAlign === value}
                    onClick={() => updateElement({ textAlign: value })}
                  >
                    <Icon size={15} />
                  </OptionButton>
                ))}
              </div>
            </>
          )}

          {/* ---------- STROKE (all except text) ---------- */}
          {!isText && (
            <>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-xs font-medium text-gray-700">
                  Stroke
                </span>
                <span className="text-[11px] text-gray-400">
                  Style &amp; width
                </span>
              </div>

              {!isFreeDraw && (
                <div className="mb-2 grid grid-cols-3 gap-2">
                  {(["solid", "dashed", "dotted"] as const).map((style) => (
                    <OptionButton
                      key={style}
                      active={selectedElement.strokeStyle === style}
                      onClick={() => updateElement({ strokeStyle: style })}
                    >
                      <span
                        className="w-8 border-t-2 border-gray-700"
                        style={{ borderStyle: style }}
                      />
                    </OptionButton>
                  ))}
                </div>
              )}

              <select
                value={selectedElement.strokeWidth ?? 2}
                onChange={(e) =>
                  updateElement({ strokeWidth: Number(e.target.value) })
                }
                className="mb-5 w-full rounded-lg border px-3 py-2 text-xs text-gray-700"
              >
                {STROKE_WIDTHS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* ---------- ARROWHEADS ---------- */}
          {isArrow && (
            <>
              <Label>Arrowheads</Label>
              <div className="mb-3 grid grid-cols-4 gap-1.5">
                {ARROWHEADS.map((a) => (
                  <OptionButton
                    key={a.label + "-start"}
                    active={selectedElement.startArrowhead === a.value}
                    onClick={() => updateElement({ startArrowhead: a.value })}
                  >
                    <span className="text-[10px]">{a.label}</span>
                  </OptionButton>
                ))}
              </div>
              <div className="mb-5 grid grid-cols-4 gap-1.5">
                {ARROWHEADS.map((a) => (
                  <OptionButton
                    key={a.label + "-end"}
                    active={selectedElement.endArrowhead === a.value}
                    onClick={() => updateElement({ endArrowhead: a.value })}
                  >
                    <span className="text-[10px]">{a.label}</span>
                  </OptionButton>
                ))}
              </div>
            </>
          )}

          {/* ---------- FILL (shapes only) ---------- */}
          {isShape && (
            <>
              <Label>Fill style</Label>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {FILL_STYLES.map((f) => (
                  <OptionButton
                    key={f.value}
                    active={selectedElement.fillStyle === f.value}
                    onClick={() => updateElement({ fillStyle: f.value })}
                  >
                    {f.label}
                  </OptionButton>
                ))}
              </div>

              <Label>Background</Label>
              <div className="mb-5 flex items-center gap-2">
                {COLORS.map((color) => (
                  <Swatch
                    key={color}
                    color={color}
                    active={selectedElement.backgroundColor === color}
                    onClick={() => updateElement({ backgroundColor: color })}
                  />
                ))}
                <button
                  onClick={() =>
                    updateElement({ backgroundColor: "transparent" })
                  }
                  title="No fill"
                  className="flex h-6 w-6 items-center justify-center rounded border text-gray-400 hover:bg-gray-50"
                >
                  <X size={12} />
                </button>
              </div>

              <Label>Edges</Label>
              <div className="mb-5 grid grid-cols-2 gap-2">
                <OptionButton
                  active={!selectedElement.roundness}
                  onClick={() => updateElement({ roundness: null })}
                >
                  Sharp
                </OptionButton>
                <OptionButton
                  active={!!selectedElement.roundness}
                  onClick={() => updateElement({ roundness: { type: 3 } })}
                >
                  Round
                </OptionButton>
              </div>
            </>
          )}

          {/* ---------- SLOPPINESS (shapes + linear) ---------- */}
          {(isShape || isLinear) && (
            <>
              <Label>Sloppiness</Label>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {ROUGHNESS.map((r) => (
                  <OptionButton
                    key={r.value}
                    active={selectedElement.roughness === r.value}
                    onClick={() => updateElement({ roughness: r.value })}
                  >
                    {r.label}
                  </OptionButton>
                ))}
              </div>
            </>
          )}

          {/* ---------- COLOR — all types ---------- */}
          <Label>{isText ? "Text color" : "Stroke"}</Label>
          <div className="mb-5 flex items-center gap-2">
            {COLORS.map((color) => (
              <Swatch
                key={color}
                color={color}
                active={selectedElement.strokeColor === color}
                onClick={() => updateElement({ strokeColor: color })}
              />
            ))}
          </div>

          {/* ---------- OPACITY — all types ---------- */}
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-medium text-gray-700">Opacity</span>
            <span className="text-[11px] text-gray-400">
              {selectedElement.opacity ?? 100}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={selectedElement.opacity ?? 100}
            onChange={(e) => updateElement({ opacity: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </div>
      )}
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-medium text-gray-700">{children}</div>
  );
}

function OptionButton({
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
      className={`flex h-9 items-center justify-center rounded-lg border text-xs transition ${
        active
          ? "border-blue-400 bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
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
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color }}
      className={`h-6 w-6 rounded-full transition ${
        active ? "ring-2 ring-gray-400 ring-offset-2" : ""
      }`}
    />
  );
}

function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition hover:bg-gray-100"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-gray-200" />;
}

export default FloatingProperties;