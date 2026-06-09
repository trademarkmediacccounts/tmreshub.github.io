import { useState, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { useShowFixtures, useCreateShowFixture, useUpdateShowFixture, useDeleteShowFixture, useGdtfSearch, ShowFixture, GdtfFixture } from "@/hooks/useShowFixtures";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Search, FileUp, Zap, X, Upload, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import JSZip from "jszip";

// ─── Types ──────────────────────────────────────────────────────────────────

const emptyForm = {
  manufacturer: "", model: "", mode: "", dmxFootprint: "", beamAngle: "",
  colorTemp: "", power: "", weight: "", notes: "",
};
type FormState = typeof emptyForm;

interface ParsedGdtfMode { name: string; footprint: number }
interface ParsedGdtf {
  manufacturer: string; model: string; fixtureTypeId: string;
  modes: ParsedGdtfMode[];
}

// ─── GDTF client-side parser ────────────────────────────────────────────────

async function parseGdtfFile(file: File): Promise<ParsedGdtf> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  // description.xml can be at root or in a subfolder
  let xmlStr: string | undefined;
  const descFile = zip.file("description.xml") ?? zip.file(/description\.xml$/i)[0];
  if (descFile) xmlStr = await descFile.async("string");
  if (!xmlStr) throw new Error("No description.xml found inside the .gdtf file.");

  const doc = new DOMParser().parseFromString(xmlStr, "text/xml");
  const parseErr = doc.querySelector("parsererror");
  if (parseErr) throw new Error("Failed to parse description.xml: " + parseErr.textContent?.slice(0, 80));

  const ft = doc.querySelector("FixtureType");
  if (!ft) throw new Error("No <FixtureType> element in description.xml");

  const manufacturer = ft.getAttribute("Manufacturer") ?? "";
  const model = ft.getAttribute("Name") ?? ft.getAttribute("ShortName") ?? "";
  const fixtureTypeId = ft.getAttribute("FixtureTypeID") ?? "";

  const modes: ParsedGdtfMode[] = Array.from(doc.querySelectorAll("DMXMode")).map(m => ({
    name: m.getAttribute("Name") ?? "Default",
    footprint: m.querySelectorAll("DMXChannel").length,
  }));

  return { manufacturer, model, fixtureTypeId, modes };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FixtureForm({ value, onChange }: { value: FormState; onChange: (f: FormState) => void }) {
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
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
        <label className="text-xs text-muted-foreground mb-1 block">DMX Footprint (ch)</label>
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

// ─── Main page ───────────────────────────────────────────────────────────────

export default function FixtureLibraryPage() {
  const { project } = useOutletContext<{ project: Project }>();
  void project;

  const { data: fixtures = [], isLoading } = useShowFixtures();
  const createFixture = useCreateShowFixture();
  const updateFixture = useUpdateShowFixture();
  const deleteFixture = useDeleteShowFixture();

  // Edit / create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShowFixture | null>(null);
  const [form, setForm] = useState(emptyForm);

  // GDTF search dialog
  const [gdtfOpen, setGdtfOpen] = useState(false);
  const [gdtfQuery, setGdtfQuery] = useState("");

  // GDTF file upload state
  const [parsedGdtf, setParsedGdtf] = useState<ParsedGdtf | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library search
  const [localSearch, setLocalSearch] = useState("");

  const { data: gdtfResults = [], isFetching: gdtfLoading, isError: gdtfError } = useGdtfSearch(gdtfQuery);

  // ── Helpers ──

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (f: ShowFixture) => {
    setEditTarget(f);
    setForm({
      manufacturer: f.manufacturer, model: f.model, mode: f.mode ?? "",
      dmxFootprint: f.dmxFootprint?.toString() ?? "", beamAngle: f.beamAngle ?? "",
      colorTemp: f.colorTemp ?? "", power: f.power ?? "", weight: f.weight ?? "",
      notes: f.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.manufacturer.trim() || !form.model.trim()) {
      toast.error("Manufacturer and model are required");
      return;
    }
    const payload = {
      manufacturer: form.manufacturer, model: form.model,
      mode: form.mode || undefined,
      dmxFootprint: form.dmxFootprint ? parseInt(form.dmxFootprint) : undefined,
      beamAngle: form.beamAngle || undefined, colorTemp: form.colorTemp || undefined,
      power: form.power || undefined, weight: form.weight || undefined,
      notes: form.notes || undefined,
    };
    if (editTarget) {
      updateFixture.mutate({ id: editTarget.id, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createFixture.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  // ── GDTF file parsing ──

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".gdtf")) {
      toast.error("Please select a .gdtf file");
      return;
    }
    setParsing(true);
    setParsedGdtf(null);
    try {
      const parsed = await parseGdtfFile(file);
      setParsedGdtf(parsed);
      setSelectedMode(parsed.modes[0]?.name ?? "");
      toast.success(`Parsed: ${parsed.manufacturer} ${parsed.model}`);
    } catch (err: any) {
      toast.error("Could not parse GDTF file: " + err.message);
    } finally {
      setParsing(false);
      // reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const applyParsedGdtf = () => {
    if (!parsedGdtf) return;
    const modeObj = parsedGdtf.modes.find(m => m.name === selectedMode) ?? parsedGdtf.modes[0];
    setForm(prev => ({
      ...prev,
      manufacturer: parsedGdtf.manufacturer || prev.manufacturer,
      model: parsedGdtf.model || prev.model,
      mode: modeObj?.name ?? prev.mode,
      dmxFootprint: modeObj?.footprint ? String(modeObj.footprint) : prev.dmxFootprint,
    }));
    setParsedGdtf(null);
    setGdtfOpen(false);
    setDialogOpen(true);
    toast.success("Fixture data imported — review and save");
  };

  // ── GDTF search import ──

  const importFromSearch = (f: GdtfFixture) => {
    // Normalise across possible field name variations
    const mfr = f.manufacturer ?? f.Manufacturer ?? f.vendor ?? "";
    const name = f.name ?? f.Name ?? f.fixture_name ?? f.FixtureName ?? "";
    const ruid = f.fixture_type_id ?? f.FixtureTypeID ?? f.id ?? "";
    setForm(prev => ({
      ...prev,
      manufacturer: mfr || prev.manufacturer,
      model: name || prev.model,
    }));
    setGdtfOpen(false);
    setDialogOpen(true);
  };

  // ── Filtered library ──

  const filtered = localSearch
    ? fixtures.filter(f =>
        f.manufacturer.toLowerCase().includes(localSearch.toLowerCase()) ||
        f.model.toLowerCase().includes(localSearch.toLowerCase())
      )
    : fixtures;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[project.name, "Fixture Library"]}
        title="Fixture Library"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setParsedGdtf(null); setGdtfOpen(true); }}>
              <FileUp className="w-4 h-4 mr-2" />
              GDTF Import
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Fixture
            </Button>
          </div>
        }
      />

      {/* Library search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search your library..." value={localSearch}
          onChange={e => setLocalSearch(e.target.value)} />
      </div>

      {/* Fixture grid */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading library...</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-xl border border-dashed border-border">
          <Zap className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No fixtures yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Import from a .gdtf file or add manually</p>
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => { setParsedGdtf(null); setGdtfOpen(true); }}>
              <FileUp className="w-4 h-4 mr-1" /> GDTF Import
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> Add Manually
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
                  <p className="text-[10px] text-muted-foreground/40 mt-2 truncate">
                    GDTF · {f.gdtfManufacturer} / {f.gdtfName}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add / Edit dialog ───────────────────────────────────────────── */}
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

      {/* ── GDTF Import dialog ──────────────────────────────────────────── */}
      <Dialog open={gdtfOpen} onOpenChange={open => { if (!open) { setParsedGdtf(null); setGdtfQuery(""); } setGdtfOpen(open); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-primary" />
              GDTF Import
            </DialogTitle>
            <DialogDescription>
              Upload a .gdtf file to extract fixture data automatically, or search the GDTF Share library.
            </DialogDescription>
          </DialogHeader>

          {/* ── File upload section ── */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              Upload .gdtf file
              <span className="text-xs font-normal text-muted-foreground ml-auto">Recommended</span>
            </p>

            <input ref={fileInputRef} type="file" accept=".gdtf" className="hidden"
              onChange={handleFileChange} />

            {!parsedGdtf ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-secondary/50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {parsing ? (
                  <>
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Parsing GDTF file…</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-8 h-8 text-muted-foreground/50" />
                    <span className="text-sm text-muted-foreground">Click to choose a .gdtf file</span>
                    <span className="text-xs text-muted-foreground/50">Extracts manufacturer, model, DMX modes & footprint</span>
                  </>
                )}
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{parsedGdtf.model}</p>
                    <p className="text-xs text-muted-foreground">{parsedGdtf.manufacturer}</p>
                    {parsedGdtf.fixtureTypeId && (
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-mono truncate">{parsedGdtf.fixtureTypeId}</p>
                    )}
                  </div>
                  <button onClick={() => { setParsedGdtf(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {parsedGdtf.modes.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">
                      DMX Mode ({parsedGdtf.modes.length} available)
                    </label>
                    {parsedGdtf.modes.length === 1 ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                          {parsedGdtf.modes[0].name}
                        </span>
                        <span className="text-muted-foreground text-xs">{parsedGdtf.modes[0].footprint} channels</span>
                      </div>
                    ) : (
                      <Select value={selectedMode} onValueChange={setSelectedMode}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {parsedGdtf.modes.map(m => (
                            <SelectItem key={m.name} value={m.name}>
                              {m.name} — {m.footprint} ch
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                <Button size="sm" className="w-full" onClick={applyParsedGdtf}>
                  <Check className="w-4 h-4 mr-2" />
                  Import &amp; Review Details
                </Button>
              </motion.div>
            )}
          </div>

          {/* ── GDTF Share search section ── */}
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              Search GDTF Share library
              <span className="text-xs font-normal text-muted-foreground/60 ml-auto">gdtf-share.com</span>
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by manufacturer or model…"
                value={gdtfQuery} onChange={e => setGdtfQuery(e.target.value)} />
              {gdtfQuery && (
                <button onClick={() => setGdtfQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border bg-secondary/20">
              {gdtfError ? (
                <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                  <span>GDTF Share API is currently unavailable. Use the file upload above instead.</span>
                </div>
              ) : gdtfLoading ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Searching…</div>
              ) : gdtfQuery.trim().length < 2 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Type at least 2 characters to search</div>
              ) : gdtfResults.length === 0 ? (
                <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                  No results — the GDTF Share API may be unavailable. Try uploading a .gdtf file instead.
                </div>
              ) : (
                gdtfResults.map((f, i) => {
                  const mfr = f.manufacturer ?? f.Manufacturer ?? f.vendor ?? "";
                  const name = f.name ?? f.Name ?? f.fixture_name ?? f.FixtureName ?? "";
                  return (
                    <motion.div key={f.fixture_type_id ?? i}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-secondary group cursor-pointer border-b border-border/50 last:border-0"
                      onClick={() => importFromSearch(f)}>
                      <div>
                        <p className="text-sm font-medium">{name || "(unnamed)"}</p>
                        <p className="text-xs text-muted-foreground">{mfr}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 shrink-0 h-7 text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Use
                      </Button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
