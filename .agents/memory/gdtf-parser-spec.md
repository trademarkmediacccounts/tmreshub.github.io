---
name: GDTF parser spec facts
description: Spec-correct rules for parsing .gdtf files (DMX footprint, physical specs, Properties)
---

## DMX Channel Offset (spec table 58)
- Separator is **comma** (`,`), NOT space — e.g. `Offset="1,2"` for 16-bit
- `Offset="None"` = virtual channel, no DMX address — **skip when counting footprint**
- Footprint for a break = **max Offset integer** across all DMXChannels in that break
- `DMXBreak` defaults to 1; `"Overwrite"` = treat as break 1

## Beam Geometry attributes (spec table 41)
XML node `<Beam>` inside `<Geometries>`:
- `LampType` — Discharge / Tungsten / Halogen / LED
- `PowerConsumption` — Watts (optical/light power; default 1000)
- `LuminousFlux` — lumen (default 10000)
- `ColorTemperature` — Kelvin (default 6000)
- `BeamAngle` — degrees (narrow cone; default 25)
- `FieldAngle` — degrees (wide cone; default 25)
- `BeamType` — Wash / Spot / None / Rectangle / PC / Fresnel / Glow
- `ColorRenderingIndex` — CRI (0–100, default 100)

## Properties Collect (spec tables 28–30)
Under `<PhysicalDescriptions><Properties>`:
- `<Weight Value="19.6"/>` — device weight in **kg**
- `<PowerConsumption Value="940"/>` — total device electrical power in **Watts**
  (distinct from Beam@PowerConsumption which is optical output power)

**Why:** The old parser used `querySelectorAll("DMXChannel").length` which is wrong — it counts channels not addresses, missing multi-byte channels and counting virtual ones.

**How to apply:** See `FixtureLibraryPage.tsx` → `parseGdtfFile()` and `calcBreaks()`.
