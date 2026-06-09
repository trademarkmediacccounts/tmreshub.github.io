import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { useShowFixtures, useCreateShowFixture, useUpdateShowFixture, useDeleteShowFixture, useGdtfSearch, ShowFixture, GdtfFixture } from "@/hooks/useShowFixtures";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Search, Download, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const emptyForm = {
  manufacturer: "", model: "", mode: "", dmxFootprint: "", beamAngle: "",
  colorTemp: "", power: "", weight: "", notes: "",
};

function FixtureForm({ value, onChange }: { value: typeof emptyForm; onChange: (f: typeof emptyForm) => void }) {
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Manufacturer *</label>
          <Input value={value.manufacturer} onChange={set("manufacturer")} placeholder="e.g. Robe" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Model *</label>
          <Input value={value.model} onChange={set("model")} placeholder="e.g. ESPRITE" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">DMX Mode</label>
        <Input value={value.mode} onChange={set("mode")} placeholder="e.g. Mode 1" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">DMX Footprint (channels)</label>
        <Input type="number" value={value.dmxFootprint} onChange={set("dmxFootprint")} placeholder="e.g. 28" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Beam Angle</label>
        <Input value={value.beamAngle} onChange={set("beamAngle")} placeholder="e.g. 7°–48°" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Color Temp</label>
        <Input value={value.colorTemp} onChange={set("colorTemp")} placeholder="e.g. 6000K" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Power Draw</label>
        <Input value={value.power} onChange={set("power")} placeholder="e.g. 930W" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Weight</label>
        <Input value={value.weight} onChange={set("weight")} placeholder="e.g. 19.6kg" />
      </div>
      <div className="col-span-2">
        <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
        <Input value={value.notes} onChange={set("notes")} placeholder="Additional notes..." />
      </div>
    </div>
  );
}

export default function FixtureLibraryPage() {
  const { project } = useOutletContext<{ project: Project }>();
  void project;

  const { data: fixtures = [], isLoading } = useShowFixtures();
  const createFixture = useCreateShowFixture();
  const updateFixture = useUpdateShowFixture();
  const deleteFixture = useDeleteShowFixture();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShowFixture | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [gdtfQuery, setGdtfQuery] = useState("");
  const [gdtfOpen, setGdtfOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const { data: gdtfResults = [], isFetching: gdtfLoading } = useGdtfSearch(gdtfQuery);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (f: ShowFixture) => {
    setEditTarget(f);
    setForm({
      manufacturer: f.manufacturer,
      model: f.model,
      mode: f.mode ?? "",
      dmxFootprint: f.dmxFootprint?.toString() ?? "",
      beamAngle: f.beamAngle ?? "",
      colorTemp: f.colorTemp ?? "",
      power: f.power ?? "",
      weight: f.weight ?? "",
      notes: f.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.manufacturer.trim() || !form.model.trim()) { toast.error("Manufacturer and model are required"); return; }
    const payload = {
      manufacturer: form.manufacturer,
      model: form.model,
      mode: form.mode || undefined,
      dmxFootprint: form.dmxFootprint ? parseInt(form.dmxFootprint) : undefined,
      beamAngle: form.beamAngle || undefined,
      colorTemp: form.colorTemp || undefined,
      power: form.power || undefined,
      weight: form.weight || undefined,
      notes: form.notes || undefined,
    };
    if (editTarget) {
      updateFixture.mutate({ id: editTarget.id, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createFixture.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const importFromGdtf = (f: GdtfFixture) => {
    setForm(prev => ({
      ...prev,
      manufacturer: f.manufacturer ?? prev.manufacturer,
      model: f.name ?? prev.model,
    }));
    setGdtfOpen(false);
    setDialogOpen(true);
  };

  const filtered = localSearch
    ? fixtures.filter(f =>
        f.manufacturer.toLowerCase().includes(localSearch.toLowerCase()) ||
        f.model.toLowerCase().includes(localSearch.toLowerCase())
      )
    : fixtures;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[project.name, "Fixture Library"]}
        title="Fixture Library"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setGdtfOpen(true)}>
              <Download className="w-4 h-4 mr-2" />
              GDTF Library
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Fixture
            </Button>
          </div>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search your library..."
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading library...</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-xl border border-dashed border-border">
          <Zap className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No fixtures yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Add manually or search the GDTF library</p>
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setGdtfOpen(true)}>
              <Download className="w-4 h-4 mr-1" /> GDTF Library
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> Add Fixture
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map(f => (
              <motion.div key={f.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-xl p-4 group hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{f.model}</p>
                    <p className="text-xs text-muted-foreground truncate">{f.manufacturer}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteFixture.mutate(f.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {f.mode && <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{f.mode}</span>}
                  {f.dmxFootprint && <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f.dmxFootprint}ch</span>}
                  {f.power && <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{f.power}</span>}
                  {f.beamAngle && <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{f.beamAngle}</span>}
                </div>
                {f.gdtfManufacturer && (
                  <p className="text-[10px] text-muted-foreground/50 mt-2">GDTF: {f.gdtfManufacturer} / {f.gdtfName}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Fixture" : "Add Fixture"}</DialogTitle>
          </DialogHeader>
          <FixtureForm value={form} onChange={setForm} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createFixture.isPending || updateFixture.isPending}>
              {editTarget ? "Save Changes" : "Add to Library"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* GDTF Search dialog */}
      <Dialog open={gdtfOpen} onOpenChange={setGdtfOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              GDTF Share Library
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-1">
            Search the official GDTF Share fixture database and import to your library.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by manufacturer or fixture name..."
              value={gdtfQuery}
              onChange={e => setGdtfQuery(e.target.value)}
              autoFocus
            />
            {gdtfQuery && (
              <button onClick={() => setGdtfQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="max-h-[340px] overflow-y-auto space-y-1">
            {gdtfLoading && (
              <div className="text-center py-8 text-muted-foreground text-sm">Searching GDTF Share...</div>
            )}
            {!gdtfLoading && gdtfQuery.trim().length >= 2 && gdtfResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No results found</div>
            )}
            {!gdtfLoading && gdtfQuery.trim().length < 2 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Type at least 2 characters to search</div>
            )}
            {gdtfResults.map((f, i) => (
              <motion.div key={f.fixture_type_id ?? i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary group cursor-pointer"
                onClick={() => importFromGdtf(f)}>
                <div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.manufacturer}</p>
                  {f.revision_date && <p className="text-[11px] text-muted-foreground/50">Rev. {f.revision_date}</p>}
                </div>
                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Import
                </Button>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
