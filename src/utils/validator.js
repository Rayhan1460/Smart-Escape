/**
 * Validates the uploaded building JSON according to the strict competition specs.
 *
 * Rules:
 * - building: non-empty string
 * - nodes: array of 2 to 60 nodes
 *   - id: unique non-empty string (case-sensitive)
 *   - label: non-empty string
 *   - type: strictly "room" | "junction" | "exit"
 *   - x: finite number
 *   - y: finite number
 *   - at least one room or junction
 *   - at least one exit
 * - edges: array of 1 to 150 edges
 *   - id: unique non-empty string (case-sensitive)
 *   - from: valid existing node id
 *   - to: valid existing node id
 *   - from !== to (no self-loops)
 *   - cost: positive integer (cost > 0)
 *   - no repeated node pairs (undirected: (A,B) === (B,A))
 * - initial_state:
 *   - blocked_nodes: array of valid node IDs
 *   - blocked_edges: array of valid edge IDs
 *   - closed_exits: array of valid exit node IDs
 * - Disconnected graphs are valid.
 *
 * @param {any} data - Parsed JSON object
 * @returns {{ valid: boolean, error?: string, sanitizedData?: object }}
 */
export function validateBuildingJSON(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      error: 'JSON must be a valid root object containing "building", "nodes", "edges", and "initial_state".'
    };
  }

  // 1. Building Name
  if (typeof data.building !== 'string' || data.building.trim().length === 0) {
    return {
      valid: false,
      error: 'Invalid "building": Must be a non-empty string specifying the building name.'
    };
  }

  // 2. Nodes Array
  if (!Array.isArray(data.nodes)) {
    return {
      valid: false,
      error: 'Invalid "nodes": Must be an array of node objects.'
    };
  }

  if (data.nodes.length < 2 || data.nodes.length > 60) {
    return {
      valid: false,
      error: `Invalid nodes count (${data.nodes.length}): Must contain between 2 and 60 nodes.`
    };
  }

  const nodeIds = new Set();
  let roomOrJunctionCount = 0;
  let exitCount = 0;
  const nodeMap = new Map();

  for (let i = 0; i < data.nodes.length; i++) {
    const node = data.nodes[i];
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      return {
        valid: false,
        error: `Node at index ${i} is not a valid object.`
      };
    }

    if (typeof node.id !== 'string' || node.id.trim().length === 0) {
      return {
        valid: false,
        error: `Node at index ${i} has an invalid "id". ID must be a non-empty string.`
      };
    }

    if (nodeIds.has(node.id)) {
      return {
        valid: false,
        error: `Duplicate node ID "${node.id}" detected. All node IDs must be unique.`
      };
    }
    nodeIds.add(node.id);

    if (typeof node.label !== 'string' || node.label.trim().length === 0) {
      return {
        valid: false,
        error: `Node "${node.id}" has an invalid "label". Label must be a non-empty string.`
      };
    }

    const validTypes = ['room', 'junction', 'exit'];
    if (!validTypes.includes(node.type)) {
      return {
        valid: false,
        error: `Node "${node.id}" has invalid type "${node.type}". Must be "room", "junction", or "exit".`
      };
    }

    if (typeof node.x !== 'number' || !Number.isFinite(node.x)) {
      return {
        valid: false,
        error: `Node "${node.id}" has invalid x-coordinate. Must be a finite number.`
      };
    }

    if (typeof node.y !== 'number' || !Number.isFinite(node.y)) {
      return {
        valid: false,
        error: `Node "${node.id}" has invalid y-coordinate. Must be a finite number.`
      };
    }

    if (node.type === 'room' || node.type === 'junction') {
      roomOrJunctionCount++;
    } else if (node.type === 'exit') {
      exitCount++;
    }

    nodeMap.set(node.id, node);
  }

  if (roomOrJunctionCount === 0) {
    return {
      valid: false,
      error: 'Building must contain at least one node of type "room" or "junction".'
    };
  }

  if (exitCount === 0) {
    return {
      valid: false,
      error: 'Building must contain at least one node of type "exit".'
    };
  }

  // 3. Edges Array
  if (!Array.isArray(data.edges)) {
    return {
      valid: false,
      error: 'Invalid "edges": Must be an array of edge objects.'
    };
  }

  if (data.edges.length < 1 || data.edges.length > 150) {
    return {
      valid: false,
      error: `Invalid edges count (${data.edges.length}): Must contain between 1 and 150 edges.`
    };
  }

  const edgeIds = new Set();
  const pairSet = new Set();

  for (let i = 0; i < data.edges.length; i++) {
    const edge = data.edges[i];
    if (!edge || typeof edge !== 'object' || Array.isArray(edge)) {
      return {
        valid: false,
        error: `Edge at index ${i} is not a valid object.`
      };
    }

    if (typeof edge.id !== 'string' || edge.id.trim().length === 0) {
      return {
        valid: false,
        error: `Edge at index ${i} has an invalid "id". ID must be a non-empty string.`
      };
    }

    if (edgeIds.has(edge.id)) {
      return {
        valid: false,
        error: `Duplicate edge ID "${edge.id}" detected. All edge IDs must be unique.`
      };
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.from)) {
      return {
        valid: false,
        error: `Edge "${edge.id}" references non-existent "from" node ID "${edge.from}".`
      };
    }

    if (!nodeIds.has(edge.to)) {
      return {
        valid: false,
        error: `Edge "${edge.id}" references non-existent "to" node ID "${edge.to}".`
      };
    }

    if (edge.from === edge.to) {
      return {
        valid: false,
        error: `Edge "${edge.id}" is a self-loop ("${edge.from}" to "${edge.to}"). Self-loops are not permitted.`
      };
    }

    if (
      typeof edge.cost !== 'number' ||
      !Number.isInteger(edge.cost) ||
      edge.cost <= 0
    ) {
      return {
        valid: false,
        error: `Edge "${edge.id}" has invalid cost (${edge.cost}). Cost must be a positive integer (> 0).`
      };
    }

    // Check repeated node pairs (undirected)
    const pairKey = edge.from < edge.to ? `${edge.from}___${edge.to}` : `${edge.to}___${edge.from}`;
    if (pairSet.has(pairKey)) {
      return {
        valid: false,
        error: `Duplicate undirected edge detected between "${edge.from}" and "${edge.to}". Repeated node pairs are not permitted.`
      };
    }
    pairSet.add(pairKey);
  }

  // 4. Initial State Validation
  const initialState = data.initial_state || {};
  if (typeof initialState !== 'object' || Array.isArray(initialState)) {
    return {
      valid: false,
      error: 'Invalid "initial_state": Must be an object.'
    };
  }

  const blockedNodes = Array.isArray(initialState.blocked_nodes) ? initialState.blocked_nodes : [];
  for (const bNode of blockedNodes) {
    if (!nodeIds.has(bNode)) {
      return {
        valid: false,
        error: `initial_state.blocked_nodes references unknown node ID "${bNode}".`
      };
    }
  }

  const blockedEdges = Array.isArray(initialState.blocked_edges) ? initialState.blocked_edges : [];
  for (const bEdge of blockedEdges) {
    if (!edgeIds.has(bEdge)) {
      return {
        valid: false,
        error: `initial_state.blocked_edges references unknown edge ID "${bEdge}".`
      };
    }
  }

  const closedExits = Array.isArray(initialState.closed_exits) ? initialState.closed_exits : [];
  for (const cExit of closedExits) {
    if (!nodeIds.has(cExit)) {
      return {
        valid: false,
        error: `initial_state.closed_exits references unknown node ID "${cExit}".`
      };
    }
    const node = nodeMap.get(cExit);
    if (node.type !== 'exit') {
      return {
        valid: false,
        error: `initial_state.closed_exits includes "${cExit}" which is a "${node.type}", not an "exit".`
      };
    }
  }

  // Sanitized, validated copy
  const sanitized = {
    building: data.building.trim(),
    nodes: data.nodes.map(n => ({
      id: n.id,
      label: n.label,
      type: n.type,
      x: n.x,
      y: n.y
    })),
    edges: data.edges.map(e => ({
      id: e.id,
      from: e.from,
      to: e.to,
      cost: e.cost
    })),
    initial_state: {
      blocked_nodes: [...new Set(blockedNodes)],
      blocked_edges: [...new Set(blockedEdges)],
      closed_exits: [...new Set(closedExits)]
    }
  };

  return {
    valid: true,
    sanitizedData: sanitized
  };
}
