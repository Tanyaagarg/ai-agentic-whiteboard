"use client";

import { useMemo, useState } from "react";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import * as Lucide from "lucide-react";
import { Sparkles, StickyNote, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

type Props = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  onToggleAi: () => void;
  aiOpen?: boolean;
};

/* ------------------------------------------------------------------ */
/* NOTE STYLES                                                         */
/* ------------------------------------------------------------------ */

const NOTE_STYLES = [
  {
    id: "sticky",
    name: "Sticky Note",
    desc: "Warm idea card",
    fill: "#ffec99",
    stroke: "#ffd43b",
    ink: "#6b4a00",
    placeholder: "New note",
  },
  {
    id: "glass",
    name: "Glass Note",
    desc: "Polished meeting note",
    fill: "#d0ebff",
    stroke: "#a5d8ff",
    ink: "#0b4a75",
    placeholder: "Meeting note",
  },
  {
    id: "task",
    name: "Task Card",
    desc: "Structured checklist tile",
    fill: "#d3f9d8",
    stroke: "#b2f2bb",
    ink: "#0b5c2e",
    placeholder: "Task",
  },
] as const;

/* ------------------------------------------------------------------ */
/* EMOJI                                                               */
/* ------------------------------------------------------------------ */

const EMOJI_GROUPS: { label: string; items: [string, string][] }[] = [
  {
    label: "Smileys",
    items: [
      ["😀", "grin happy smile"], ["😃", "smile open happy"], ["😄", "smile eyes happy"],
      ["😁", "beam grin teeth"], ["😆", "laugh squint"], ["😅", "sweat nervous laugh"],
      ["🤣", "rofl rolling laugh"], ["😂", "joy tears laugh"], ["🙂", "slight smile"],
      ["🙃", "upside down silly"], ["😉", "wink"], ["😊", "blush smile warm"],
      ["😇", "innocent halo angel"], ["🥰", "love hearts adore"], ["😍", "heart eyes love"],
      ["😘", "kiss blow"], ["😋", "yum tasty tongue"], ["😜", "wink tongue playful"],
      ["🤪", "zany goofy wild"], ["🤨", "raised eyebrow suspicious"], ["🧐", "monocle inspect"],
      ["🤓", "nerd glasses geek"], ["😎", "cool sunglasses"], ["🥸", "disguise"],
      ["🤩", "star struck excited"], ["🥳", "party celebrate"], ["😏", "smirk"],
      ["😒", "unamused meh"], ["😞", "disappointed sad"], ["😔", "pensive sad"],
      ["😟", "worried"], ["😕", "confused"], ["🙁", "frown slight"],
      ["😣", "persevere struggle"], ["😖", "confounded"], ["😫", "tired weary"],
      ["😩", "weary exhausted"], ["🥺", "pleading puppy"], ["😢", "cry tear sad"],
      ["😭", "sob crying loud"], ["😤", "triumph steam determined"], ["😠", "angry"],
      ["😡", "rage mad furious"], ["🤬", "cursing swear"], ["🤯", "mind blown explode"],
      ["😳", "flushed shocked"], ["🥵", "hot overheat"], ["🥶", "cold freezing"],
      ["😱", "scream fear shock"], ["😨", "fearful scared"], ["😰", "anxious sweat"],
      ["😥", "sad relieved"], ["🤗", "hug"], ["🤔", "think thinking hmm"],
      ["🤭", "oops giggle"], ["🤫", "shush quiet secret"], ["🤥", "lying pinocchio"],
      ["😶", "no mouth speechless"], ["😐", "neutral blank"], ["😑", "expressionless"],
      ["😬", "grimace awkward"], ["🙄", "eye roll"], ["😯", "hushed surprise"],
      ["😴", "sleep zzz tired"], ["🤤", "drool"], ["😪", "sleepy"],
      ["🤒", "sick thermometer"], ["🤕", "hurt bandage injury"], ["🤢", "nauseated sick"],
      ["🤮", "vomit sick"], ["🤧", "sneeze tissue"], ["😷", "mask sick"],
      ["💀", "skull dead"], ["👻", "ghost boo"], ["👽", "alien ufo"],
      ["🤖", "robot bot ai"], ["💩", "poop"], ["🤡", "clown"],
    ],
  },
  {
    label: "Gestures & People",
    items: [
      ["👍", "thumbs up yes good approve"], ["👎", "thumbs down no reject"],
      ["👌", "ok perfect"], ["🤌", "pinched fingers"], ["✌️", "peace victory"],
      ["🤞", "fingers crossed luck"], ["🤟", "love you"], ["🤘", "rock horns"],
      ["🤙", "call me shaka"], ["👈", "point left"], ["👉", "point right"],
      ["👆", "point up"], ["👇", "point down"], ["☝️", "index up one"],
      ["✋", "raised hand stop"], ["🖐️", "hand fingers"], ["🖖", "vulcan spock"],
      ["👋", "wave hello hi bye"], ["🤝", "handshake deal agree"], ["🙏", "pray thanks please"],
      ["✍️", "writing hand"], ["👏", "clap applause"], ["🙌", "raise hands celebrate"],
      ["👐", "open hands"], ["🤲", "palms up"], ["💪", "strong muscle flex"],
      ["🧠", "brain smart think"], ["👀", "eyes look watch"], ["👁️", "eye see"],
      ["🫡", "salute"], ["🤷", "shrug dunno"], ["🤦", "facepalm"],
      ["🙋", "raise hand question"], ["🙆", "ok gesture"], ["🙅", "no gesture stop"],
      ["💁", "info desk sassy"], ["🧑‍💻", "developer coder"], ["👨‍💼", "office worker"],
      ["👩‍🔬", "scientist research"], ["🧑‍🏫", "teacher"], ["🕵️", "detective investigate"],
      ["👮", "police officer"], ["👷", "construction worker build"], ["🦸", "hero"],
    ],
  },
  {
    label: "Work & Office",
    items: [
      ["✅", "check done complete tick"], ["☑️", "checkbox ticked"], ["❌", "cross no fail"],
      ["❎", "cross mark button"], ["⚠️", "warning caution alert"], ["🚫", "forbidden banned"],
      ["📌", "pin important"], ["📍", "location pin place"], ["📎", "clip attach"],
      ["🖇️", "paperclips linked"], ["📝", "note write memo"], ["✏️", "pencil edit"],
      ["🖊️", "pen write"], ["📋", "clipboard list"], ["📁", "folder"],
      ["📂", "open folder"], ["🗂️", "dividers files organise"], ["📅", "calendar date"],
      ["📆", "calendar tear"], ["🗓️", "spiral calendar schedule"], ["📊", "bar chart data"],
      ["📈", "chart up growth"], ["📉", "chart down decline"], ["🗒️", "notepad"],
      ["🗞️", "newspaper news"], ["📰", "news article"], ["📑", "bookmark tabs"],
      ["🔖", "bookmark"], ["🏷️", "label tag"], ["💼", "briefcase business work"],
      ["🗃️", "card file box"], ["🗄️", "file cabinet archive"], ["🗑️", "trash delete bin"],
      ["📤", "outbox send"], ["📥", "inbox receive"], ["✉️", "email mail envelope"],
      ["📧", "email"], ["📨", "incoming mail"], ["🔔", "bell notify"],
      ["🔕", "bell off mute"], ["⏰", "alarm time clock"], ["⏳", "hourglass waiting"],
      ["⌛", "hourglass done"], ["🕐", "clock time"], ["🎯", "target goal aim"],
      ["🏁", "finish flag done"], ["🚩", "flag milestone"], ["📢", "announce megaphone"],
    ],
  },
  {
    label: "Tech & Objects",
    items: [
      ["💻", "laptop computer code"], ["🖥️", "desktop monitor"], ["⌨️", "keyboard typing"],
      ["🖱️", "mouse click"], ["📱", "phone mobile smartphone"], ["☎️", "telephone"],
      ["📞", "phone receiver call"], ["🖨️", "printer print"], ["💾", "floppy save"],
      ["💿", "disc cd"], ["📀", "dvd"], ["🔌", "plug power"],
      ["🔋", "battery charge"], ["🪫", "low battery"], ["💡", "idea bulb light"],
      ["🔦", "flashlight torch"], ["🔍", "search find magnify"], ["🔎", "search right"],
      ["🔒", "lock secure closed"], ["🔓", "unlock open"], ["🔐", "locked key secure"],
      ["🔑", "key access"], ["🗝️", "old key"], ["⚙️", "settings gear config"],
      ["🛠️", "tools build fix"], ["🔧", "wrench fix"], ["🔨", "hammer build"],
      ["⛏️", "pick mine"], ["🧰", "toolbox"], ["🧲", "magnet attract"],
      ["🧪", "test tube experiment"], ["🧬", "dna genetics"], ["🔬", "microscope research"],
      ["🔭", "telescope explore"], ["📡", "satellite antenna signal"], ["🛰️", "satellite space"],
      ["📦", "box package deploy ship"], ["🧩", "puzzle module piece"], ["🪛", "screwdriver"],
      ["🖇️", "link clip"], ["🔗", "link url chain"], ["⛓️", "chains"],
      ["🎥", "camera video film"], ["📷", "camera photo"], ["🎙️", "mic record"],
      ["🎧", "headphones audio"], ["🔊", "speaker loud volume"], ["🔇", "mute silent"],
    ],
  },
  {
    label: "Symbols & Arrows",
    items: [
      ["⭐", "star favourite"], ["🌟", "glowing star"], ["✨", "sparkles magic ai"],
      ["💫", "dizzy sparkle"], ["🔥", "fire hot trending"], ["⚡", "bolt fast energy"],
      ["💥", "boom collision"], ["❤️", "heart love red"], ["🧡", "orange heart"],
      ["💛", "yellow heart"], ["💚", "green heart"], ["💙", "blue heart"],
      ["💜", "purple heart"], ["🖤", "black heart"], ["🤍", "white heart"],
      ["💔", "broken heart"], ["♻️", "recycle refresh loop"], ["🔄", "refresh sync cycle"],
      ["🔃", "reload vertical"], ["➕", "plus add new"], ["➖", "minus remove"],
      ["✖️", "multiply times"], ["➗", "divide"], ["🟰", "equals"],
      ["➡️", "arrow right next forward"], ["⬅️", "arrow left back"], ["⬆️", "arrow up"],
      ["⬇️", "arrow down"], ["↗️", "arrow up right"], ["↘️", "arrow down right"],
      ["↙️", "arrow down left"], ["↖️", "arrow up left"], ["↔️", "arrow both horizontal"],
      ["↕️", "arrow both vertical"], ["🔀", "shuffle random"], ["🔁", "repeat loop"],
      ["▶️", "play start"], ["⏸️", "pause"], ["⏹️", "stop"],
      ["⏭️", "next skip"], ["⏮️", "previous back"], ["🔺", "triangle up increase"],
      ["🔻", "triangle down decrease"], ["🔴", "red circle"], ["🟠", "orange circle"],
      ["🟡", "yellow circle"], ["🟢", "green circle ok"], ["🔵", "blue circle"],
      ["🟣", "purple circle"], ["⚫", "black circle"], ["⚪", "white circle"],
      ["🟥", "red square"], ["🟧", "orange square"], ["🟨", "yellow square"],
      ["🟩", "green square"], ["🟦", "blue square"], ["🟪", "purple square"],
      ["❓", "question help"], ["❗", "exclamation important"], ["💬", "speech comment"],
      ["💭", "thought bubble"], ["🗯️", "anger bubble"], ["🔞", "eighteen restricted"],
      ["🆕", "new badge"], ["🆗", "ok badge"], ["🆙", "up badge"],
      ["🔝", "top"], ["🔜", "soon"], ["🏆", "trophy win award"],
      ["🥇", "gold first"], ["🥈", "silver second"], ["🥉", "bronze third"],
      ["🎉", "tada party celebrate"], ["🎊", "confetti"], ["🎁", "gift present"],
    ],
  },
  {
    label: "Animals & Nature",
    items: [
      ["🐶", "dog puppy"], ["🐱", "cat kitten"], ["🐭", "mouse"],
      ["🐹", "hamster"], ["🐰", "rabbit bunny fast"], ["🦊", "fox"],
      ["🐻", "bear"], ["🐼", "panda"], ["🐨", "koala"],
      ["🐯", "tiger"], ["🦁", "lion"], ["🐮", "cow"],
      ["🐷", "pig"], ["🐸", "frog"], ["🐵", "monkey"],
      ["🐔", "chicken"], ["🐧", "penguin"], ["🐦", "bird"],
      ["🦆", "duck"], ["🦅", "eagle"], ["🦉", "owl"],
      ["🐺", "wolf"], ["🐗", "boar"], ["🐴", "horse"],
      ["🦄", "unicorn magic"], ["🐝", "bee"], ["🐛", "bug issue defect"],
      ["🦋", "butterfly"], ["🐌", "snail slow"], ["🐞", "ladybug"],
      ["🐢", "turtle slow"], ["🐍", "snake python"], ["🐙", "octopus"],
      ["🦑", "squid"], ["🦐", "shrimp"], ["🐬", "dolphin"],
      ["🐳", "whale"], ["🐟", "fish"], ["🦈", "shark"],
      ["🌵", "cactus"], ["🌲", "evergreen tree"], ["🌳", "tree nature"],
      ["🌴", "palm tree"], ["🌱", "seedling grow start"], ["🌿", "herb leaf"],
      ["🍀", "clover luck"], ["🍁", "maple leaf autumn"], ["🌸", "blossom flower"],
      ["🌹", "rose flower"], ["🌻", "sunflower"], ["🌼", "daisy"],
      ["🌍", "earth globe world"], ["🌎", "earth americas"], ["🌏", "earth asia"],
      ["🌙", "moon night"], ["☀️", "sun day light"], ["⛅", "cloud sun"],
      ["☁️", "cloud weather"], ["🌧️", "rain"], ["⛈️", "storm thunder"],
      ["❄️", "snow cold"], ["🌊", "wave water sea"], ["🌈", "rainbow"],
    ],
  },
  {
    label: "Food & Travel",
    items: [
      ["☕", "coffee cafe"], ["🍵", "tea"], ["🧃", "juice box"],
      ["🥤", "soda drink"], ["🍺", "beer"], ["🍷", "wine"],
      ["🥂", "cheers celebrate"], ["🍕", "pizza"], ["🍔", "burger"],
      ["🌭", "hotdog"], ["🌮", "taco"], ["🌯", "burrito"],
      ["🍜", "noodles ramen"], ["🍝", "pasta"], ["🍣", "sushi"],
      ["🍙", "rice ball"], ["🥗", "salad healthy"], ["🥪", "sandwich"],
      ["🍎", "apple fruit"], ["🍌", "banana"], ["🍇", "grapes"],
      ["🍓", "strawberry"], ["🍉", "watermelon"], ["🥑", "avocado"],
      ["🍰", "cake slice"], ["🎂", "birthday cake"], ["🍪", "cookie"],
      ["🍫", "chocolate"], ["🍿", "popcorn"], ["🧁", "cupcake"],
      ["🚗", "car drive"], ["🚕", "taxi"], ["🚌", "bus"],
      ["🚲", "bike cycle"], ["🛴", "scooter"], ["🏍️", "motorcycle"],
      ["✈️", "plane flight travel"], ["🚀", "rocket launch ship"], ["🚁", "helicopter"],
      ["🚂", "train"], ["🚢", "ship boat"], ["⛵", "sailboat"],
      ["🏠", "house home"], ["🏢", "office building"], ["🏥", "hospital"],
      ["🏫", "school"], ["🏦", "bank"], ["🗼", "tower"],
      ["🗺️", "map"], ["🧭", "compass direction"], ["🏝️", "island beach"],
      ["⛰️", "mountain"], ["🏕️", "camping tent"], ["🎪", "circus tent"],
    ],
  },
  {
    label: "Activities",
    items: [
      ["⚽", "football soccer"], ["🏀", "basketball"], ["🏈", "american football"],
      ["⚾", "baseball"], ["🎾", "tennis"], ["🏐", "volleyball"],
      ["🏓", "ping pong"], ["🏸", "badminton"], ["🥅", "goal net"],
      ["⛳", "golf"], ["🏹", "archery bow target"], ["🎣", "fishing"],
      ["🥊", "boxing"], ["🛹", "skateboard"], ["🏂", "snowboard"],
      ["⛷️", "ski"], ["🏊", "swim"], ["🚴", "cycling"],
      ["🏃", "run"], ["🧗", "climb"], ["🧘", "yoga meditate calm"],
      ["🎮", "game controller"], ["🕹️", "joystick arcade"], ["🎲", "dice random"],
      ["♟️", "chess strategy"], ["🎨", "art paint design"], ["🎭", "theatre drama"],
      ["🎬", "clapper film movie"], ["🎤", "mic sing"], ["🎧", "headphones music"],
      ["🎵", "note music"], ["🎸", "guitar"], ["🎹", "piano keys"],
      ["🥁", "drum"], ["📚", "books study learn"], ["📖", "open book read"],
      ["🎓", "graduation degree"], ["🧵", "thread"], ["🪄", "magic wand"],
    ],
  },
];

/* ------------------------------------------------------------------ */
/* ICONS                                                               */
/* ------------------------------------------------------------------ */

const ICON_NAMES = Object.keys(Lucide).filter((name) => {
  if (!/^[A-Z]/.test(name)) return false;
  if (name.endsWith("Icon")) return false; // lucide ships Name and NameIcon aliases
  if (["Icon", "LucideProps", "createLucideIcon"].includes(name)) return false;
  const value = (Lucide as any)[name];
  return typeof value === "function" || typeof value === "object";
});

export default function BottomToolbar({ excalidrawApi, onToggleAi, aiOpen }: Props) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiQuery, setEmojiQuery] = useState("");
  const [iconQuery, setIconQuery] = useState("");

  /** Middle of whatever the user is currently looking at, in scene coordinates. */
  const viewportCenter = () => {
    if (!excalidrawApi) return { x: 100, y: 100 };

    const { scrollX, scrollY, width, height, zoom } = excalidrawApi.getAppState();

    return {
      x: -scrollX + width / 2 / zoom.value,
      y: -scrollY + height / 2 / zoom.value,
    };
  };

  const addToScene = (skeletons: any[]) => {
    if (!excalidrawApi) return;

    const created = convertToExcalidrawElements(skeletons);
    const current = excalidrawApi.getSceneElements();

    excalidrawApi.updateScene({ elements: [...current, ...created] });
    excalidrawApi.scrollToContent(created, { fitToContent: false, animate: true });
  };

  const addNote = (style: (typeof NOTE_STYLES)[number]) => {
    const { x, y } = viewportCenter();
    const w = 280;
    const h = 240;
    const left = x - w / 2;
    const top = y - h / 2;

    // every piece shares one group, so the note moves and deletes as a unit
    const group = `note-${Date.now()}`;

    // a couple of degrees either way, so notes look stuck on by hand
    const tilt = (Math.random() - 0.5) * 0.06;

    const pieces: any[] = [];

    if (style.id === "sticky") {
      // classic sticky: a solid colour band across the top, paper underneath
      pieces.push(
        {
          type: "rectangle",
          x: left,
          y: top,
          width: w,
          height: 48,
          backgroundColor: style.stroke,
          strokeColor: style.stroke,
          roundness: { type: 3 },
          label: { text: "Note title", fontSize: 18, strokeColor: style.ink },
        },
        {
          type: "rectangle",
          x: left,
          y: top + 44,
          width: w,
          height: h - 44,
          backgroundColor: style.fill,
          strokeColor: style.stroke,
          roundness: { type: 3 },
          label: {
            text: "Write your idea here",
            fontSize: 16,
            strokeColor: style.ink,
            textAlign: "left",
            verticalAlign: "top",
          },
        }
      );
    }

    if (style.id === "glass") {
      // meeting note: tinted pane, accent rule, white writing area inside
      pieces.push(
        {
          type: "rectangle",
          x: left,
          y: top,
          width: w,
          height: h,
          backgroundColor: style.fill,
          strokeColor: style.stroke,
          roundness: { type: 3 },
        },
        {
          type: "rectangle",
          x: left + 18,
          y: top + 18,
          width: w - 36,
          height: 30,
          backgroundColor: "transparent",
          strokeColor: "transparent",
          label: {
            text: "Meeting note",
            fontSize: 18,
            strokeColor: style.ink,
            textAlign: "left",
          },
        },
        {
          type: "rectangle",
          x: left + 18,
          y: top + 54,
          width: 56,
          height: 4,
          backgroundColor: style.ink,
          strokeColor: style.ink,
          roundness: { type: 3 },
        },
        {
          type: "rectangle",
          x: left + 18,
          y: top + 72,
          width: w - 36,
          height: h - 92,
          backgroundColor: "#ffffff",
          strokeColor: style.stroke,
          roundness: { type: 3 },
          label: {
            text: "Agenda, decisions, owners",
            fontSize: 14,
            strokeColor: style.ink,
            textAlign: "left",
            verticalAlign: "top",
          },
        }
      );
    }

    if (style.id === "task") {
      // checklist tile: header band, then a row of box + line per task
      pieces.push(
        {
          type: "rectangle",
          x: left,
          y: top,
          width: w,
          height: h,
          backgroundColor: "#ffffff",
          strokeColor: style.stroke,
          roundness: { type: 3 },
        },
        {
          type: "rectangle",
          x: left,
          y: top,
          width: w,
          height: 46,
          backgroundColor: style.fill,
          strokeColor: style.stroke,
          roundness: { type: 3 },
          label: { text: "Task card", fontSize: 18, strokeColor: style.ink },
        }
      );

      ["First task", "Second task", "Third task"].map((task, index) => {
        const rowY = top + 70 + index * 48;

        pieces.push(
          {
            type: "rectangle",
            x: left + 20,
            y: rowY,
            width: 22,
            height: 22,
            backgroundColor: "transparent",
            strokeColor: style.ink,
            strokeWidth: 2,
            roundness: { type: 3 },
          },
          {
            type: "rectangle",
            x: left + 52,
            y: rowY - 3,
            width: w - 74,
            height: 28,
            backgroundColor: "transparent",
            strokeColor: "transparent",
            label: {
              text: task,
              fontSize: 15,
              strokeColor: style.ink,
              textAlign: "left",
            },
          }
        );
      });
    }

    // rotate every piece around the middle of the card, not its own middle,
    // otherwise the parts drift out of alignment
    const pivotX = left + w / 2;
    const pivotY = top + h / 2;

    const tilted = pieces.map((piece) => {
      const cx = piece.x + piece.width / 2;
      const cy = piece.y + piece.height / 2;

      const rx =
        pivotX + (cx - pivotX) * Math.cos(tilt) - (cy - pivotY) * Math.sin(tilt);
      const ry =
        pivotY + (cx - pivotX) * Math.sin(tilt) + (cy - pivotY) * Math.cos(tilt);

      return {
        ...piece,
        x: rx - piece.width / 2,
        y: ry - piece.height / 2,
        angle: tilt,
        groupIds: [group],
        fillStyle: "solid",
        strokeWidth: piece.strokeWidth ?? 1,
        roughness: 0,
      };
    });

    addToScene(tilted);
    setNotesOpen(false);
  };

  const addEmoji = (emoji: string) => {
    const { x, y } = viewportCenter();

    addToScene([
      { type: "text", x: x - 30, y: y - 30, text: emoji, fontSize: 60 },
    ]);

    setEmojiOpen(false);
  };

  /**
   * Icons go in as images. Rather than re-render the icon to a string, lift the
   * <svg> the grid already painted straight out of the DOM and serialise that.
   */
  const addIcon = (button: HTMLElement, name: string) => {
    if (!excalidrawApi) return;

    const source = button.querySelector("svg");
    if (!source) return;

    const svg = source.cloneNode(true) as SVGElement;
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "96");
    svg.setAttribute("height", "96");
    svg.setAttribute("stroke-width", "1.75");

    const markup = new XMLSerializer().serializeToString(svg);
    const dataURL = `data:image/svg+xml;base64,${window.btoa(
      unescape(encodeURIComponent(markup))
    )}`;

    const fileId = `icon-${name}-${Date.now()}`;

    excalidrawApi.addFiles([
      {
        id: fileId as any,
        dataURL: dataURL as any,
        mimeType: "image/svg+xml",
        created: Date.now(),
      },
    ]);

    const { x, y } = viewportCenter();

    addToScene([
      { type: "image", x: x - 48, y: y - 48, width: 96, height: 96, fileId },
    ]);

    setEmojiOpen(false);
  };

  const emojiResults = useMemo(() => {
    const q = emojiQuery.trim().toLowerCase();
    if (!q) return EMOJI_GROUPS;

    return EMOJI_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(([, keywords]) => keywords.includes(q)),
    })).filter((group) => group.items.length > 0);
  }, [emojiQuery]);

  const iconResults = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    const matches = q
      ? ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
      : ICON_NAMES;

    // the full set is thousands of components; painting them all locks the UI
    return matches.slice(0, 300);
  }, [iconQuery]);

  return (
    <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-lg">
        {/* NOTES */}
        <Popover open={notesOpen} onOpenChange={setNotesOpen}>
          <PopoverTrigger
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                       text-slate-700 transition-colors hover:bg-slate-100"
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="start"
            className="w-80 p-4 duration-0 data-open:animate-none data-closed:animate-none"
          >
            <p className="text-sm font-semibold text-slate-900">Add notes</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Pick a blank note style for the whiteboard.
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              {NOTE_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => addNote(style)}
                  className="group flex items-center gap-3.5 rounded-xl border border-slate-200 p-3
                             text-left transition-all hover:-translate-y-0.5 hover:border-slate-300
                             hover:shadow-md"
                >
                  {/* a miniature of the note this button actually creates */}
                  <span className="relative h-14 w-14 shrink-0">
                    <span
                      className="absolute inset-0 rounded-lg border transition-transform
                                 -rotate-6 group-hover:-rotate-12"
                      style={{
                        backgroundColor: style.fill,
                        borderColor: style.stroke,
                        opacity: 0.7,
                      }}
                    />
                    <span
                      className="absolute inset-0 flex flex-col justify-center gap-1.5 rounded-lg
                                 border p-2.5 shadow-sm transition-transform group-hover:rotate-3"
                      style={{
                        backgroundColor: style.fill,
                        borderColor: style.stroke,
                      }}
                    >
                      <span
                        className="h-1.5 w-full rounded-full"
                        style={{ backgroundColor: style.ink, opacity: 0.45 }}
                      />
                      <span
                        className="h-1.5 w-2/3 rounded-full"
                        style={{ backgroundColor: style.ink, opacity: 0.2 }}
                      />
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-slate-800">
                      {style.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                      {style.desc}
                    </span>
                  </span>

                  <span
                    className="h-6 w-1.5 shrink-0 rounded-full opacity-0 transition-opacity
                               group-hover:opacity-100"
                    style={{ backgroundColor: style.ink }}
                  />
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* EMOJI + ICONS */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                       text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Smile className="h-4 w-4" />
            Emoji
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="center"
            className="w-80 p-4 duration-0 data-open:animate-none data-closed:animate-none"
          >
            <p className="text-sm font-semibold text-slate-900">Emoji and icons</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Choose from the picker or scroll the icon library.
            </p>

            <Tabs defaultValue="emoji" className="mt-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="emoji">Emoji</TabsTrigger>
                <TabsTrigger value="icons">Icons</TabsTrigger>
              </TabsList>

              <TabsContent value="emoji" className="mt-3">
                <Input
                  value={emojiQuery}
                  onChange={(e) => setEmojiQuery(e.target.value)}
                  placeholder="Search"
                  className="h-9"
                />

                <div className="mt-3 max-h-64 overflow-y-auto pr-1">
                  {emojiResults.map((group) => (
                    <div key={group.label} className="mb-3">
                      <p className="mb-1 text-[11px] font-medium text-slate-500">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-8 gap-1">
                        {group.items.map(([emoji, keywords]) => (
                          <button
                            key={emoji}
                            type="button"
                            title={keywords}
                            onClick={() => addEmoji(emoji)}
                            className="rounded-md p-1 text-xl leading-none transition-colors hover:bg-slate-100"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {emojiResults.length === 0 && (
                    <p className="py-6 text-center text-xs text-slate-400">
                      No emoji match that search.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="icons" className="mt-3">
                <Input
                  value={iconQuery}
                  onChange={(e) => setIconQuery(e.target.value)}
                  placeholder="Search icons"
                  className="h-9"
                />

                <div className="mt-3 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto pr-1">
                  {iconResults.map((name) => {
                    const Icon = (Lucide as any)[name];
                    if (!Icon) return null;

                    return (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={(event) => addIcon(event.currentTarget, name)}
                        className="flex flex-col items-center gap-1 rounded-lg border border-slate-200
                                   p-2 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Icon className="h-5 w-5 text-slate-700" />
                        <span className="w-full truncate text-[9px] text-slate-500">
                          {name}
                        </span>
                      </button>
                    );
                  })}

                  {iconResults.length === 0 && (
                    <p className="col-span-4 py-6 text-center text-xs text-slate-400">
                      No icons match that search.
                    </p>
                  )}

                  {iconResults.length === 300 && (
                    <p className="col-span-4 py-2 text-center text-[10px] text-slate-400">
                      Showing 300 of {ICON_NAMES.length}. Search to narrow it down.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {/* AI */}
        <button
          type="button"
          onClick={onToggleAi}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                      text-white transition-colors ${
                        aiOpen
                          ? "bg-violet-700 hover:bg-violet-800"
                          : "bg-violet-600 hover:bg-violet-700"
                      }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Helper
        </button>
      </div>
    </div>
  );
}