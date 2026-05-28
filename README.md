# Honda RA621H – CPM Visualizer

> **Critical Path Method (CPM) + DAG + Kahn's Topological Sort**  
> Interactive visualization of the Honda RA621H F1 Power Unit assembly process.

![Preview](https://img.shields.io/badge/status-ready-4CAF50?style=flat-square) ![Nodes](https://img.shields.io/badge/nodes-103-E10600?style=flat-square) ![Edges](https://img.shields.io/badge/edges-216-FF6B35?style=flat-square) ![No Dependencies](https://img.shields.io/badge/dependencies-none-2196F3?style=flat-square)

---

## Overview

This project visualizes the assembly process of the **Honda RA621H** Formula 1 Power Unit using three interconnected algorithms:

| Concept | Description |
|---------|-------------|
| **DAG** | 103 components modeled as nodes, 216 dependencies as directed edges |
| **Kahn's Algorithm** | BFS-based topological sort – validates assembly order, detects cycles |
| **CPM (Critical Path Method)** | Forward/backward pass to identify the critical path and float per component |

The visualizer is a **zero-dependency, pure HTML/CSS/JS** app — no build tools, no npm, no server required.

---

## Project Structure

```
honda-cpm-visualizer/
│
├── index.html              # Main app shell (5 tabs)
│
├── css/
│   └── style.css           # Full UI — dark F1 aesthetic, responsive
│
├── js/
│   ├── dag.js              # Canvas DAG renderer (pan/zoom/hover/click)
│   ├── kahn.js             # Kahn's algorithm step-by-step animator
│   ├── charts.js           # Gantt SVG + Float histogram + Subsystem bar chart
│   └── app.js              # Main controller, table, filters, tab routing
│
└── data/
    └── graph-data.js       # 103 nodes, 216 edges + precomputed CPM results
```

---

## Features

### ⬡ DAG View
- **Canvas-based** force/hierarchical layout of all 103 components
- **Pan** (drag) and **zoom** (scroll wheel / pinch)
- Click any node → detailed CPM panel (ES, EF, LS, LF, Float, predecessors, successors)
- Hover tooltip with full CPM data
- Filter: critical path only, highlight by subsystem
- "Focus Critical Path" button auto-frames the CP nodes

### ▶ Kahn's Algorithm
- **Step-by-step animation** of the BFS topological sort
- Play / Pause / Step Forward / Step Back / Reset
- Adjustable speed (5 levels)
- Progress scrubber bar
- Live queue display + processed nodes list
- Node color states: Waiting → Ready → Processing → Done

### ▬ Gantt / CPM
- **SVG Gantt chart** for all 103 components or critical path only
- ES–EF bars colored by subsystem
- Float slack shown as grey overlay (LS–LF range)
- Critical path highlighted in red with ★ markers
- Scroll horizontally/vertically for full view

### ⊞ CPM Table
- Full sortable/searchable table: ID, Name, Subsystem, Duration, ES, EF, LS, LF, Float, CP flag
- Filter: All | Critical Path | Non-Critical
- Live search across ID and component name

### ◈ Analysis
- Summary stat cards (project duration, CP nodes, avg float, etc.)
- Float distribution histogram
- Subsystem total duration bar chart with CP proportion
- CPM & Kahn's formula reference

---

## CPM Formulas

```
Forward Pass:
  ES[v] = max(EF[u])  for all predecessors u
  EF[v] = ES[v] + duration[v]

Backward Pass:
  LF[v] = min(LS[w])  for all successors w
  LS[v] = LF[v] - duration[v]

Float:
  Total Float[v] = LS[v] - ES[v]  (= LF[v] - EF[v])
  Critical if Float == 0
```

---

## Data

| Metric | Value |
|--------|-------|
| Total Components (nodes) | 103 |
| Total Dependencies (edges) | 216 |
| Root Nodes (in-degree = 0) | 16 |
| Is valid DAG (acyclic) | ✓ True |
| Avg in-degree | 2.10 |
| Avg out-degree | 2.10 |
| Subsystems | 9 |

**Subsystems modeled:**
- Engine Block (ENG)
- MGU-H / MGU-K (MGU)
- Energy Recovery System (ERS)
- Internal Combustion Engine (ICE)
- Turbocharger (TRB)
- Fuel System (FSY)
- Lubrication (LUB)
- Cooling (COL)
- Control Electronics (CTL)

---

## Usage

### GitHub Pages (Recommended)

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → main branch → `/` (root)**
3. Visit `https://<username>.github.io/<repo-name>/`

### Local

Just open `index.html` directly in a browser:
```bash
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or use any static server:
```bash
npx serve .
python3 -m http.server 8080
```

No build step. No npm install. No dependencies.

---

## Source Material

| File | Description |
|------|-------------|
| `Honda_RA621H_DAG_Kahn_CPM.ipynb` | Jupyter notebook — original Python implementation (NetworkX + pandas) |
| `Honda_RA621H_Topological_Sort.pptx` | Presentation slides — algorithm explanation and results |

The JavaScript in this repo is a faithful re-implementation of the Python logic from the notebook, running entirely client-side.

---

## Algorithm Implementation

### Kahn's Topological Sort (from notebook)

```python
def kahns_topological_sort(graph):
    in_degree = defaultdict(int)
    for node in graph.nodes():
        for _ in graph.predecessors(node):
            in_degree[node] += 1

    queue = deque(sorted([n for n, d in in_degree.items() if d == 0]))
    topo_order = []

    while queue:
        node = queue.popleft()
        topo_order.append(node)
        for successor in sorted(graph.successors(node)):
            in_degree[successor] -= 1
            if in_degree[successor] == 0:
                queue.append(successor)

    return topo_order, in_degree
```

Equivalent JS implementation is in `data/graph-data.js` → `kahnsSort()`.

### CPM Forward + Backward Pass

```python
def cpm_forward_pass(graph, topo_order):
    ES, EF = {}, {}
    for node in topo_order:
        preds = list(graph.predecessors(node))
        ES[node] = 0 if not preds else max(EF[p] for p in preds)
        EF[node] = ES[node] + graph.nodes[node]['duration']
    return ES, EF

def cpm_backward_pass(graph, topo_order, EF, project_duration):
    LF, LS = {}, {}
    for node in reversed(topo_order):
        succs = list(graph.successors(node))
        LF[node] = project_duration if not succs else min(LS[s] for s in succs)
        LS[node] = LF[node] - graph.nodes[node]['duration']
    return LF, LS
```

---

## License

MIT — free to use, adapt, and redistribute.

---

*Struktur Data dan Algoritma · Proyek 2025 · Honda RA621H F1 Engine Assembly*
