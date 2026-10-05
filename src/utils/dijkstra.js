/**
 * Shortest Path calculation using Dijkstra's algorithm with strict competition tie-breaking.
 *
 * Rules:
 * - Graph edges are UNDIRECTED.
 * - Route cost = sum of edge costs (positive integers). Visual x/y coordinates are NOT used for cost.
 * - Exclude:
 *   - blocked nodes
 *   - every corridor incident to a blocked node
 *   - blocked edges
 *   - closed exits
 *
 * EXACT TIE-BREAKING:
 * 1. If multiple reachable exits have the same minimum cost:
 *    choose the lexicographically smallest EXIT ID.
 * 2. If multiple equal-cost paths exist to that selected exit:
 *    choose the lexicographically smallest sequence of NODE IDs.
 *
 * Edge Cases:
 * - Selected starting location is blocked -> status: "START_BLOCKED"
 * - No reachable open exit -> status: "NO_ROUTE"
 * - Successful route found -> status: "SUCCESS"
 */

/**
 * Compare two node ID sequences lexicographically
 */
export function comparePaths(pathA, pathB) {
  const len = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < len; i++) {
    if (pathA[i] < pathB[i]) return -1;
    if (pathA[i] > pathB[i]) return 1;
  }
  return pathA.length - pathB.length;
}

/**
 * Compare two IDs lexicographically
 */
export function compareIds(idA, idB) {
  if (idA < idB) return -1;
  if (idA > idB) return 1;
  return 0;
}

/**
 * Calculates the shortest evacuation route
 *
 * @param {object} params
 * @param {Array} params.nodes - Array of node objects
 * @param {Array} params.edges - Array of edge objects
 * @param {string} params.startNodeId - ID of start location
 * @param {Set<string>|Array<string>} params.blockedNodes - Set or array of blocked node IDs
 * @param {Set<string>|Array<string>} params.blockedEdges - Set or array of blocked edge IDs
 * @param {Set<string>|Array<string>} params.closedExits - Set or array of closed exit IDs
 *
 * @returns {object} Result object with status, path, totalCost, destinationExit, corridorsCount, edgeIds
 */
export function findShortestEvacuationRoute({
  nodes,
  edges,
  startNodeId,
  blockedNodes = new Set(),
  blockedEdges = new Set(),
  closedExits = new Set()
}) {
  const blockedNodeSet = blockedNodes instanceof Set ? blockedNodes : new Set(blockedNodes);
  const blockedEdgeSet = blockedEdges instanceof Set ? blockedEdges : new Set(blockedEdges);
  const closedExitSet = closedExits instanceof Set ? closedExits : new Set(closedExits);

  if (!startNodeId) {
    return {
      status: 'NO_START',
      message: 'No starting location selected',
      path: [],
      edgeIds: [],
      destinationExit: null,
      totalCost: 0,
      corridorsCount: 0
    };
  }

  // Check if start node is blocked
  if (blockedNodeSet.has(startNodeId)) {
    return {
      status: 'START_BLOCKED',
      message: 'Starting location blocked',
      path: [],
      edgeIds: [],
      destinationExit: null,
      totalCost: 0,
      corridorsCount: 0
    };
  }

  // Build adjacency list for active unblocked elements
  // Note: An edge is usable iff:
  // - The edge itself is not blocked
  // - Neither incident node is blocked
  const adj = new Map();
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  // Also map pair (u, v) to edge ID for route visualization
  const edgeLookup = new Map();

  for (const edge of edges) {
    // If edge is blocked or either endpoint is blocked, skip
    if (blockedEdgeSet.has(edge.id)) continue;
    if (blockedNodeSet.has(edge.from) || blockedNodeSet.has(edge.to)) continue;

    const u = edge.from;
    const v = edge.to;
    const cost = edge.cost;

    adj.get(u).push({ neighbor: v, cost, edgeId: edge.id });
    adj.get(v).push({ neighbor: u, cost, edgeId: edge.id });

    const key1 = `${u}___${v}`;
    const key2 = `${v}___${u}`;
    edgeLookup.set(key1, edge.id);
    edgeLookup.set(key2, edge.id);
  }

  // Dijkstra's Algorithm
  // Priority: (cost, path)
  const dist = new Map();
  const bestPath = new Map();

  for (const node of nodes) {
    dist.set(node.id, Infinity);
  }

  dist.set(startNodeId, 0);
  bestPath.set(startNodeId, [startNodeId]);

  // Priority queue represented as sorted array (N <= 60, extremely fast and predictable)
  const queue = [{ node: startNodeId, cost: 0, path: [startNodeId] }];

  while (queue.length > 0) {
    // Sort queue by cost asc, then path lexicographically asc
    queue.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return comparePaths(a.path, b.path);
    });

    const current = queue.shift();
    const u = current.node;
    const uCost = current.cost;
    const uPath = current.path;

    // If we popped a sub-optimal entry, skip
    if (uCost > dist.get(u)) continue;
    if (uCost === dist.get(u) && comparePaths(uPath, bestPath.get(u)) > 0) continue;

    const neighbors = adj.get(u) || [];
    for (const { neighbor: v, cost } of neighbors) {
      // If neighbor is a closed exit, it cannot be traversed or reached
      if (closedExitSet.has(v)) {
        continue;
      }

      const newCost = uCost + cost;
      const candidatePath = [...uPath, v];

      const currentDistV = dist.get(v);
      const currentPathV = bestPath.get(v);

      if (newCost < currentDistV) {
        dist.set(v, newCost);
        bestPath.set(v, candidatePath);
        queue.push({ node: v, cost: newCost, path: candidatePath });
      } else if (newCost === currentDistV) {
        // Equal cost: tie-break by lexicographically smallest node ID sequence
        if (!currentPathV || comparePaths(candidatePath, currentPathV) < 0) {
          bestPath.set(v, candidatePath);
          queue.push({ node: v, cost: newCost, path: candidatePath });
        }
      }
    }
  }

  // Find all reachable OPEN exits
  const openExits = nodes.filter(
    node =>
      node.type === 'exit' &&
      !closedExitSet.has(node.id) &&
      !blockedNodeSet.has(node.id) &&
      dist.get(node.id) !== undefined &&
      dist.get(node.id) !== Infinity
  );

  if (openExits.length === 0) {
    return {
      status: 'NO_ROUTE',
      message: 'No route available',
      path: [],
      edgeIds: [],
      destinationExit: null,
      totalCost: 0,
      corridorsCount: 0
    };
  }

  // Find minimum cost among reachable open exits
  let minCost = Infinity;
  for (const exit of openExits) {
    const cost = dist.get(exit.id);
    if (cost < minCost) {
      minCost = cost;
    }
  }

  // Filter exits that achieve the minimum cost
  const minCostExits = openExits.filter(exit => dist.get(exit.id) === minCost);

  // Tie-break rule 1: Lexicographically smallest EXIT ID
  minCostExits.sort((a, b) => compareIds(a.id, b.id));
  const chosenExit = minCostExits[0];

  const optimalPath = bestPath.get(chosenExit.id) || [];

  // Determine edge IDs traversed
  const pathEdgeIds = [];
  for (let i = 0; i < optimalPath.length - 1; i++) {
    const u = optimalPath[i];
    const v = optimalPath[i + 1];
    const edgeId = edgeLookup.get(`${u}___${v}`);
    if (edgeId) {
      pathEdgeIds.push(edgeId);
    }
  }

  return {
    status: 'SUCCESS',
    message: 'Safe route found',
    path: optimalPath,
    edgeIds: pathEdgeIds,
    destinationExit: chosenExit.id,
    totalCost: minCost,
    corridorsCount: Math.max(0, optimalPath.length - 1)
  };
}
