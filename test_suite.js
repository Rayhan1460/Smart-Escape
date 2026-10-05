import { validateBuildingJSON } from './src/utils/validator.js';
import { findShortestEvacuationRoute } from './src/utils/dijkstra.js';
import fs from 'fs';

console.log('=== RUNNING SMART ESCAPE VERIFICATION TEST SUITE ===\n');

// 1. Load sample dataset
const rawSample = JSON.parse(fs.readFileSync('./src/data/sampleBuilding.json', 'utf8'));
const valRes = validateBuildingJSON(rawSample);
console.log('Validation of sampleBuilding.json:', valRes.valid ? 'PASSED' : 'FAILED: ' + valRes.error);
if (!valRes.valid) process.exit(1);

const buildingData = valRes.sanitizedData;

// Test Scenario 1:
// Select R1 -> Expected: R1 -> C1 -> C2 -> E1, Cost: 7
{
  const res = findShortestEvacuationRoute({
    nodes: buildingData.nodes,
    edges: buildingData.edges,
    startNodeId: 'R1',
    blockedNodes: new Set(),
    blockedEdges: new Set(),
    closedExits: new Set()
  });
  const pathStr = res.path.join(' -> ');
  const passed = res.status === 'SUCCESS' && pathStr === 'R1 -> C1 -> C2 -> E1' && res.totalCost === 7 && res.corridorsCount === 3;
  console.log(`Scenario 1 (Select R1): ${passed ? 'PASSED' : 'FAILED'}`);
  console.log(`  Path: ${pathStr}, Cost: ${res.totalCost}, Corridors: ${res.corridorsCount}`);
  if (!passed) process.exit(1);
}

// Test Scenario 2:
// Select R1 and block C2 -> Expected: R1 -> C1 -> C3 -> C4 -> E2, Cost: 11
{
  const res = findShortestEvacuationRoute({
    nodes: buildingData.nodes,
    edges: buildingData.edges,
    startNodeId: 'R1',
    blockedNodes: new Set(['C2']),
    blockedEdges: new Set(),
    closedExits: new Set()
  });
  const pathStr = res.path.join(' -> ');
  const passed = res.status === 'SUCCESS' && pathStr === 'R1 -> C1 -> C3 -> C4 -> E2' && res.totalCost === 11 && res.corridorsCount === 4;
  console.log(`Scenario 2 (Select R1 and block C2): ${passed ? 'PASSED' : 'FAILED'}`);
  console.log(`  Path: ${pathStr}, Cost: ${res.totalCost}, Corridors: ${res.corridorsCount}`);
  if (!passed) process.exit(1);
}

// Test Scenario 3:
// Select R1 and close E1 and E2 -> Expected: No route available
{
  const res = findShortestEvacuationRoute({
    nodes: buildingData.nodes,
    edges: buildingData.edges,
    startNodeId: 'R1',
    blockedNodes: new Set(),
    blockedEdges: new Set(),
    closedExits: new Set(['E1', 'E2'])
  });
  const passed = res.status === 'NO_ROUTE' && res.path.length === 0;
  console.log(`Scenario 3 (Select R1 and close E1, E2): ${passed ? 'PASSED' : 'FAILED'}`);
  console.log(`  Status: ${res.status}`);
  if (!passed) process.exit(1);
}

// Test Scenario 4:
// Select R2 -> Expected: R2 -> C3 -> C4 -> E2, Cost: 7
{
  const res = findShortestEvacuationRoute({
    nodes: buildingData.nodes,
    edges: buildingData.edges,
    startNodeId: 'R2',
    blockedNodes: new Set(),
    blockedEdges: new Set(),
    closedExits: new Set()
  });
  const pathStr = res.path.join(' -> ');
  const passed = res.status === 'SUCCESS' && pathStr === 'R2 -> C3 -> C4 -> E2' && res.totalCost === 7 && res.corridorsCount === 3;
  console.log(`Scenario 4 (Select R2): ${passed ? 'PASSED' : 'FAILED'}`);
  console.log(`  Path: ${pathStr}, Cost: ${res.totalCost}, Corridors: ${res.corridorsCount}`);
  if (!passed) process.exit(1);
}

// Test Scenario 5:
// Select R1 then block R1 -> Expected: Starting location blocked
{
  const res = findShortestEvacuationRoute({
    nodes: buildingData.nodes,
    edges: buildingData.edges,
    startNodeId: 'R1',
    blockedNodes: new Set(['R1']),
    blockedEdges: new Set(),
    closedExits: new Set()
  });
  const passed = res.status === 'START_BLOCKED' && res.path.length === 0;
  console.log(`Scenario 5 (Select R1 then block R1): ${passed ? 'PASSED' : 'FAILED'}`);
  console.log(`  Status: ${res.status}`);
  if (!passed) process.exit(1);
}

// Additional Test: Equal-cost Exits tie-breaking (Lexicographical exit ID)
{
  const testNodes = [
    { id: 'R1', label: 'Room 1', type: 'room', x: 0, y: 0 },
    { id: 'EB', label: 'Exit B', type: 'exit', x: 10, y: 0 },
    { id: 'EA', label: 'Exit A', type: 'exit', x: 0, y: 10 }
  ];
  const testEdges = [
    { id: 'e1', from: 'R1', to: 'EB', cost: 5 },
    { id: 'e2', from: 'R1', to: 'EA', cost: 5 }
  ];
  const res = findShortestEvacuationRoute({
    nodes: testNodes,
    edges: testEdges,
    startNodeId: 'R1',
    blockedNodes: new Set(),
    blockedEdges: new Set(),
    closedExits: new Set()
  });
  const passed = res.destinationExit === 'EA' && res.totalCost === 5;
  console.log(`Tie-Break Test (Exit ID EA vs EB): ${passed ? 'PASSED (Chose EA)' : 'FAILED'}`);
  if (!passed) process.exit(1);
}

// Additional Test: Equal-cost Path tie-breaking (Lexicographical node ID sequence)
{
  const testNodes = [
    { id: 'R1', label: 'Room 1', type: 'room', x: 0, y: 0 },
    { id: 'J2', label: 'Junction 2', type: 'junction', x: 5, y: 5 },
    { id: 'J1', label: 'Junction 1', type: 'junction', x: 5, y: -5 },
    { id: 'E1', label: 'Exit 1', type: 'exit', x: 10, y: 0 }
  ];
  const testEdges = [
    { id: 'e1', from: 'R1', to: 'J2', cost: 3 },
    { id: 'e2', from: 'J2', to: 'E1', cost: 3 },
    { id: 'e3', from: 'R1', to: 'J1', cost: 3 },
    { id: 'e4', from: 'J1', to: 'E1', cost: 3 }
  ];
  // Paths: R1 -> J1 -> E1 vs R1 -> J2 -> E1 (both cost 6)
  // J1 is lexicographically smaller than J2
  const res = findShortestEvacuationRoute({
    nodes: testNodes,
    edges: testEdges,
    startNodeId: 'R1',
    blockedNodes: new Set(),
    blockedEdges: new Set(),
    closedExits: new Set()
  });
  const pathStr = res.path.join(' -> ');
  const passed = pathStr === 'R1 -> J1 -> E1';
  console.log(`Tie-Break Test (Path R1->J1->E1 vs R1->J2->E1): ${passed ? 'PASSED (' + pathStr + ')' : 'FAILED'}`);
  if (!passed) process.exit(1);
}

// Disconnected graph test
{
  const discNodes = [
    { id: 'R1', label: 'Room 1', type: 'room', x: 0, y: 0 },
    { id: 'R2', label: 'Room 2', type: 'room', x: 10, y: 0 },
    { id: 'E1', label: 'Exit 1', type: 'exit', x: 20, y: 0 }
  ];
  const discEdges = [
    { id: 'e1', from: 'R2', to: 'E1', cost: 2 }
  ];
  const valDisc = validateBuildingJSON({
    building: 'Disconnected Hall',
    nodes: discNodes,
    edges: discEdges,
    initial_state: {}
  });
  const res = findShortestEvacuationRoute({
    nodes: discNodes,
    edges: discEdges,
    startNodeId: 'R1',
    blockedNodes: new Set(),
    blockedEdges: new Set(),
    closedExits: new Set()
  });
  const passed = valDisc.valid && res.status === 'NO_ROUTE';
  console.log(`Disconnected Graph Test: ${passed ? 'PASSED (Valid schema, NO_ROUTE from R1)' : 'FAILED'}`);
  if (!passed) process.exit(1);
}

// Malformed JSON validation tests
{
  const invalidCases = [
    { name: 'Self-loop', data: { building: 'B', nodes: [{id:'r',label:'r',type:'room',x:0,y:0},{id:'e',label:'e',type:'exit',x:1,y:1}], edges: [{id:'e1',from:'r',to:'r',cost:1}], initial_state:{} } },
    { name: 'Repeated undirected edge', data: { building: 'B', nodes: [{id:'r',label:'r',type:'room',x:0,y:0},{id:'e',label:'e',type:'exit',x:1,y:1}], edges: [{id:'e1',from:'r',to:'e',cost:1},{id:'e2',from:'e',to:'r',cost:2}], initial_state:{} } },
    { name: 'Missing exit', data: { building: 'B', nodes: [{id:'r1',label:'r1',type:'room',x:0,y:0},{id:'r2',label:'r2',type:'room',x:1,y:1}], edges: [{id:'e1',from:'r1',to:'r2',cost:1}], initial_state:{} } },
    { name: 'Zero/negative cost', data: { building: 'B', nodes: [{id:'r',label:'r',type:'room',x:0,y:0},{id:'e',label:'e',type:'exit',x:1,y:1}], edges: [{id:'e1',from:'r',to:'e',cost:0}], initial_state:{} } }
  ];

  let allRejected = true;
  for (const c of invalidCases) {
    const val = validateBuildingJSON(c.data);
    if (val.valid) {
      console.log(`  Failed to reject invalid case: ${c.name}`);
      allRejected = false;
    }
  }
  console.log(`Malformed JSON rejection tests: ${allRejected ? 'ALL PASSED' : 'FAILED'}`);
  if (!allRejected) process.exit(1);
}

console.log('\n>>> ALL ALGORITHM & VALIDATION SPEC TESTS PASSED PERFECTLY! <<<');
