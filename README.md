# Smart Escape — Interactive Evacuation Route Simulator

Smart Escape is an educational, interactive evacuation route simulator built for emergency management operations and university technology competitions.

It visualizes building floorplans as interactive undirected weighted graphs and calculates the lowest-cost evacuation route from any room or junction to an accessible open emergency exit under dynamic hazards.

---

## ⚡ Tech Stack & Constraints
- **Core**: React 19, JavaScript (ES2022+), Vite 8
- **Styling**: Vanilla CSS with customized design system (Dark Theme, Emergency Operations aesthetic)
- **Icons**: Lucide Icons
- **Deployment**: 100% Client-side Static Web Application (zero backend, zero database, zero external APIs)
- **Local File API**: Browser File API for drag-and-drop JSON import and validation

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Algorithm & Schema Verification
```bash
node test_suite.js
```

### 4. Build for Production
```bash
npm run build
```

---

## 🎯 Mandatory Features Implemented

1. **JSON Import & Validation**:
   - Drag-and-drop & file picker for `building.json`.
   - Comprehensive validation rejecting: self-loops, duplicate edges, duplicate IDs, invalid types, negative/zero costs, missing exits/rooms, and out-of-bounds counts (2–60 nodes, 1–150 edges).
   - Validates disconnected graphs and retains original initial states.

2. **Interactive SVG Building Map**:
   - Auto-fitting coordinate viewport with smooth zoom in/out, pan, and reset view controls.
   - Distinct visual system:
     - **Room**: Circular blue node with ID and label pill.
     - **Junction**: Violet node.
     - **Open Exit**: Emerald green node with exit icon.
     - **Blocked Node**: Danger red node with strike indicator.
     - **Closed Exit**: Muted dark red node with lock indicator.
     - **Normal Corridor**: Slate subtle undirected connection with cost badge.
     - **Blocked Corridor**: Red dashed line with hazard badge.
     - **Active Route**: Cyan line with glow filter and animated pulse on start node.
   - Interactive click actions: click node to select start or toggle hazard, click corridor to toggle block state.

3. **Shortest-Path Evacuation Engine (Dijkstra)**:
   - Undirected graph edge weights (costs are positive integers, independent of visual x/y coordinates).
   - Strict tie-breaking rules:
     - Minimum cost exits tie-break: lexicographically smallest **Exit ID**.
     - Multiple equal-cost paths to that exit tie-break: lexicographically smallest sequence of **Node IDs**.

4. **Dynamic Hazard Simulation**:
   - Instant real-time route recomputation on every hazard toggle.
   - Blocking a node renders all incident corridors unusable.
   - Blocking a corridor severs that connection only.
   - Closing an exit excludes it from evacuation targets.

5. **Simulation Reset**:
   - Restores the exact `initial_state` (`blocked_nodes`, `blocked_edges`, `closed_exits`) from the uploaded JSON file.

6. **Clear Failure & Warning States**:
   - `Starting location blocked` when the selected origin is compromised.
   - `No route available` when all open exits are cut off.

7. **Bilingual UI (English & বাংলা)**:
   - Complete 1-click toggle between English and Bengali across all buttons, tabs, labels, stats, alerts, and instructions.

---

## 🧪 Verification Scenarios Tested

All 5 core competition scenarios pass with mathematical certainty:
1. **Scenario 1**: Select `R1` → Route: `R1 -> C1 -> C2 -> E1` (Cost: 7, Corridors: 3)
2. **Scenario 2**: Select `R1` and block `C2` → Route: `R1 -> C1 -> C3 -> C4 -> E2` (Cost: 11, Corridors: 4)
3. **Scenario 3**: Select `R1` and close `E1` & `E2` → `No route available`
4. **Scenario 4**: Select `R2` → Route: `R2 -> C3 -> C4 -> E2` (Cost: 7, Corridors: 3)
5. **Scenario 5**: Select `R1` then block `R1` → `Starting location blocked`
