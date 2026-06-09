import { useState, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { useRigPositions, useCreateRigPosition, useUpdateRigPosition, useDeleteRigPosition, RigPosition } from "@/hooks/useRigPositions";
import { usePatchItems } from "@/hooks/usePatchItems";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Move, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const POSITION_TYPES = ["Truss", "Floor", "Ladder", "Boom", "FOH", "Balcony", "Grid", "Pipe", "Box Boom", "Other"];

const POSITION_COLORS = [
  "#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444",
  "#eab308", "#06b6d4", "#f43f5e", "#84cc16", "#8b5cf6",
];

const emptyForm = {
  name: "", positionType: "Truss", color: "#f97316", notes: "",
};

const PLOT_W = 800;
const PLOT_H = 500;

export default function LightingPlotPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: positions = [], isLoading } = useRigPositions(project.id);
  const { data: patchItems = [] } = usePatchItems(project.id);
  const createPos = useCreateRigPosition();
  const updatePos = useUpdateRigPosition();
  const deletePos = useDeleteRigPosition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RigPosition | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempPositions, setTempPositions] = useState<Record<string, { x: number; y: number }>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  const getEffectivePos = (p: RigPosition) => ({
    x: tempPositions[p.id]?.x ?? p.xPos,
    y: tempPositions[p.id]?.y ?? p.yPos,
  });

  const getFixtureCount = (positionName: string) =>
    patchItems.filter(pi => pi.position?.toLowerCase() === positionName.toLowerCase()).length;

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, color: POSITION_COLORS[positions.length % POSITION_COLORS.length] });
    setDialogOpen(true);
  };

  const openEdit = (p: RigPosition) => {
    setEditTarget(p);
    setForm({ name: p.name, positionType: p.positionType, color: p.color, notes: p.notes ?? "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Position name is required"); return; }
    const payload = {
      name: form.name,
      positionType: form.positionType,
      color: form.color,
      notes: form.notes || undefined,
    };
    if (editTarget) {
      updatePos.mutate({ id: editTarget.id, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      const cx = Math.floor(PLOT_W / 2 + (Math.random() - 0.5) * 300);
      const cy = Math.floor(PLOT_H / 2 + (Math.random() - 0.5) * 200);
      createPos.mutate({ projectId: project.id, ...payload, xPos: cx, yPos: cy }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, posId: string) => {
    e.preventDefault();
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const pos = positions.find(p => p.id === posId);
    if (!pos) return;
    const { x, y } = getEffectivePos(pos);
    const svgX = (e.clientX - svgRect.left) * (PLOT_W / svgRect.width);
    const svgY = (e.clientY - svgRect.top) * (PLOT_H / svgRect.height);
    setDragOffset({ x: svgX - x, y: svgY - y });
    setDragging(posId);
  }, [positions, tempPositions]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const svgX = (e.clientX - svgRect.left) * (PLOT_W / svgRect.width);
    const svgY = (e.clientY - svgRect.top) * (PLOT_H / svgRect.height);
    const nx = Math.max(50, Math.min(PLOT_W - 50, Math.round(svgX - dragOffset.x)));
    const ny = Math.max(30, Math.min(PLOT_H - 30, Math.round(svgY - dragOffset.y)));
    setTempPositions(prev => ({ ...prev, [dragging]: { x: nx, y: ny } }));
  }, [dragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (!dragging) return;
    const tp = tempPositions[dragging];
    if (tp) {
      updatePos.mutate({ id: dragging, xPos: tp.x, yPos: tp.y });
    }
    setDragging(null);
  }, [dragging, tempPositions]);

  const SHAPE: Record<string, string> = {
    Truss: "rect", FOH: "rect", Balcony: "rect", Grid: "rect",
    Floor: "circle", Boom: "line", Ladder: "ladder", "Box Boom": "circle", Pipe: "rect", Other: "circle",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[project.name, "Lighting Plot"]}
        title="Lighting Plot"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading plot...</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-[#111]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="w-full"
            style={{ aspectRatio: `${PLOT_W}/${PLOT_H}`, cursor: dragging ? "grabbing" : "default", userSelect: "none" }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f1f1f" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={PLOT_W} height={PLOT_H} fill="#0a0a0a" />
            <rect width={PLOT_W} height={PLOT_H} fill="url(#grid)" />

            {/* Stage indicator */}
            <rect x={PLOT_W * 0.25} y={PLOT_H * 0.55} width={PLOT_W * 0.5} height={PLOT_H * 0.35}
              rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
            <text x={PLOT_W / 2} y={PLOT_H * 0.76} textAnchor="middle" fill="#333" fontSize="13" fontFamily="sans-serif">STAGE</text>
            <text x={PLOT_W / 2} y={PLOT_H * 0.88} textAnchor="middle" fill="#222" fontSize="10" fontFamily="sans-serif">↑ UPSTAGE ↓ DOWNSTAGE</text>

            {positions.length === 0 && (
              <text x={PLOT_W / 2} y={PLOT_H * 0.28} textAnchor="middle" fill="#333" fontSize="14" fontFamily="sans-serif">
                Add rig positions to start building your plot
              </text>
            )}

            {positions.map(pos => {
              const { x, y } = getEffectivePos(pos);
              const isDraggingThis = dragging === pos.id;
              const shape = SHAPE[pos.positionType] ?? "circle";
              const count = getFixtureCount(pos.name);

              return (
                <g key={pos.id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: "grab" }}
                  onMouseDown={e => handleMouseDown(e, pos.id)}
                >
                  {/* Glow when dragging */}
                  {isDraggingThis && (
                    <circle r="36" fill={pos.color} opacity="0.08" />
                  )}

                  {/* Shape */}
                  {(shape === "rect" || shape === "ladder") ? (
                    <rect x="-36" y="-14" width="72" height="28" rx="4"
                      fill={pos.color + "22"} stroke={pos.color} strokeWidth={isDraggingThis ? 2.5 : 1.5} />
                  ) : (
                    <circle r="22" fill={pos.color + "22"} stroke={pos.color} strokeWidth={isDraggingThis ? 2.5 : 1.5} />
                  )}

                  {/* Move indicator lines for truss/ladder */}
                  {shape === "ladder" && (
                    <>
                      <line x1="-20" y1="-14" x2="-20" y2="14" stroke={pos.color} strokeWidth="1.5" />
                      <line x1="20" y1="-14" x2="20" y2="14" stroke={pos.color} strokeWidth="1.5" />
                    </>
                  )}

                  {/* Label */}
                  <text y="-20" textAnchor="middle" fill={pos.color} fontSize="10" fontFamily="sans-serif" fontWeight="600">
                    {pos.name.length > 16 ? pos.name.slice(0, 14) + "…" : pos.name}
                  </text>

                  {/* Type badge */}
                  <text y="5" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" opacity="0.7">
                    {pos.positionType}
                  </text>

                  {/* Fixture count badge */}
                  {count > 0 && (
                    <g transform="translate(28, -22)">
                      <circle r="10" fill={pos.color} />
                      <text textAnchor="middle" y="4" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="700">
                        {count}
                      </text>
                    </g>
                  )}

                  {/* Edit/Delete on hover — implemented as SVG buttons */}
                  <g transform="translate(-36, 20)" opacity="0" className="pos-actions">
                    <rect width="16" height="16" rx="3" fill="#222" stroke="#333" strokeWidth="1"
                      style={{ cursor: "pointer" }}
                      onClick={e => { e.stopPropagation(); openEdit(pos); }} />
                    <text x="8" y="12" textAnchor="middle" fill="#999" fontSize="10">✏</text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Sidebar list */}
      {positions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {positions.map(p => {
            const count = getFixtureCount(p.name);
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card group hover:border-border/80 transition-colors">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.positionType}{count > 0 ? ` · ${count} fixture${count !== 1 ? "s" : ""}` : ""}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deletePos.mutate(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {positions.length === 0 && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 rounded-xl border border-dashed border-border">
          <LayoutGrid className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No rig positions yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Add positions like Truss, FOH, Ladder to build your plot</p>
          <Button size="sm" className="mt-4" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Add First Position
          </Button>
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Position" : "Add Rig Position"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Position Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. FOH Truss, Stage Left Ladder" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Position Type</label>
              <Select value={form.positionType} onValueChange={v => setForm(f => ({ ...f, positionType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Colour</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
                <div className="flex gap-1.5 flex-wrap">
                  {POSITION_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-6 h-6 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: form.color === c ? "white" : "transparent" }} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            {editTarget && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => { deletePos.mutate(editTarget.id); setDialogOpen(false); }}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createPos.isPending || updatePos.isPending}>
                {editTarget ? "Save" : "Add Position"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
