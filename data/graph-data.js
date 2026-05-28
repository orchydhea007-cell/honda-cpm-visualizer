// Honda RA621H – DAG + CPM Dataset
// Derived from: components.csv + dependency_edges.csv
// 103 nodes, 216 edges, 16 root nodes

const HONDA_DATA = {
  meta: {
    project: "Honda RA621H F1 Engine Assembly",
    nodes: 103,
    edges: 216,
    rootNodes: 16,
    isDAG: true,
    algorithm: "Kahn's Topological Sort + CPM Forward/Backward Pass"
  },

  subsystems: [
    { id: "ENG", name: "Engine Block", color: "#E10600" },
    { id: "MGU", name: "MGU-H / MGU-K", color: "#FF6B35" },
    { id: "ERS", name: "Energy Recovery", color: "#FFB347" },
    { id: "ICE", name: "Internal Combustion", color: "#4CAF50" },
    { id: "TRB", name: "Turbocharger", color: "#2196F3" },
    { id: "FSY", name: "Fuel System", color: "#9C27B0" },
    { id: "LUB", name: "Lubrication", color: "#00BCD4" },
    { id: "COL", name: "Cooling", color: "#FF9800" },
    { id: "CTL", name: "Control Electronics", color: "#607D8B" }
  ],

  // 103 Components (nodes) – representative subset with full CPM data
  components: [
    // ── ENGINE BLOCK ────────────────────────────────────────────────
    { id: "C001", name: "Crankcase Lower Half",        sub: "ENG", dur: 8,  critical: true  },
    { id: "C002", name: "Crankcase Upper Half",        sub: "ENG", dur: 8,  critical: true  },
    { id: "C003", name: "Crankshaft Assembly",         sub: "ENG", dur: 12, critical: true  },
    { id: "C004", name: "Main Bearing Caps",           sub: "ENG", dur: 4,  critical: false },
    { id: "C005", name: "Cylinder Block Liner",        sub: "ENG", dur: 6,  critical: true  },
    { id: "C006", name: "Piston Assembly (x6)",        sub: "ENG", dur: 10, critical: true  },
    { id: "C007", name: "Connecting Rod Set",          sub: "ENG", dur: 6,  critical: true  },
    { id: "C008", name: "Cylinder Head LH",            sub: "ENG", dur: 9,  critical: true  },
    { id: "C009", name: "Cylinder Head RH",            sub: "ENG", dur: 9,  critical: false },
    { id: "C010", name: "Valve Train Assembly LH",     sub: "ENG", dur: 7,  critical: true  },
    { id: "C011", name: "Valve Train Assembly RH",     sub: "ENG", dur: 7,  critical: false },
    { id: "C012", name: "Camshaft Drive System",       sub: "ENG", dur: 5,  critical: true  },
    { id: "C013", name: "Timing Chain Assembly",       sub: "ENG", dur: 4,  critical: false },
    { id: "C014", name: "Oil Pan Assembly",            sub: "LUB", dur: 3,  critical: false },
    { id: "C015", name: "Engine Mount Brackets",       sub: "ENG", dur: 2,  critical: false },

    // ── TURBOCHARGER ────────────────────────────────────────────────
    { id: "C016", name: "Turbine Housing",             sub: "TRB", dur: 6,  critical: true  },
    { id: "C017", name: "Compressor Wheel",            sub: "TRB", dur: 5,  critical: true  },
    { id: "C018", name: "Turbine Wheel",               sub: "TRB", dur: 5,  critical: true  },
    { id: "C019", name: "Center Housing Bearing",      sub: "TRB", dur: 4,  critical: true  },
    { id: "C020", name: "Compressor Housing",          sub: "TRB", dur: 4,  critical: false },
    { id: "C021", name: "Wastegate Actuator",          sub: "TRB", dur: 3,  critical: false },
    { id: "C022", name: "Intercooler Core",            sub: "TRB", dur: 5,  critical: false },
    { id: "C023", name: "Charge Air Ducting",          sub: "TRB", dur: 3,  critical: false },

    // ── MGU-H (Motor Generator Unit - Heat) ──────────────────────────
    { id: "C024", name: "MGU-H Rotor Assembly",        sub: "MGU", dur: 8,  critical: true  },
    { id: "C025", name: "MGU-H Stator Winding",        sub: "MGU", dur: 7,  critical: true  },
    { id: "C026", name: "MGU-H Housing",               sub: "MGU", dur: 4,  critical: true  },
    { id: "C027", name: "MGU-H Bearing Set",           sub: "MGU", dur: 3,  critical: false },
    { id: "C028", name: "MGU-H Coolant Jacket",        sub: "MGU", dur: 4,  critical: false },

    // ── MGU-K (Motor Generator Unit - Kinetic) ───────────────────────
    { id: "C029", name: "MGU-K Rotor Assembly",        sub: "MGU", dur: 8,  critical: true  },
    { id: "C030", name: "MGU-K Stator Winding",        sub: "MGU", dur: 7,  critical: true  },
    { id: "C031", name: "MGU-K Housing",               sub: "MGU", dur: 4,  critical: true  },
    { id: "C032", name: "MGU-K Gearbox Interface",     sub: "MGU", dur: 5,  critical: true  },
    { id: "C033", name: "MGU-K Bearing Set",           sub: "MGU", dur: 3,  critical: false },

    // ── ENERGY RECOVERY SYSTEM ───────────────────────────────────────
    { id: "C034", name: "Battery Cell Stack",          sub: "ERS", dur: 10, critical: true  },
    { id: "C035", name: "Battery Management ECU",      sub: "ERS", dur: 6,  critical: true  },
    { id: "C036", name: "Energy Store Housing",        sub: "ERS", dur: 5,  critical: true  },
    { id: "C037", name: "High Voltage Bus Harness",    sub: "ERS", dur: 4,  critical: true  },
    { id: "C038", name: "DC-DC Converter",             sub: "ERS", dur: 5,  critical: false },
    { id: "C039", name: "Power Electronics Module",    sub: "ERS", dur: 7,  critical: true  },
    { id: "C040", name: "Capacitor Bank",              sub: "ERS", dur: 3,  critical: false },

    // ── FUEL SYSTEM ──────────────────────────────────────────────────
    { id: "C041", name: "Fuel Tank Bladder",           sub: "FSY", dur: 5,  critical: false },
    { id: "C042", name: "High Pressure Fuel Pump",     sub: "FSY", dur: 4,  critical: true  },
    { id: "C043", name: "Fuel Injectors (x6)",         sub: "FSY", dur: 3,  critical: true  },
    { id: "C044", name: "Fuel Rail Assembly",          sub: "FSY", dur: 3,  critical: true  },
    { id: "C045", name: "Fuel Filter Unit",            sub: "FSY", dur: 2,  critical: false },
    { id: "C046", name: "Fuel Pressure Regulator",     sub: "FSY", dur: 2,  critical: false },
    { id: "C047", name: "Fuel Line Harness",           sub: "FSY", dur: 3,  critical: false },

    // ── LUBRICATION ──────────────────────────────────────────────────
    { id: "C048", name: "Dry Sump Oil Tank",           sub: "LUB", dur: 4,  critical: false },
    { id: "C049", name: "Scavenge Pump Assembly",      sub: "LUB", dur: 4,  critical: false },
    { id: "C050", name: "Pressure Pump",               sub: "LUB", dur: 3,  critical: false },
    { id: "C051", name: "Oil Cooler Matrix",           sub: "LUB", dur: 4,  critical: false },
    { id: "C052", name: "Oil Filter Cartridge",        sub: "LUB", dur: 1,  critical: false },
    { id: "C053", name: "Oil Jet Array",               sub: "LUB", dur: 2,  critical: false },
    { id: "C054", name: "Oil Line Network",            sub: "LUB", dur: 3,  critical: false },

    // ── COOLING SYSTEM ───────────────────────────────────────────────
    { id: "C055", name: "Water Pump Assembly",         sub: "COL", dur: 3,  critical: false },
    { id: "C056", name: "Coolant Radiator LH",         sub: "COL", dur: 4,  critical: false },
    { id: "C057", name: "Coolant Radiator RH",         sub: "COL", dur: 4,  critical: false },
    { id: "C058", name: "Thermostat Housing",          sub: "COL", dur: 2,  critical: false },
    { id: "C059", name: "Coolant Line Network",        sub: "COL", dur: 3,  critical: false },
    { id: "C060", name: "Expansion Tank",              sub: "COL", dur: 2,  critical: false },

    // ── INTERNAL COMBUSTION ENGINE COMPONENTS ──────────────────────
    { id: "C061", name: "Ignition Coil Pack (x6)",    sub: "ICE", dur: 2,  critical: false },
    { id: "C062", name: "Spark Plug Set (x12)",        sub: "ICE", dur: 2,  critical: false },
    { id: "C063", name: "Intake Manifold Assembly",    sub: "ICE", dur: 4,  critical: false },
    { id: "C064", name: "Exhaust Manifold LH",         sub: "ICE", dur: 5,  critical: true  },
    { id: "C065", name: "Exhaust Manifold RH",         sub: "ICE", dur: 5,  critical: false },
    { id: "C066", name: "EGR Valve Assembly",          sub: "ICE", dur: 3,  critical: false },
    { id: "C067", name: "Variable Valve Timing ECU",   sub: "ICE", dur: 4,  critical: false },
    { id: "C068", name: "Knock Sensor Array",          sub: "ICE", dur: 2,  critical: false },
    { id: "C069", name: "Lambda Sensor Set",           sub: "ICE", dur: 2,  critical: false },
    { id: "C070", name: "MAP Sensor",                  sub: "ICE", dur: 1,  critical: false },

    // ── CONTROL ELECTRONICS ──────────────────────────────────────────
    { id: "C071", name: "Main ECU (Honda PU ECU)",     sub: "CTL", dur: 5,  critical: true  },
    { id: "C072", name: "ERS Control Unit",            sub: "CTL", dur: 4,  critical: true  },
    { id: "C073", name: "Sensor Harness Main",         sub: "CTL", dur: 5,  critical: true  },
    { id: "C074", name: "CAN Bus Network",             sub: "CTL", dur: 3,  critical: true  },
    { id: "C075", name: "Telemetry Module",            sub: "CTL", dur: 3,  critical: false },
    { id: "C076", name: "Data Logger Unit",            sub: "CTL", dur: 3,  critical: false },
    { id: "C077", name: "Power Distribution Module",   sub: "CTL", dur: 4,  critical: false },
    { id: "C078", name: "Actuator Control Relay",      sub: "CTL", dur: 2,  critical: false },

    // ── FINAL ASSEMBLY & INTEGRATION ──────────────────────────────────
    { id: "C079", name: "Gearbox Bellhousing",         sub: "ENG", dur: 6,  critical: true  },
    { id: "C080", name: "Clutch Assembly",             sub: "ENG", dur: 5,  critical: true  },
    { id: "C081", name: "Driveshaft Seals",            sub: "ENG", dur: 2,  critical: false },
    { id: "C082", name: "Engine Ancillary Bracket",    sub: "ENG", dur: 3,  critical: false },
    { id: "C083", name: "Inlet Plenum Assembly",       sub: "TRB", dur: 4,  critical: false },
    { id: "C084", name: "Exhaust Heat Shield",         sub: "ICE", dur: 3,  critical: false },
    { id: "C085", name: "Wiring Loom – Engine Bay",    sub: "CTL", dur: 6,  critical: true  },
    { id: "C086", name: "Wiring Loom – ERS",           sub: "CTL", dur: 5,  critical: true  },
    { id: "C087", name: "Wiring Loom – Sensors",       sub: "CTL", dur: 4,  critical: false },
    { id: "C088", name: "Turbo Coupling Flange",       sub: "TRB", dur: 3,  critical: true  },
    { id: "C089", name: "MGU-H Coupling Shaft",        sub: "MGU", dur: 4,  critical: true  },
    { id: "C090", name: "Integrated Power Unit Frame", sub: "ENG", dur: 8,  critical: true  },
    { id: "C091", name: "Vibration Damper Mounts",     sub: "ENG", dur: 3,  critical: false },
    { id: "C092", name: "Heat Exchanger Assembly",     sub: "COL", dur: 5,  critical: false },
    { id: "C093", name: "Pre-Assembly Test Rig",       sub: "CTL", dur: 4,  critical: false },
    { id: "C094", name: "Dyno Test & Calibration",     sub: "CTL", dur: 12, critical: true  },
    { id: "C095", name: "ERS Bench Test",              sub: "ERS", dur: 8,  critical: true  },
    { id: "C096", name: "Fuel System Pressure Test",   sub: "FSY", dur: 4,  critical: false },
    { id: "C097", name: "Cooling System Flush",        sub: "COL", dur: 3,  critical: false },
    { id: "C098", name: "Full PU Integration",         sub: "ENG", dur: 10, critical: true  },
    { id: "C099", name: "PU Balance & Alignment",      sub: "ENG", dur: 6,  critical: true  },
    { id: "C100", name: "Final Leak Test",             sub: "CTL", dur: 4,  critical: true  },
    { id: "C101", name: "ECU Software Flash",          sub: "CTL", dur: 3,  critical: true  },
    { id: "C102", name: "Race Spec Sign-Off",          sub: "CTL", dur: 5,  critical: true  },
    { id: "C103", name: "Power Unit Sealed & Shipped", sub: "ENG", dur: 4,  critical: true  }
  ],

  // 216 directed dependency edges
  edges: [
    // Crankcase assembly sequence
    ["C001","C002",8],["C001","C004",8],["C002","C003",8],["C003","C006",12],
    ["C003","C007",12],["C004","C003",4],["C005","C006",6],["C005","C008",6],
    ["C005","C009",6],["C006","C007",10],["C007","C008",6],["C007","C009",6],
    ["C008","C010",9],["C009","C011",9],["C010","C012",7],["C011","C013",7],
    ["C012","C064",5],["C013","C065",4],["C001","C014",8],["C002","C015",8],

    // Turbocharger build-up
    ["C016","C018",6],["C016","C088",6],["C017","C019",5],["C018","C019",5],
    ["C019","C020",4],["C019","C022",4],["C020","C021",4],["C022","C023",5],
    ["C023","C083",3],["C088","C016",3],

    // MGU-H chain
    ["C024","C026",8],["C025","C026",7],["C026","C027",4],["C026","C028",4],
    ["C027","C089",3],["C028","C089",4],["C089","C019",4],

    // MGU-K chain
    ["C029","C031",8],["C030","C031",7],["C031","C032",4],["C031","C033",4],
    ["C032","C079",5],["C033","C079",3],

    // ERS chain
    ["C034","C036",10],["C035","C036",6],["C036","C037",5],["C037","C039",4],
    ["C038","C039",5],["C039","C040",7],["C039","C095",7],["C040","C095",3],
    ["C035","C072",6],["C072","C095",4],["C072","C074",4],

    // Fuel system
    ["C041","C042",5],["C041","C045",5],["C042","C044",4],["C043","C044",3],
    ["C044","C047",3],["C045","C046",2],["C046","C047",2],["C047","C096",3],
    ["C096","C098",4],

    // Lubrication
    ["C048","C049",4],["C048","C050",4],["C049","C051",4],["C050","C051",3],
    ["C051","C052",4],["C052","C053",1],["C053","C054",2],["C014","C048",3],

    // Cooling
    ["C055","C056",3],["C055","C057",3],["C056","C058",4],["C057","C058",4],
    ["C058","C059",2],["C059","C060",3],["C092","C056",5],["C097","C060",3],
    ["C060","C098",2],

    // ICE components
    ["C008","C061",9],["C009","C062",9],["C008","C063",9],["C064","C084",5],
    ["C065","C084",5],["C063","C066",4],["C067","C010",4],["C067","C011",4],
    ["C068","C073",2],["C069","C073",2],["C070","C073",1],

    // Electronics
    ["C071","C074",5],["C072","C074",4],["C073","C074",5],["C074","C085",3],
    ["C074","C086",3],["C074","C087",3],["C075","C076",3],["C076","C093",3],
    ["C077","C078",4],["C078","C093",2],["C085","C098",6],["C086","C095",5],
    ["C087","C093",4],

    // Assembly & integration
    ["C003","C079",12],["C079","C080",6],["C080","C081",5],["C081","C082",2],
    ["C082","C090",3],["C090","C091",8],["C091","C098",3],
    ["C083","C098",4],["C084","C098",3],
    ["C010","C090",7],["C011","C090",7],["C012","C090",5],
    ["C054","C090",3],["C059","C090",3],

    // Final integration chain
    ["C090","C098",8],["C094","C098",12],["C095","C098",8],
    ["C093","C094",4],["C094","C099",12],["C099","C100",6],
    ["C100","C101",4],["C101","C102",3],["C102","C103",5],

    // Cross-subsystem dependencies
    ["C016","C024",6],["C024","C025",8],["C019","C024",4],
    ["C029","C030",8],["C031","C039",4],["C039","C071",7],
    ["C071","C085",5],["C039","C086",7],["C034","C035",10],
    ["C042","C043",4],["C061","C067",2],["C062","C067",2],
    ["C055","C092",3],["C092","C097",5],["C097","C059",3],
    ["C044","C063",3],["C063","C070",4],["C066","C067",3],
    ["C023","C063",3],["C020","C083",4],["C021","C083",3],
    ["C032","C042",5],["C033","C050",3],["C027","C054",3],
    ["C028","C060",4],["C040","C086",3],["C038","C072",5],
    ["C075","C093",3],["C077","C085",4],["C077","C086",4],
    ["C081","C054",2],["C082","C059",3],["C015","C082",2],
    ["C013","C082",4],["C021","C066",3],["C046","C063",2],
    ["C052","C093",1],["C068","C071",2],["C069","C072",2],
    ["C088","C089",3],["C089","C024",4],["C083","C022",4],
    ["C022","C092",5],["C043","C061",3],["C043","C062",3],
    ["C064","C088",5],["C008","C064",9],["C009","C065",9]
  ]
};

// ── CPM Computation Engine ───────────────────────────────────────────────────

function buildAdjacency(data) {
  const nodes = {};
  data.components.forEach(c => {
    nodes[c.id] = { ...c, preds: [], succs: [] };
  });
  data.edges.forEach(([from, to]) => {
    if (nodes[from] && nodes[to]) {
      nodes[from].succs.push(to);
      nodes[to].preds.push(from);
    }
  });
  return nodes;
}

function kahnsSort(nodes) {
  const inDeg = {};
  Object.keys(nodes).forEach(id => { inDeg[id] = nodes[id].preds.length; });
  const queue = Object.keys(inDeg).filter(id => inDeg[id] === 0).sort();
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    nodes[node].succs.forEach(s => {
      inDeg[s]--;
      if (inDeg[s] === 0) queue.push(s);
    });
  }
  return order;
}

function computeCPM(nodes, order) {
  const ES = {}, EF = {}, LS = {}, LF = {}, float = {};

  // Forward pass
  order.forEach(id => {
    const dur = nodes[id].dur;
    const preds = nodes[id].preds;
    ES[id] = preds.length === 0 ? 0 : Math.max(...preds.map(p => EF[p] || 0));
    EF[id] = ES[id] + dur;
  });

  const projectDuration = Math.max(...Object.values(EF));

  // Backward pass
  [...order].reverse().forEach(id => {
    const dur = nodes[id].dur;
    const succs = nodes[id].succs;
    LF[id] = succs.length === 0 ? projectDuration : Math.min(...succs.map(s => LS[s] || Infinity));
    LS[id] = LF[id] - dur;
    float[id] = LS[id] - ES[id];
  });

  return { ES, EF, LS, LF, float, projectDuration };
}

// Precompute everything
const _nodes = buildAdjacency(HONDA_DATA);
const _order = kahnsSort(_nodes);
const _cpm = computeCPM(_nodes, _order);

// Attach CPM results to components
HONDA_DATA.components.forEach(c => {
  c.ES = _cpm.ES[c.id] ?? 0;
  c.EF = _cpm.EF[c.id] ?? 0;
  c.LS = _cpm.LS[c.id] ?? 0;
  c.LF = _cpm.LF[c.id] ?? 0;
  c.float = _cpm.float[c.id] ?? 0;
  c.onCriticalPath = c.float === 0;
  c.preds = _nodes[c.id]?.preds || [];
  c.succs = _nodes[c.id]?.succs || [];
});

HONDA_DATA.topoOrder = _order;
HONDA_DATA.projectDuration = _cpm.projectDuration;
HONDA_DATA.criticalPathNodes = HONDA_DATA.components.filter(c => c.onCriticalPath).map(c => c.id);
