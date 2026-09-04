"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpToLine,
  Check,
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
  onPropertyChange: (property: string, value: any) => void;
};

type PopoverId = "stroke" | "background" | "text" | "more" | null;

const COLORS = [
  "#1e1e1e",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#1971c2",
  "#6741d9",
];

const BACKGROUNDS = [
  "#ffc9c9",
  "#ffec99",
  "#b2f2bb",
  "#a5d8ff",
  "#d0bfff",
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
  { value: "triangle", label: "Tri" },
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
  onPropertyChange,
}: Props) {
  const [openPopover, setOpenPopover] = useState<PopoverId>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!openPopover) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenPopover(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPopover(null);
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openPopover]);

  // Close when the selection changes to a different element
  useEffect(() => {
    setOpenPopover(null);
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

  const toggle = (id: PopoverId) =>
    setOpenPopover((current) => (current === id ? null : id));

  /* ---------- operations that restructure the elements array ---------- */

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
    onPropertyChange("isDeleted", true);
    setOpenPopover(null);
  };

  const toggleLock = () => onPropertyChange("locked", !selectedElement.locked);

  return (
    <div
      ref={containerRef}
      className="absolute z-[100] -translate-x-1/2"
      style={{ left: position.left, top: position.top }}
    >
      {/* ---------- TOOLBAR ---------- */}
      <div className="flex items-center gap-0.5 rounded-xl border bg-white p-1.5 shadow-lg">
        <GripVertical size={16} className="cursor-grab text-gray-300" />

        <div className="flex h-8 w-8 items-center justify-center" title={type}>
          <TypeIcon size={17} className="text-gray-700" />
        </div>

        <IconButton
          title="Stroke color"
          active={openPopover === "stroke"}
          onClick={() => toggle("stroke")}
        >
          <Palette size={17} className="text-gray-700" />
        </IconButton>

        {isShape && (
          <IconButton
            title="Background"
            active={openPopover === "background"}
            onClick={() => toggle("background")}
          >
            <Droplet size={17} className="text-gray-700" />
          </IconButton>
        )}

        {isText && (
          <IconButton
            title="Text options"
            active={openPopover === "text"}
            onClick={() => toggle("text")}
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

        <IconButton
          title="More options"
          active={openPopover === "more"}
          onClick={() => toggle("more")}
        >
          <MoreHorizontal size={17} className="text-gray-700" />
        </IconButton>
      </div>

      {/* ---------- STROKE COLOR ---------- */}
      {openPopover === "stroke" && (
        <Popover>
          <PopoverTitle>{isText ? "Text color" : "Stroke color"}</PopoverTitle>
          <div className="flex items-center gap-2">
            {COLORS.map((color) => (
              <Swatch
                key={color}
                color={color}
                active={selectedElement.strokeColor === color}
                onClick={() => onPropertyChange("strokeColor", color)}
              />
            ))}
          </div>
        </Popover>
      )}

      {/* ---------- BACKGROUND ---------- */}
      {openPopover === "background" && (
        <Popover className="w-56">
          <PopoverTitle>Background</PopoverTitle>
          <div className="mb-4 flex items-center gap-2">
            {BACKGROUNDS.map((color) => (
              <Swatch
                key={color}
                color={color}
                active={selectedElement.backgroundColor === color}
                onClick={() => onPropertyChange("backgroundColor", color)}
              />
            ))}
            <button
              onClick={() => onPropertyChange("backgroundColor", "transparent")}
              title="Transparent"
              className="flex h-7 w-7 items-center justify-center rounded-full border text-gray-400 hover:bg-gray-50"
            >
              <X size={12} />
            </button>
          </div>

          <Label>Fill style</Label>
          <div className="grid grid-cols-3 gap-2">
            {FILL_STYLES.map((f) => (
              <OptionButton
                key={f.value}
                active={selectedElement.fillStyle === f.value}
                onClick={() => onPropertyChange("fillStyle", f.value)}
              >
                {f.label}
              </OptionButton>
            ))}
          </div>
        </Popover>
      )}

      {/* ---------- TEXT ---------- */}
      {openPopover === "text" && (
        <Popover className="w-60">
          <PopoverTitle>Text</PopoverTitle>

          <Label>Font</Label>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {FONT_FAMILIES.map((f) => (
              <OptionButton
                key={f.value}
                active={selectedElement.fontFamily === f.value}
                onClick={() => onPropertyChange("fontFamily", f.value)}
              >
                {f.label}
              </OptionButton>
            ))}
          </div>

          <Label>Font size</Label>
          <select
            value={selectedElement.fontSize ?? 20}
            onChange={(e) =>
              onPropertyChange("fontSize", Number(e.target.value))
            }
            className="mb-4 w-full rounded-lg border px-3 py-2 text-xs text-gray-700"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} px
              </option>
            ))}
          </select>

          <Label>Alignment</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "left", Icon: AlignLeft },
              { value: "center", Icon: AlignCenter },
              { value: "right", Icon: AlignRight },
            ].map(({ value, Icon }) => (
              <OptionButton
                key={value}
                active={selectedElement.textAlign === value}
                onClick={() => onPropertyChange("textAlign", value)}
              >
                <Icon size={15} />
              </OptionButton>
            ))}
          </div>
        </Popover>
      )}

      {/* ---------- MORE OPTIONS ---------- */}
      {openPopover === "more" && (
        <Popover className="max-h-[65vh] w-64 overflow-y-auto">
          <PopoverTitle onClose={() => setOpenPopover(null)}>
            {isText
              ? "Text options"
              : isShape
                ? "Shape options"
                : isArrow
                  ? "Arrow options"
                  : isLine
                    ? "Line options"
                    : isFreeDraw
                      ? "Draw options"
                      : "Options"}
          </PopoverTitle>

          {/* LAYERS */}
          <div className="mb-4 grid grid-cols-2 gap-2">
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

          {/* STROKE STYLE + WIDTH */}
          {!isText && (
            <>
              <Label>Stroke</Label>
              {!isFreeDraw && (
                <div className="mb-2 grid grid-cols-3 gap-2">
                  {(["solid", "dashed", "dotted"] as const).map((style) => (
                    <OptionButton
                      key={style}
                      active={selectedElement.strokeStyle === style}
                      onClick={() => onPropertyChange("strokeStyle", style)}
                    >
                      <span
                        className="w-8 border-t-2 border-current"
                        style={{ borderStyle: style }}
                      />
                    </OptionButton>
                  ))}
                </div>
              )}
              <select
                value={selectedElement.strokeWidth ?? 2}
                onChange={(e) =>
                  onPropertyChange("strokeWidth", Number(e.target.value))
                }
                className="mb-4 w-full rounded-lg border px-3 py-2 text-xs text-gray-700"
              >
                {STROKE_WIDTHS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* ARROWHEADS */}
          {isArrow && (
            <>
              <Label>Start arrowhead</Label>
              <div className="mb-3 grid grid-cols-4 gap-1.5">
                {ARROWHEADS.map((a) => (
                  <OptionButton
                    key={`start-${a.label}`}
                    active={selectedElement.startArrowhead === a.value}
                    onClick={() => onPropertyChange("startArrowhead", a.value)}
                  >
                    <span className="text-[10px]">{a.label}</span>
                  </OptionButton>
                ))}
              </div>

              <Label>End arrowhead</Label>
              <div className="mb-4 grid grid-cols-4 gap-1.5">
                {ARROWHEADS.map((a) => (
                  <OptionButton
                    key={`end-${a.label}`}
                    active={selectedElement.endArrowhead === a.value}
                    onClick={() => onPropertyChange("endArrowhead", a.value)}
                  >
                    <span className="text-[10px]">{a.label}</span>
                  </OptionButton>
                ))}
              </div>
            </>
          )}

          {/* EDGES */}
          {isShape && (
            <>
              <Label>Edges</Label>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <OptionButton
                  active={!selectedElement.roundness}
                  onClick={() => onPropertyChange("roundness", null)}
                >
                  Sharp
                </OptionButton>
                <OptionButton
                  active={!!selectedElement.roundness}
                  onClick={() => onPropertyChange("roundness", { type: 3 })}
                >
                  Round
                </OptionButton>
              </div>
            </>
          )}

          {/* SLOPPINESS */}
          {(isShape || isLinear) && (
            <>
              <Label>Sloppiness</Label>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {ROUGHNESS.map((r) => (
                  <OptionButton
                    key={r.value}
                    active={selectedElement.roughness === r.value}
                    onClick={() => onPropertyChange("roughness", r.value)}
                  >
                    {r.label}
                  </OptionButton>
                ))}
              </div>
            </>
          )}

          {/* OPACITY */}
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
            onChange={(e) =>
              onPropertyChange("opacity", Number(e.target.value))
            }
            className="w-full accent-blue-600"
          />
        </Popover>
      )}
    </div>
  );
}

/* ---------- building blocks ---------- */

function Popover({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mt-2 rounded-xl border bg-white p-4 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

function PopoverTitle({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-xs font-medium text-gray-800">{children}</h3>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
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
      title={color}
      className="flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-110"
    >
      {active && <Check size={13} className="text-white" strokeWidth={3} />}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-medium text-gray-500">{children}</div>
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

function IconButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition ${
        active ? "bg-blue-50 ring-1 ring-blue-300" : "hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-gray-200" />;
}

export default FloatingProperties;