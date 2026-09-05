"use client";

import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import axios from "axios";
import {
  ArrowUp,
  Loader2Icon,
  Monitor,
  Network,
  PencilRuler,
  Smartphone,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

const AI_PLACEHOLDER_IDS = {
  container: "ai-placeholder-container",
  title: "ai-placeholder-title",
  titleText: "ai-placeholder-title-text",
  subtitle: "ai-placeholder-subtitle",
  skeleton1: "ai-placeholder-skeleton-1",
  skeleton2: "ai-placeholder-skeleton-2",
  skeleton3: "ai-placeholder-skeleton-3",
};

const AI_TOOLS = [
  {
    id: "diagram",
    name: "Diagram",
    desc: "Create visual diagrams",
    icon: PencilRuler,
    tint: "bg-blue-50 text-blue-600",
    placeholder:
      "E.g. Create a diagram showing how orders move from cart to delivery",
    prompt: `
You are an expert visual diagram generation agent.
Your task is to convert the user's idea into a clear, structured, professional diagram.
Instructions:
Understand the user's intent before generating.
Identify the main entities, concepts, steps, and relationships.
Create a clean visual hierarchy.
Use rectangles for main concepts or processes.
Use diamonds only for decisions.
Use arrows to show relationships or direction.
Keep labels short and readable.
Avoid overlapping elements.
Maintain consistent spacing between elements.
Organize the diagram from left-to-right or top-to-bottom depending on what is easiest to understand.
Add groups or sections when the diagram contains multiple categories.
Prefer simple layouts over overly complex diagrams.
Output only valid Excalidraw-compatible JSON elements.
Do not include markdown, explanations, or additional text outside the JSON.
`,
  },
  {
    id: "flowchart",
    name: "Flowchart",
    desc: "Visualize workflows",
    icon: Workflow,
    tint: "bg-violet-50 text-violet-600",
    placeholder:
      "E.g. Create a customer onboarding flow with signup, email verification and subscription decision…",
    prompt: `
You are an expert process visualization agent.

Convert the user's description into a clear, readable flowchart.

Instructions:
- Identify the trigger that starts the flow, every step along the way, and each
  outcome that ends it.
- Use rectangles for actions and steps.
- Use diamonds only for decisions, and label the branches leaving them.
- Use ellipses for start and end points.
- Lay the flow out top to bottom, branching left and right at decisions.
- Give every node a short label written as an action, e.g. "Verify email".
- Connect nodes so that every node except the start has something pointing at it.
- Keep the happy path down the centre and put error or rejection branches to one side.
- Output only valid Excalidraw-compatible JSON elements.
- Do not return markdown, explanations, or commentary.
`,
  },
  {
    id: "architecture",
    name: "Architecture",
    desc: "Design system architecture",
    icon: Network,
    tint: "bg-orange-50 text-orange-600",
    placeholder:
      "E.g. Map a web app with a load balancer, two API servers and a Postgres replica",
    prompt: `
You are a senior software architect and system design visualization agent.

Convert the user's application or system description into a clear system architecture diagram.

Instructions:
- Identify clients, frontend applications, backend services, APIs, databases, queues, and infrastructure.
- Group related components into logical sections.
- Show the direction of data flow using arrows.
- Clearly label important connections when useful.
- Place users or client applications on the left or top.
- Place application services in the center.
- Place databases, storage, and infrastructure on the right or bottom.
- Place third-party APIs or external services in a separate section.
- Use consistent component sizes.
- Keep architecture readable and avoid unnecessary implementation details.
- Include technologies mentioned by the user as labels.
- Infer standard architectural components only when necessary.
- Do not invent unnecessary technologies.
- Use containers or background sections for Frontend, Backend, Data Layer, AI Services.
- Output only valid Excalidraw-compatible JSON elements.
- Do not return markdown, commentary, or explanations.
`,
  },
  {
    id: "web",
    name: "Web Mockup",
    desc: "Generate web wireframes",
    icon: Monitor,
    tint: "bg-cyan-50 text-cyan-600",
    placeholder:
      "E.g. Lay out a pricing page with three plans and a comparison table",
    prompt: `
You are an expert product designer and web UI wireframe generation agent.

Convert the user's description into a professional desktop web application wireframe.

Instructions:
- Create the interface using simple wireframe-style Excalidraw elements.
- Assume a desktop viewport unless the user specifies otherwise.
- Identify the main page structure and user goals.
- Include relevant UI sections such as:
  - Navbar or header
  - Sidebar
  - Page title
  - Search
  - Filters
  - Cards
  - Tables
  - Forms
  - Buttons
  - Content panels
  - Footer
- Use rectangles for containers, cards, buttons, images, and input fields.
- Use text elements for labels and content.
- Maintain strong spacing, alignment, and visual hierarchy.
- Use realistic dashboard or SaaS layout conventions.
- Keep the design low-fidelity and wireframe oriented.
- Do not create decorative artwork unless specifically requested.
- Keep the page within a reasonable desktop canvas size.
- Group related UI sections visually.
- Make important primary actions easy to identify.
- Output only valid Excalidraw-compatible JSON elements.
- Do not return markdown or explanations.
`,
  },
  {
    id: "mobile",
    name: "Mobile Mockup",
    desc: "Generate app wireframes",
    icon: Smartphone,
    tint: "bg-pink-50 text-pink-600",
    placeholder: "E.g. Sketch a mobile checkout with saved cards and a summary",
    prompt: `
You are an expert mobile product designer and mobile wireframe generation agent.

Convert the user's app idea into a professional mobile app wireframe.

Instructions:
- Design for a standard mobile screen size.
- Create a phone frame or clear screen boundary.
- Focus on the primary user experience described by the user.
- Include relevant mobile UI patterns such as:
  - App header
  - Search
  - Cards
  - Lists
  - Forms
  - Bottom navigation
  - Floating action buttons
  - Tabs
  - Profile sections
  - Modals or sheets when necessary
- Use rectangles for UI containers and controls.
- Use text elements for labels.
- Maintain consistent padding and spacing.
- Use a vertical layout optimized for mobile interaction.
- Keep buttons large enough to represent touch-friendly controls.
- Keep the design low-fidelity and wireframe focused.
- If multiple screens are needed, arrange them horizontally with clear spacing.
- Label each screen clearly.
- Prioritize usability and simple navigation.
- Output only valid Excalidraw-compatible JSON elements.
- Do not return markdown, explanations, or commentary.
`,
  },
] as const;

type ToolId = (typeof AI_TOOLS)[number]["id"];

type Props = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  onClose?: () => void;
};

export default function AIFloatingSidebar({ excalidrawApi, onClose }: Props) {
  const [selectedTool, setSelectedTool] = useState<ToolId>("flowchart");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const placeholderIdsRef = useRef<string[]>([]);
  const placeholderPositionRef = useRef<{ x: number; y: number } | null>(null);

  const activeTool = AI_TOOLS.find((t) => t.id === selectedTool)!;

  const getEmptyCanvasPosition = () => {
    if (!excalidrawApi) return { x: 100, y: 100 };

    const elements = excalidrawApi
      .getSceneElements()
      .filter((element) => !element.isDeleted);

    if (elements.length === 0) {
      return { x: 100, y: 100 };
    }

    // find Right most element
    const maxRight = Math.max(
      ...elements.map((element) => element.x + element.width)
    );
    const minTop = Math.min(...elements.map((element) => element.y));

    return {
      x: maxRight + 150,
      y: minTop,
    };
  };

  const addAiPlaceholder = () => {
    if (!excalidrawApi) return;

    const position = getEmptyCanvasPosition();

    // remember where the placeholder was drawn, so the real diagram
    // can start at exactly the same spot
    placeholderPositionRef.current = position;

    const placeholderElements = convertToExcalidrawElements([
      {
        type: "rectangle",
        id: AI_PLACEHOLDER_IDS.container,
        x: position.x,
        y: position.y,
        width: 420,
        height: 250,
        backgroundColor: "#f5f3ff",
        strokeColor: "#8b5cf6",
        fillStyle: "solid",
        strokeWidth: 2,
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      // the title lives inside an invisible container as a bound label.
      // A standalone text element gets measured with Excalidraw's own font,
      // which may not have loaded yet, so the width comes up short and the
      // end of the sentence is clipped. Bound text wraps to the container.
      {
        type: "rectangle",
        id: AI_PLACEHOLDER_IDS.title,
        x: position.x + 24,
        y: position.y + 20,
        width: 372,
        height: 36,
        // matching the card background keeps the container invisible
        backgroundColor: "#f5f3ff",
        strokeColor: "#f5f3ff",
        fillStyle: "solid",
        strokeWidth: 1,
        roughness: 0,
        label: {
          text: "\u2728 Generating with AI",
          fontSize: 22,
          strokeColor: "#6d28d9",
          textAlign: "left",
          verticalAlign: "middle",
        },
      },
      {
        type: "text",
        id: AI_PLACEHOLDER_IDS.subtitle,
        x: position.x + 28,
        y: position.y + 65,
        text: "Preparing your diagram...",
        fontSize: 15,
        strokeColor: "#6b7280",
      },
      {
        type: "rectangle",
        id: AI_PLACEHOLDER_IDS.skeleton1,
        x: position.x + 28,
        y: position.y + 115,

        width: 250,
        height: 18,

        backgroundColor: "#ddd6fe",
        strokeColor: "#ddd6fe",

        fillStyle: "solid",
        strokeWidth: 1,
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        type: "rectangle",
        id: AI_PLACEHOLDER_IDS.skeleton2,
        x: position.x + 28,
        y: position.y + 148,

        width: 320,
        height: 18,

        backgroundColor: "#ddd6fe",
        strokeColor: "#ddd6fe",

        fillStyle: "solid",
        strokeWidth: 1,
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        type: "rectangle",
        id: AI_PLACEHOLDER_IDS.skeleton3,
        x: position.x + 28,
        y: position.y + 181,

        width: 180,
        height: 18,

        backgroundColor: "#ddd6fe",
        strokeColor: "#ddd6fe",

        fillStyle: "solid",
        strokeWidth: 1,
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
    ]);

    placeholderIdsRef.current = placeholderElements.map((element) => element.id);

    const currentElements = excalidrawApi.getSceneElements();

    excalidrawApi.updateScene({
      elements: [...currentElements, ...placeholderElements],
    });
  };

  const removeAiPlaceholder = () => {
    if (!excalidrawApi) return;

    const placeholderIds = [
      ...Object.values(AI_PLACEHOLDER_IDS),
      ...placeholderIdsRef.current,
    ];

    const elements = excalidrawApi.getSceneElements();

    const updateElements = elements.filter((element) => {
      // containerId only exists on text elements, so narrow before reading it
      const containerId =
        "containerId" in element ? element.containerId ?? "" : "";

      return (
        !placeholderIds.includes(element.id) &&
        !placeholderIds.includes(containerId)
      );
    });

    placeholderIdsRef.current = [];

    excalidrawApi.updateScene({ elements: updateElements });

    placeholderPositionRef.current = null;
  };

  const getConnectionPoints = (fromNode: any, toNode: any) => {
    const fromX = Number(fromNode.x);
    const fromY = Number(fromNode.y);
    const fromWidth = Number(fromNode.width || 200);
    const fromHeight = Number(fromNode.height || 80);

    const toX = Number(toNode.x);
    const toY = Number(toNode.y);
    const toWidth = Number(toNode.width || 200);
    const toHeight = Number(toNode.height || 80);

    const fromCenterX = fromX + fromWidth / 2;
    const fromCenterY = fromY + fromHeight / 2;
    const toCenterX = toX + toWidth / 2;
    const toCenterY = toY + toHeight / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    // -----------------------------------------
    // Vertical connection
    // -----------------------------------------
    if (Math.abs(dy) >= Math.abs(dx)) {
      // Target below source
      if (dy > 0) {
        return {
          startX: fromCenterX,
          startY: fromY + fromHeight,

          endX: toCenterX,
          endY: toY,
        };
      }

      // Target above source
      return {
        startX: fromCenterX,
        startY: fromY,

        endX: toCenterX,
        endY: toY + toHeight,
      };
    }

    // -----------------------------------------
    // Horizontal connection
    // -----------------------------------------

    // Target right
    if (dx > 0) {
      return {
        startX: fromX + fromWidth,
        startY: fromCenterY,

        endX: toX,
        endY: toCenterY,
      };
    }

    // Target left
    return {
      startX: fromX,
      startY: fromCenterY,

      endX: toX + toWidth,
      endY: toCenterY,
    };
  };

  /**
   * The route can hand back a few different shapes depending on how the model
   * answered: a JSON string, a bare array, { elements }, or something wrapped
   * in { diagram } / { result } / { data }. Unwrap all of them here so a
   * mismatch doesn't silently render nothing.
   */
  const parseDiagram = (payload: any): any => {
    if (!payload) return null;

    if (typeof payload === "string") {
      const cleaned = payload
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      try {
        return parseDiagram(JSON.parse(cleaned));
      } catch {
        return null;
      }
    }

    if (Array.isArray(payload)) {
      return { elements: payload, connections: [] };
    }

    if (Array.isArray(payload.elements)) {
      return {
        elements: payload.elements,
        connections: payload.connections || payload.arrows || [],
      };
    }

    return (
      parseDiagram(payload.diagramResult) ??
      parseDiagram(payload.diagram) ??
      parseDiagram(payload.result) ??
      parseDiagram(payload.data) ??
      parseDiagram(payload.output) ??
      parseDiagram(payload.text) ??
      null
    );
  };

  const SUPPORTED_TYPES = [
    "rectangle",
    "ellipse",
    "diamond",
    "text",
    "line",
    "arrow",
    "frame",
    "image",
  ];

  const renderAIDiagram = (payload: any): string | null => {
    if (!excalidrawApi) return "Canvas is not ready";

    const diagram = parseDiagram(payload);

    const aiElements = diagram?.elements || [];
    const connections = diagram?.connections || [];

    if (!aiElements.length) {
      console.warn("No elements found in the AI response", payload);

      const keys =
        payload && typeof payload === "object"
          ? Object.keys(payload).join(", ")
          : typeof payload;

      return `Response had no elements. Top-level keys: ${keys}`;
    }

    // -----------------------------------------
    // DIAGRAM ORIGIN
    // -----------------------------------------
    /**
     * We want:
     *
     * placeholder.x: 100
     * y: 100
     *
     * We DON'T want:
     *
     * placeholder.x + 400
     *
     * Instead normalize all AI coordinates so that
     * the diagram's top-left begins exactly where
     * the placeholder was.
     */
    const placeholderPosition =
      placeholderPositionRef.current ?? getEmptyCanvasPosition();

    const minX = Math.min(
      ...aiElements.map((element: any) => Number(element.x) || 0)
    );
    const minY = Math.min(
      ...aiElements.map((element: any) => Number(element.y) || 0)
    );

    const offsetX = placeholderPosition.x - minX;
    const offsetY = placeholderPosition.y - minY;

    const normalizedElements = aiElements.map((element: any) => ({
      ...element,
      x: (Number(element.x) || 0) + offsetX,
      y: (Number(element.y) || 0) + offsetY,
    }));

    // -----------------------------------------
    // UNIQUE IDS
    // -----------------------------------------
    /**
     * The model happily reuses ids, and they can also collide with elements
     * already on the canvas. Excalidraw keeps one element per id, so every
     * duplicate silently disappears. Remap them to guaranteed-unique ids and
     * translate the connections through the same map.
     */
    const batch = Date.now();

    const idMap = new Map<string, string>();

    normalizedElements.forEach((element: any, index: number) => {
      idMap.set(String(element.id ?? index), `ai-${batch}-${index}`);
    });

    const uniqueId = (id: any) => idMap.get(String(id));

    // -----------------------------------------
    // HELPER - FIND AI NODE
    // -----------------------------------------
    const getNode = (id: string) => {
      return normalizedElements.find(
        (element: any) => String(element.id) === String(id)
      );
    };

    // -----------------------------------------
    // CREATE SHAPES
    // -----------------------------------------
    const shapeElements = normalizedElements.flatMap((element: any) => {
      // the model likes inventing types ("button", "input", "circle"),
      // and convertToExcalidrawElements throws on anything it doesn't know
      const type = SUPPORTED_TYPES.includes(element.type)
        ? element.type
        : "rectangle";

      if (type === "text") {
        return [
          {
            type: "text",
            id: uniqueId(element.id),
            x: element.x,
            y: element.y,
            text: element.text ?? element.label ?? "",
            fontSize: Number(element.fontSize || 16),
            strokeColor: element.strokeColor || "#1e1e1e",
          },
        ];
      }

      const labelText = element.label ?? element.text;

      return [
        {
          type,
          id: uniqueId(element.id),
          x: element.x,
          y: element.y,
          width: Number(element.width || 200),
          height: Number(element.height || 80),
          backgroundColor: element.backgroundColor || "#ffffff",
          strokeColor: element.strokeColor || "#1e1e1e",
          fillStyle: "solid",
          strokeWidth: 2,
          roughness: 1,
          roundness: type === "diamond" ? null : { type: 3 },
          ...(labelText
            ? {
                label: {
                  text: labelText,
                  fontSize: Number(element.fontSize || 16),
                  strokeColor: "#1e1e1e",
                },
              }
            : {}),
        },
      ];
    });

    // -----------------------------------------
    // CREATE ARROWS
    // -----------------------------------------
    const arrowElements = connections.flatMap((connection: any) => {
      const fromNode = getNode(connection.from);
      const toNode = getNode(connection.to);

      if (!fromNode || !toNode) return [];

      const { startX, startY, endX, endY } = getConnectionPoints(
        fromNode,
        toNode
      );

      return [
        {
          type: "arrow",
          x: startX,
          y: startY,
          width: endX - startX,
          height: endY - startY,
          points: [
            [0, 0],
            [endX - startX, endY - startY],
          ],
          strokeColor: "#1e1e1e",
          strokeWidth: 2,
          roughness: 1,
          start: { id: uniqueId(fromNode.id) },
          end: { id: uniqueId(toNode.id) },
          ...(connection.label
            ? { label: { text: connection.label, fontSize: 14 } }
            : {}),
        },
      ];
    });

    let newElements;

    try {
      newElements = convertToExcalidrawElements([
        ...shapeElements,
        ...arrowElements,
      ] as any);
    } catch (err: any) {
      console.error("Could not convert the AI elements", err, shapeElements);
      return `Excalidraw rejected the elements: ${err?.message ?? err}`;
    }

    const currentElements = excalidrawApi.getSceneElements();

    excalidrawApi.updateScene({
      elements: [...currentElements, ...newElements],
    });

    excalidrawApi.scrollToContent(newElements, {
      fitToContent: true,
      animate: true,
    });

    console.log("rendered", {
      fromModel: aiElements.length,
      connections: connections.length,
      onCanvas: newElements.length,
    });

    if (aiElements.length < 5) {
      return `Only ${aiElements.length} element(s) came back. Raw: ${
        payload?.rawPreview ?? JSON.stringify(payload).slice(0, 400)
      }`;
    }

    return `Model sent ${aiElements.length} elements and ${connections.length} connections. ${newElements.length} on canvas.`;
  };

  const onClickGenerate = async () => {
    setStatus(null);
    addAiPlaceholder();
    setLoading(true);
    const currentAiTool = AI_TOOLS.find((tool) => tool.id === selectedTool);

    try {
      const result = await axios.post(
        "/api/ai",
        {
          userInput: userInput,
          type: currentAiTool?.name,
          systemPrompt: currentAiTool?.prompt,
        },
        // without this a hung request spins forever with no feedback
        { timeout: 240000 }
      );

      console.log("AI response", result.data);

      try {
        setStatus(renderAIDiagram(result.data));
      } catch (err: any) {
        console.error("render failed", err);
        setStatus(`Render failed: ${err?.message ?? err}`);
      }
    } catch (err: any) {
      console.error("generate failed", err);

      if (err?.code === "ECONNABORTED") {
        setStatus("The request timed out after 4 minutes");
        return;
      }

      const httpStatus = err?.response?.status;
      const serverMessage =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.message;

      setStatus(
        httpStatus
          ? `Request failed (${httpStatus}): ${serverMessage}`
          : `Request failed: ${serverMessage}`
      );
    } finally {
      setLoading(false);
      removeAiPlaceholder();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="AI Helper"
      className="absolute bottom-20 right-6 z-[100] flex w-[420px] flex-col
                 overflow-hidden rounded-2xl border border-slate-200 bg-white
                 shadow-[0_16px_48px_rgb(16_24_40_/_0.14)]"
    >
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                     bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
        >
          <Sparkles className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold leading-tight text-slate-900">
            AI Helper
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Turn your ideas into visual content
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI Helper"
          className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition-colors
                     hover:bg-slate-200/60 hover:text-slate-600
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pb-2 pt-4">
        <p
          id="tool-picker-label"
          className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
        >
          What do you want to create?
        </p>

        <div
          role="radiogroup"
          aria-labelledby="tool-picker-label"
          className="mt-3 grid grid-cols-2 gap-2.5"
        >
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === selectedTool;

            return (
              <button
                key={tool.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setSelectedTool(tool.id)}
                className={`relative flex items-center gap-2.5 rounded-xl border p-2.5 text-left
                            transition-colors focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-violet-500 focus-visible:ring-offset-1
                            ${
                              isActive
                                ? "border-violet-400 bg-violet-50/60"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
              >
                {isActive && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500" />
                )}

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tool.tint}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-slate-800">
                    {tool.name}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">
                    {tool.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <hr className="my-4 border-slate-100" />

        {/* Prompt */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="ai-prompt"
            className="text-sm font-semibold text-slate-800"
          >
            Describe your idea
          </label>
          <Sparkles className="h-4 w-4 text-violet-500" />
        </div>
        <p className="mt-0.5 text-xs text-slate-400">
          AI will generate it directly on your canvas
        </p>

        <div
          className="mt-3 rounded-xl border border-slate-200 bg-white transition-shadow
                     focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100"
        >
          <Textarea
            id="ai-prompt"
            rows={4}
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            placeholder={activeTool.placeholder}
            className="min-h-[110px] resize-none border-0 bg-transparent p-3 text-sm
                       leading-relaxed text-slate-700 shadow-none
                       placeholder:text-slate-400
                       focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex items-center justify-between gap-2 px-3 pb-3">
            <span className="truncate rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
              {activeTool.name}
            </span>

            <button
              type="button"
              onClick={onClickGenerate}
              disabled={loading}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-slate-900
                         px-3.5 text-[13px] font-medium text-white transition-colors
                         hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-slate-900 focus-visible:ring-offset-1
                         disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading && <Loader2Icon size={14} className="animate-spin" />}
              Generate
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>

      {status && (
        <p className="mx-5 mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] leading-relaxed text-rose-700">
          {status}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <p className="text-[11px] text-gray-400">
          AI generated content can be edited afterwards
        </p>
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <Sparkles className="h-3 w-3" />
          AI
        </span>
      </div>
    </div>
  );
}