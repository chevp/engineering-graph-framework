import type { PlanNode } from './node.js';
import type { Edge, EdgeType } from './edge.js';

export type EdgeQuery = (filter: { to: string; type: EdgeType }) => Edge[];

export type GateResult = { ok: true } | { ok: false; reason: string };

export function canPassG1(node: PlanNode): GateResult {
  if (node.state !== 'context') return { ok: false, reason: 'not in context' };
  if (!node.successCriterion?.description)
    return { ok: false, reason: 'success criterion missing' };
  return { ok: true };
}

export function canPassG2(node: PlanNode, edges: EdgeQuery): GateResult {
  if (node.state !== 'exploration') return { ok: false, reason: 'not in exploration' };
  if (edges({ to: node.id, type: 'evidence_for' }).length === 0)
    return { ok: false, reason: 'no evidence_for edge' };
  const open = edges({ to: node.id, type: 'contradicts' }).filter(
    (e) => e.type === 'contradicts' && !e.resolved,
  );
  if (open.length > 0) return { ok: false, reason: 'unresolved contradicts edge' };
  return { ok: true };
}

export function canPassG3(node: PlanNode, edges: EdgeQuery): GateResult {
  if (node.state !== 'production') return { ok: false, reason: 'not in production' };
  if (edges({ to: node.id, type: 'supersedes' }).length === 0)
    return { ok: false, reason: 'no successor with supersedes edge' };
  return { ok: true };
}

export function applyGate(
  current: PlanNode,
  next: 'exploration' | 'production' | 'superseded' | 'invalidated',
): PlanNode {
  return {
    ...current,
    version: current.version + 1,
    predecessorVersion: current.version,
    state: next,
    createdAt: new Date().toISOString(),
  };
}
