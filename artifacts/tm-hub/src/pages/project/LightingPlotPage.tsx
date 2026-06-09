import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import {
  useRigPositions, useCreateRigPosition, useUpdateRigPosition,
  useDeleteRigPosition, RigPosition,
} from "@/hooks/useRigPositions";
import { usePatchItems } from "@/hooks/usePatchItems";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MousePointer2, Square, Minus, ZoomIn, ZoomOut, Download, Printer, Trash2, Pencil, Grid3X3, Maximize2, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Canvas constants ─────────────────────────────────────────────────────────
const CW = 1400;
const CH = 1000;
const GRID = 50; // 50px = 1 metre

// ─── Position type categories ─────────────────────────────────────────────────
const BAR_TYPES = ["Truss", "Pipe", "Bar", "FOH", "Balcony", "Grid", "Ladder", "Boom", "Box Boom"];
const AREA_TYPES = ["Stage Area", "Masking", "Audience", "Platform", "Cyclorama", "Wings"];
const IS_BAR = new Set(BAR_TYPES);
const IS_AREA = new Set(AREA_TYPES);

const AREA_FILL: Record<string, string> = {
  "Stage Area": "#f5f5f5",
  "Masking": "#1a1a1a",
  "Audience": "url(#seats)",
  "Platform": "#ede8dc",
  "Cyclorama": "#e8f3fd",
  "Wings": "#efefef",
};
const AREA_STROKE: Record<string, string> = {
  "Stage Area": "#aaa",
  "Masking": "#000",
  "Audience": "#bbb",
  "Platform": "#c0a870",
  "Cyclorama": "#80aac8",
  "Wings": "#bbb",
};
const AREA_LABEL: Record<string, string> = {
  "Masking": "#555",
  "Stage Area": "#888",
  "Audience": "#888",
  "Platform": "#888",
  "Cyclorama": "#888",
  "Wings": "#888",
};

const POSITION_COLORS = [
  "#e63946", "#457b9d", "#2a9d8f", "#e9c46a", "#f4a261",
  "#a8dadc", "#264653", "#8338ec", "#06d6a0", "#fb5607",
];

// ─── Fixture type detection from name ─────────────────────────────────────────
function fxType(name: string): string {
  const n = name.toLowerCase();
  if (/s4|source.?4|leko|ers\b|ellips|profile/i.test(n)) return "ellipsoidal";
  if (/fresnel/i.test(n)) return "fresnel";
  if (/\bpar\b|par.?\d\d?|par.?can/i.test(n)) return "par";
  if (/moving|mh\d|viper|b-eye|mac\b|robe|beam\s*\d/i.test(n)) return "moving";
  if (/follow.?spot|super.?trouper/i.test(n)) return "followspot";
  if (/strip|border|batten|cyc\s*\d/i.test(n)) return "strip";
  if (/\bled\b|pixel/i.test(n)) return "led";
  return "generic";
}

const FX_TYPE_LABELS: Record<string, string> = {
  ellipsoidal: "Ellipsoidal",
  fresnel: "Fresnel",
  par: "PAR",
  moving: "Moving Head",
  followspot: "Follow Spot",
  strip: "Strip / Cyc",
  led: "LED",
  generic: "Generic",
};

// ─── SVG fixture symbols (USITT-inspired, top-down plan view) ─────────────────
function FxSym({
  kind, r = 9, stroke = "#222", fill = "white",
}: { kind: string; r?: number; stroke?: string; fill?: string }) {
  const sw = 1.3;
  const base = { fill, stroke, strokeWidth: sw };
  switch (kind) {
    case "ellipsoidal":
      return (
        <g>
          <circle r={r} {...base} />
          <line x1={0} y1={r * 0.45} x2={0} y2={r * 1.5} stroke={stroke} strokeWidth={sw} />
          <line x1={-r * 0.45} y1={r * 1.5} x2={r * 0.45} y2={r * 1.5} stroke={stroke} strokeWidth={sw} />
        </g>
      );
    case "fresnel":
      return (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <circle r={r} />
          <circle r={r * 0.58} fill="none" />
          <circle r={r * 0.2} />
        </g>
      );
    case "par":
      return (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <circle r={r} />
          <line x1={-r * 0.65} y1={-r * 0.65} x2={r * 0.65} y2={r * 0.65} />
          <line x1={r * 0.65} y1={-r * 0.65} x2={-r * 0.65} y2={r * 0.65} />
        </g>
      );
    case "moving":
      return (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <circle r={r} />
          <circle r={r * 0.38} />
          <line x1={0} y1={-r} x2={0} y2={r} strokeWidth={sw * 0.75} />
          <line x1={-r} y1={0} x2={r} y2={0} strokeWidth={sw * 0.75} />
        </g>
      );
    case "followspot":
      return (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <polygon points={`0,${-r} ${r * 0.87},${r * 0.5} ${-r * 0.87},${r * 0.5}`} />
        </g>
      );
    case "strip":
      return (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <rect x={-r * 2} y={-r * 0.42} width={r * 4} height={r * 0.84} />
          {[-1.1, -0.37, 0.37, 1.1].map(d => (
            <circle key={d} cx={d * r * 0.82} cy={0} r={r * 0.2} fill={stroke} stroke="none" />
          ))}
        </g>
      );
    case "led":
      return (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <rect x={-r} y={-r} width={r * 2} height={r * 2} />
          {([-1, 1] as number[]).flatMap(dx =>
            ([-1, 1] as number[]).map(dy => (
              <circle key={`${dx},${dy}`} cx={dx * r * 0.45} cy={dy * r * 0.45} r={r * 0.22} fill={stroke} stroke="none" />
            ))
          )}
        </g>
      );
    default:
      return <g fill={fill} stroke={stroke} strokeWidth={sw}><circle r={r} /></g>;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Tool = "select" | "area" | "bar";

interface DrawState {
  startX: number; startY: number; endX: number; endY: number;
}

interface PlotForm {
  name: string;
  positionType: string;
  color: string;
  widthPx: number;
  heightPx: number;
  notes: string;
  _x?: number;
  _y?: number;
}

type DialogState =
  | { mode: "create"; form: PlotForm }
  | { mode: "edit"; target: RigPosition; form: PlotForm }
  | null;

const snap = (v: number, g = GRID) => Math.round(v / g) * g;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LightingPlotPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: positions = [], isLoading } = useRigPositions(project.id);
  const { data: patchItems = [] } = usePatchItems(project.id);
  const createPos = useCreateRigPosition();
  const updatePos = useUpdateRigPosition();
  const deletePos = useDeleteRigPosition();

  const svgRef = useRef<SVGSVGElement>(null);

  const [tool, setTool] = useState<Tool>("select");
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<DrawState | null>(null);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [livePos, setLivePos] = useState<Record<string, { x: number; y: number }>>({});
  const [dialog, setDialog] = useState<DialogState>(null);

  // Fixtures grouped by position name (lowercase)
  const barFixtures = useMemo(() => {
    const m: Record<string, typeof patchItems> = {};
    for (const item of patchItems) {
      if (!item.position) continue;
      const k = item.position.toLowerCase();
      (m[k] ??= []).push(item);
    }
    return m;
  }, [patchItems]);

  // Legend: unique fixture models used in the patch
  const legendItems = useMemo(() => {
    const m = new Map<string, { type: string; count: number }>();
    for (const item of patchItems) {
      const key = item.fixtureName;
      if (!m.has(key)) m.set(key, { type: fxType(key), count: 0 });
      m.get(key)!.count++;
    }
    return [...m.entries()].map(([name, d]) => ({ name, ...d })).slice(0, 16);
  }, [patchItems]);

  // Effective position (live during drag, persisted otherwise)
  const effXY = useCallback((pos: RigPosition) => ({
    x: livePos[pos.id]?.x ?? pos.xPos,
    y: livePos[pos.id]?.y ?? pos.yPos,
  }), [livePos]);

  // Client coords → SVG canvas coords
  const pt = useCallback((cx: number, cy: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return {
      x: (cx - r.left) * CW / r.width,
      y: (cy - r.top) * CH / r.height,
    };
  }, []);

  // ── Mouse handlers ────────────────────────────────────────────────────────────

  const onSvgDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const { x, y } = pt(e.clientX, e.clientY);
    if (tool === "select") {
      setSelectedId(null);
      return;
    }
    const sx = snap(x), sy = snap(y);
    setDrawing({ startX: sx, startY: sy, endX: sx, endY: sy });
  }, [tool, pt]);

  const onSvgMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = pt(e.clientX, e.clientY);
    if (drawing) {
      setDrawing(d => d ? { ...d, endX: snap(x), endY: snap(y) } : null);
    }
    if (drag) {
      const nx = snap(Math.max(0, Math.min(CW, x - drag.ox)));
      const ny = snap(Math.max(0, Math.min(CH, y - drag.oy)));
      setLivePos(p => ({ ...p, [drag.id]: { x: nx, y: ny } }));
    }
  }, [drawing, drag, pt]);

  const onSvgUp = useCallback(() => {
    if (drawing) {
      const w = Math.abs(drawing.endX - drawing.startX);
      const h = Math.abs(drawing.endY - drawing.startY);
      const startX = Math.min(drawing.startX, drawing.endX);
      const startY = Math.min(drawing.startY, drawing.endY);
      if (w > 15 || h > 15) {
        const isBar = tool === "bar";
        const count = positions.filter(p => isBar ? IS_BAR.has(p.positionType) : IS_AREA.has(p.positionType)).length;
        const colorIndex = positions.length % POSITION_COLORS.length;
        setDialog({
          mode: "create",
          form: {
            name: isBar ? `Bar ${count + 1}` : `Area ${count + 1}`,
            positionType: isBar ? "Truss" : "Stage Area",
            color: isBar ? POSITION_COLORS[colorIndex] : "#888888",
            widthPx: Math.max(w, isBar ? 10 : 40),
            heightPx: Math.max(h, isBar ? 6 : 40),
            notes: "",
            _x: startX,
            _y: startY,
          },
        });
      }
      setDrawing(null);
    }
    if (drag) {
      const lp = livePos[drag.id];
      if (lp) updatePos.mutate({ id: drag.id, xPos: lp.x, yPos: lp.y });
      setDrag(null);
    }
  }, [drawing, drag, tool, positions, livePos, updatePos]);

  const startDrag = useCallback((e: React.MouseEvent, pos: RigPosition) => {
    if (tool !== "select") return;
    e.stopPropagation();
    setSelectedId(pos.id);
    const { x, y } = pt(e.clientX, e.clientY);
    const ep = livePos[pos.id] ?? { x: pos.xPos, y: pos.yPos };
    setDrag({ id: pos.id, ox: x - ep.x, oy: y - ep.y });
  }, [tool, pt, livePos]);

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        setDrawing(null);
        setSelectedId(null);
        setTool("select");
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !dialog) {
        deletePos.mutate(selectedId);
        setSelectedId(null);
      }
      if (e.key === "v") setTool("select");
      if (e.key === "a") setTool("area");
      if (e.key === "b") setTool("bar");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, dialog, deletePos]);

  // ── Dialog helpers ────────────────────────────────────────────────────────────
  const patchForm = (patch: Partial<PlotForm>) =>
    setDialog(d => d ? { ...d, form: { ...d.form, ...patch } } : null);

  const saveDialog = () => {
    if (!dialog) return;
    const f = dialog.form;
    if (!f.name.trim()) { toast.error("Name is required"); return; }
    if (dialog.mode === "create") {
      createPos.mutate({
        projectId: project.id,
        name: f.name,
        positionType: f.positionType,
        color: f.color,
        widthPx: f.widthPx,
        heightPx: f.heightPx,
        xPos: f._x ?? 100,
        yPos: f._y ?? 100,
        notes: f.notes || undefined,
      }, { onSuccess: () => { setDialog(null); toast.success("Element added"); } });
    } else {
      updatePos.mutate({
        id: dialog.target.id,
        name: f.name,
        positionType: f.positionType,
        color: f.color,
        widthPx: f.widthPx,
        heightPx: f.heightPx,
        notes: f.notes || undefined,
      }, { onSuccess: () => setDialog(null) });
    }
  };

  const openEdit = (pos: RigPosition) => {
    setDialog({
      mode: "edit",
      target: pos,
      form: {
        name: pos.name,
        positionType: pos.positionType,
        color: pos.color,
        widthPx: pos.widthPx,
        heightPx: pos.heightPx,
        notes: pos.notes ?? "",
      },
    });
  };

  // ── Export ────────────────────────────────────────────────────────────────────
  const downloadSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const str = `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`;
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, "-")}-lighting-plot.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Plot exported as SVG");
  };

  const printPlot = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const win = window.open("about:blank", "_blank");
    if (!win) { toast.error("Allow popups to print"); return; }
    win.document.write(`<!DOCTYPE html><html><head>
      <title>${project.name} — Lighting Plot</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: white; }
        svg { width: 100vw; height: auto; display: block; }
        @page { margin: 8mm; size: A3 landscape; }
        @media print { html, body { width: 100%; height: 100%; } }
      </style>
    </head><body>${svgStr}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  // ── Computed drawing rect ─────────────────────────────────────────────────────
  const drawRect = drawing ? {
    x: Math.min(drawing.startX, drawing.endX),
    y: Math.min(drawing.startY, drawing.endY),
    w: Math.abs(drawing.endX - drawing.startX),
    h: Math.abs(drawing.endY - drawing.startY),
  } : null;

  // ── Legend dimensions ─────────────────────────────────────────────────────────
  const LEGEND_W = 252;
  const LEGEND_LINE = 22;
  const LEGEND_H = legendItems.length > 0 ? 28 + legendItems.length * LEGEND_LINE + 4 : 0;
  const LEGEND_X = CW - LEGEND_W - 16;
  const LEGEND_Y = 40;

  // ── Scale bar: 5 ticks × 50px = 5m ───────────────────────────────────────────
  const SCALE_X = 20;
  const SCALE_Y = CH - 24;

  // ── Render ────────────────────────────────────────────────────────────────────
  const areas = positions.filter(p => IS_AREA.has(p.positionType));
  const bars = positions.filter(p => IS_BAR.has(p.positionType));

  const cursorStyle = (() => {
    if (drawing) return "crosshair";
    if (tool !== "select") return "crosshair";
    if (drag) return "grabbing";
    return "default";
  })();

  return (
    <div className="space-y-0">
      <div className="pb-4">
        <PageHeader
          breadcrumb={[project.name, "Lighting Plot"]}
          title="Lighting Plot"
        />
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-1 py-1.5 bg-card border border-border rounded-t-xl">
        {/* Draw tools */}
        <div className="flex gap-0.5">
          {([
            { id: "select" as Tool, Icon: MousePointer2, label: "Select (V)" },
            { id: "area" as Tool, Icon: Square, label: "Draw Stage Area (A)" },
            { id: "bar" as Tool, Icon: Minus, label: "Draw Lighting Bar (B)" },
          ] as const).map(({ id, Icon, label }) => (
            <Button
              key={id}
              size="sm"
              variant={tool === id ? "secondary" : "ghost"}
              className="h-8 w-8 p-0"
              title={label}
              onClick={() => setTool(id)}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Zoom */}
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Zoom out"
          onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-11 text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Zoom in"
          onClick={() => setZoom(z => Math.min(z + 0.25, 4))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Fit to window"
          onClick={() => setZoom(1)}>
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Grid toggle */}
        <Button
          size="sm"
          variant={showGrid ? "secondary" : "ghost"}
          className="h-8 px-2 gap-1.5 text-xs"
          onClick={() => setShowGrid(g => !g)}
          title="Toggle grid"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          Grid
        </Button>

        {/* Selected actions */}
        {selectedId && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            <Button size="sm" variant="ghost" className="h-8 px-2 gap-1.5 text-xs"
              onClick={() => { const p = positions.find(p => p.id === selectedId); if (p) openEdit(p); }}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button size="sm" variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete (Delete key)"
              onClick={() => { deletePos.mutate(selectedId); setSelectedId(null); }}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        )}

        {/* Export */}
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="outline" className="h-8 px-3 gap-1.5 text-xs" onClick={downloadSVG}>
            <Download className="w-3.5 h-3.5" />
            SVG
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-3 gap-1.5 text-xs" onClick={printPlot}>
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="border border-t-0 border-border rounded-b-xl bg-white text-center py-16 text-muted-foreground">
          Loading plot…
        </div>
      ) : (
        <div className="overflow-auto rounded-b-xl border border-t-0 border-border bg-neutral-200">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CW} ${CH}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              display: "block",
              width: `${zoom * 100}%`,
              minWidth: 600,
              background: "white",
              cursor: cursorStyle,
              userSelect: "none",
            }}
            onMouseDown={onSvgDown}
            onMouseMove={onSvgMove}
            onMouseUp={onSvgUp}
            onMouseLeave={onSvgUp}
          >
            <defs>
              {/* Fine grid (1m) */}
              <pattern id="g1" x={0} y={0} width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#ebebeb" strokeWidth={0.5} />
              </pattern>
              {/* Major grid (5m) */}
              <pattern id="g5" x={0} y={0} width={GRID * 5} height={GRID * 5} patternUnits="userSpaceOnUse">
                <rect width={GRID * 5} height={GRID * 5} fill="url(#g1)" />
                <path d={`M ${GRID * 5} 0 L 0 0 0 ${GRID * 5}`} fill="none" stroke="#ddd" strokeWidth={1} />
              </pattern>
              {/* Audience seat pattern */}
              <pattern id="seats" x={0} y={0} width={22} height={22} patternUnits="userSpaceOnUse">
                <rect x={1.5} y={1.5} width={19} height={19} rx={2} fill="#e4e4e4" stroke="#ccc" strokeWidth={0.5} />
              </pattern>
            </defs>

            {/* Background */}
            <rect width={CW} height={CH} fill="white" />
            {showGrid && <rect width={CW} height={CH} fill="url(#g5)" />}

            {/* ── Stage orientation labels ─────────────────────────────── */}
            <text x={CW / 2} y={18} textAnchor="middle" fontSize={10} fill="#ccc" fontFamily="sans-serif" letterSpacing={2}>
              ↑ UPSTAGE
            </text>
            <text x={CW / 2} y={CH - 6} textAnchor="middle" fontSize={10} fill="#ccc" fontFamily="sans-serif" letterSpacing={2}>
              DOWNSTAGE ↓
            </text>
            <text x={14} y={CH / 2} textAnchor="middle" fontSize={10} fill="#ccc" fontFamily="sans-serif"
              transform={`rotate(-90, 14, ${CH / 2})`} letterSpacing={2}>
              STAGE LEFT
            </text>
            <text x={CW - 14} y={CH / 2} textAnchor="middle" fontSize={10} fill="#ccc" fontFamily="sans-serif"
              transform={`rotate(90, ${CW - 14}, ${CH / 2})`} letterSpacing={2}>
              STAGE RIGHT
            </text>

            {/* ── Area elements (stage, masking, audience, etc.) ────────── */}
            {areas.map(pos => {
              const { x, y } = effXY(pos);
              const w = pos.widthPx ?? 300;
              const h = pos.heightPx ?? 200;
              const isSelected = selectedId === pos.id;
              return (
                <g
                  key={pos.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: tool === "select" ? "grab" : "default" }}
                  onMouseDown={e => startDrag(e, pos)}
                  onClick={e => { e.stopPropagation(); if (tool === "select") setSelectedId(pos.id); }}
                  onDoubleClick={e => { e.stopPropagation(); openEdit(pos); }}
                >
                  <rect
                    width={w} height={h}
                    fill={AREA_FILL[pos.positionType] ?? "#f5f5f5"}
                    stroke={isSelected ? "#3b82f6" : (AREA_STROKE[pos.positionType] ?? "#aaa")}
                    strokeWidth={isSelected ? 2 : (pos.positionType === "Masking" ? 3 : 1.5)}
                    strokeDasharray={isSelected ? "6,3" : "none"}
                  />
                  {isSelected && (
                    <rect x={-2} y={-2} width={w + 4} height={h + 4}
                      fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5,3"
                      style={{ pointerEvents: "none" }} />
                  )}
                  {pos.positionType !== "Masking" && (
                    <text
                      x={w / 2} y={h / 2 + 4}
                      textAnchor="middle"
                      fontSize={Math.min(h / 3, 13)}
                      fill={AREA_LABEL[pos.positionType] ?? "#888"}
                      fontFamily="sans-serif"
                      fontWeight={500}
                      style={{ pointerEvents: "none" }}
                    >
                      {pos.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ── Lighting bars with fixture symbols ───────────────────── */}
            {bars.map(pos => {
              const { x, y } = effXY(pos);
              const bW = pos.widthPx ?? 200;
              const bH = Math.max(pos.heightPx ?? 8, 6);
              const items = barFixtures[pos.name.toLowerCase()] ?? [];
              const isSelected = selectedId === pos.id;
              const fxR = Math.min(9, Math.max(5, (bW / Math.max(items.length, 1)) * 0.38));
              const spacing = items.length > 0 ? bW / (items.length + 1) : bW / 2;
              const totalBarH = bH + (items.length > 0 ? fxR * 2 + 22 : 0);

              return (
                <g
                  key={pos.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: tool === "select" ? "grab" : "default" }}
                  onMouseDown={e => startDrag(e, pos)}
                  onClick={e => { e.stopPropagation(); if (tool === "select") setSelectedId(pos.id); }}
                  onDoubleClick={e => { e.stopPropagation(); openEdit(pos); }}
                >
                  {/* Invisible hit area covers bar + fixtures */}
                  <rect x={0} y={0} width={bW} height={totalBarH + 4} fill="transparent" />

                  {/* Bar body (pipe/truss) */}
                  <rect
                    x={0} y={0} width={bW} height={bH}
                    fill="#2a2a2a" stroke={isSelected ? "#3b82f6" : "#444"}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? "6,3" : "none"}
                    rx={1}
                  />

                  {/* Bar label (above) */}
                  <text
                    x={bW / 2} y={-5}
                    textAnchor="middle"
                    fontSize={10}
                    fill={pos.color}
                    fontWeight={600}
                    fontFamily="sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {pos.name}
                  </text>

                  {/* Position type tag */}
                  <text
                    x={bW / 2} y={-15}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#aaa"
                    fontFamily="sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {pos.positionType}
                  </text>

                  {/* Fixture symbols hanging below bar */}
                  {items.map((item, i) => {
                    const fx = spacing * (i + 1);
                    const fy = bH + fxR + 5;
                    const kind = fxType(item.fixtureName);
                    return (
                      <g key={item.id} transform={`translate(${fx},${fy})`}
                        style={{ pointerEvents: "none" }}>
                        <FxSym kind={kind} r={fxR} stroke={pos.color} />
                        {/* DMX address */}
                        <text
                          y={fxR + 9} textAnchor="middle"
                          fontSize={Math.max(6, fxR * 0.85)}
                          fill="#555"
                          fontFamily="monospace"
                        >
                          {item.dmxAddress}
                        </text>
                        {/* Gel/purpose (tiny, above symbol) */}
                        {item.gelColor && (
                          <text
                            y={-fxR - 4} textAnchor="middle"
                            fontSize={6}
                            fill="#888"
                            fontFamily="sans-serif"
                          >
                            {item.gelColor.slice(0, 6)}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Empty bar hint */}
                  {items.length === 0 && (
                    <text x={bW / 2} y={bH + 14} textAnchor="middle" fontSize={8} fill="#ccc"
                      fontFamily="sans-serif" style={{ pointerEvents: "none" }}>
                      no fixtures patched
                    </text>
                  )}
                </g>
              );
            })}

            {/* ── Drawing preview ──────────────────────────────────────── */}
            {drawRect && (drawRect.w > 2 || drawRect.h > 2) && (
              <>
                <rect
                  x={drawRect.x} y={drawRect.y}
                  width={drawRect.w} height={drawRect.h}
                  fill={tool === "bar" ? "rgba(40,40,40,0.18)" : "rgba(180,180,220,0.18)"}
                  stroke={tool === "bar" ? "#333" : "#8888cc"}
                  strokeWidth={1.5}
                  strokeDasharray="6,3"
                />
                {/* Size label */}
                <text
                  x={drawRect.x + drawRect.w / 2}
                  y={drawRect.y - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#666"
                  fontFamily="monospace"
                >
                  {(drawRect.w / GRID).toFixed(1)}m × {(drawRect.h / GRID).toFixed(1)}m
                </text>
              </>
            )}

            {/* Empty state prompt */}
            {positions.length === 0 && !drawing && (
              <g>
                <text x={CW / 2} y={CH / 2 - 14} textAnchor="middle" fontSize={14} fill="#ccc" fontFamily="sans-serif">
                  Use the toolbar to draw stage areas and lighting bars
                </text>
                <text x={CW / 2} y={CH / 2 + 8} textAnchor="middle" fontSize={11} fill="#ddd" fontFamily="sans-serif">
                  ▭  Stage Area — draw the stage, wings, masking, and audience
                </text>
                <text x={CW / 2} y={CH / 2 + 26} textAnchor="middle" fontSize={11} fill="#ddd" fontFamily="sans-serif">
                  ─  Lighting Bar — draw pipes and trusses; fixtures auto-populate from the patch
                </text>
              </g>
            )}

            {/* ── Scale bar ────────────────────────────────────────────── */}
            <g transform={`translate(${SCALE_X},${SCALE_Y})`}>
              <rect x={-2} y={-10} width={GRID * 5 + 4} height={20} fill="white" opacity={0.7} />
              <line x1={0} y1={0} x2={GRID * 5} y2={0} stroke="#888" strokeWidth={1.5} />
              {[0, 1, 2, 3, 4, 5].map(i => (
                <g key={i}>
                  <line x1={i * GRID} y1={-4} x2={i * GRID} y2={4} stroke="#888" strokeWidth={i === 0 || i === 5 ? 2 : 1} />
                  <text x={i * GRID} y={-7} textAnchor="middle" fontSize={8} fill="#888" fontFamily="sans-serif">
                    {i}m
                  </text>
                </g>
              ))}
            </g>

            {/* ── Title block (bottom-left) ─────────────────────────────── */}
            <g transform={`translate(${SCALE_X}, ${SCALE_Y - 28})`}>
              <text fontSize={13} fontWeight={700} fill="#333" fontFamily="sans-serif">{project.name}</text>
              <text y={14} fontSize={8} fill="#999" fontFamily="sans-serif">
                LIGHTING PLOT  ·  {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
              </text>
            </g>

            {/* ── Fixture key / legend ─────────────────────────────────── */}
            {legendItems.length > 0 && (
              <g transform={`translate(${LEGEND_X},${LEGEND_Y})`}>
                <rect width={LEGEND_W} height={LEGEND_H} fill="white" stroke="#ddd" strokeWidth={1} rx={3} />
                {/* Header */}
                <rect width={LEGEND_W} height={22} fill="#f5f5f5" stroke="none" rx={3} />
                <rect y={16} width={LEGEND_W} height={6} fill="#f5f5f5" stroke="none" />
                <text x={LEGEND_W / 2} y={15} textAnchor="middle" fontSize={9} fontWeight={700}
                  fill="#444" fontFamily="sans-serif" letterSpacing={1}>
                  FIXTURE KEY
                </text>
                <line x1={0} y1={22} x2={LEGEND_W} y2={22} stroke="#e5e5e5" strokeWidth={1} />
                {/* Rows */}
                {legendItems.map((item, i) => (
                  <g key={item.name} transform={`translate(0,${26 + i * LEGEND_LINE})`}>
                    {i > 0 && (
                      <line x1={8} y1={0} x2={LEGEND_W - 8} y2={0} stroke="#f0f0f0" strokeWidth={0.5} />
                    )}
                    <g transform={`translate(14,${LEGEND_LINE / 2})`}>
                      <FxSym kind={item.type} r={7} stroke="#333" />
                    </g>
                    <text x={27} y={14} fontSize={8.5} fill="#333" fontFamily="sans-serif">
                      {item.name.length > 26 ? item.name.slice(0, 24) + "…" : item.name}
                    </text>
                    <text x={LEGEND_W - 10} y={14} textAnchor="end" fontSize={8} fill="#888" fontFamily="sans-serif">
                      ×{item.count}
                    </text>
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>
      )}

      {/* ── Hint bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 px-1">
        <Info className="w-3 h-3 shrink-0" />
        {tool === "select"
          ? "Click to select · drag to move · double-click to edit · Delete key to remove"
          : tool === "bar"
          ? "Click and drag to draw a lighting bar — width sets bar length, height is usually small"
          : "Click and drag to draw a stage area — stage, masking, audience, cyclorama, etc."}
        <span className="ml-auto opacity-60">V = select · A = area · B = bar · Esc = cancel</span>
      </div>

      {/* ── Create / Edit dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!dialog} onOpenChange={open => { if (!open) setDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "create"
                ? (dialog.form.positionType && IS_BAR.has(dialog.form.positionType) ? "Add Lighting Bar" : "Add Stage Area")
                : "Edit Element"}
            </DialogTitle>
          </DialogHeader>
          {dialog && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                <Input
                  value={dialog.form.name}
                  onChange={e => patchForm({ name: e.target.value })}
                  placeholder="e.g. FOH Truss, Stage Area, Masking"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <Select
                  value={dialog.form.positionType}
                  onValueChange={v => patchForm({ positionType: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Lighting Bars</div>
                    {BAR_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    <div className="px-2 py-1 text-xs text-muted-foreground font-medium mt-1">Stage Areas</div>
                    {AREA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Width (px) — {(dialog.form.widthPx / GRID).toFixed(1)}m
                  </label>
                  <Input
                    type="number" min={1}
                    value={dialog.form.widthPx}
                    onChange={e => patchForm({ widthPx: Number(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Height (px) — {(dialog.form.heightPx / GRID).toFixed(1)}m
                  </label>
                  <Input
                    type="number" min={1}
                    value={dialog.form.heightPx}
                    onChange={e => patchForm({ heightPx: Number(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Colour (bars only) */}
              {IS_BAR.has(dialog.form.positionType) && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Bar colour (for label + fixtures)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={dialog.form.color}
                      onChange={e => patchForm({ color: e.target.value })}
                      className="w-9 h-9 rounded border border-border cursor-pointer bg-transparent p-0.5"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {POSITION_COLORS.map(c => (
                        <button key={c} onClick={() => patchForm({ color: c })}
                          className="w-6 h-6 rounded-full border-2 transition-all"
                          style={{ backgroundColor: c, borderColor: dialog.form.color === c ? "white" : "transparent" }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                <Input
                  value={dialog.form.notes}
                  onChange={e => patchForm({ notes: e.target.value })}
                  placeholder="Optional notes…"
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            {dialog?.mode === "edit" && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => { deletePos.mutate(dialog.target.id); setSelectedId(null); setDialog(null); }}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            )}
            <div className={cn("flex gap-2", dialog?.mode === "create" && "ml-auto")}>
              <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
              <Button onClick={saveDialog} disabled={createPos.isPending || updatePos.isPending}>
                {dialog?.mode === "create" ? "Add to Plot" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
