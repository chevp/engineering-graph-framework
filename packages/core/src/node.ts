import { z } from 'zod';
import { LifecycleState } from './lifecycle.js';

export const NodeId = z.string().regex(/^[a-z0-9-]+$/);
export type NodeId = z.infer<typeof NodeId>;

export const NodeVersion = z.number().int().nonnegative();
export type NodeVersion = z.infer<typeof NodeVersion>;

export const PlanNodeKind = z.enum([
  'assumption',
  'hypothesis',
  'measurement',
  'decision',
  'specification',
  'risk',
  'observation',
]);
export type PlanNodeKind = z.infer<typeof PlanNodeKind>;

export const SuccessCriterion = z.object({
  description: z.string().min(1),
  predicate: z.string().optional(),
});
export type SuccessCriterion = z.infer<typeof SuccessCriterion>;

export const CapabilityNeed = z.object({
  capability: z.string(),
  constraints: z.record(z.unknown()).optional(),
});
export type CapabilityNeed = z.infer<typeof CapabilityNeed>;

export const PlanNode = z.object({
  id: NodeId,
  version: NodeVersion,
  predecessorVersion: NodeVersion.optional(),
  kind: PlanNodeKind,
  title: z.string().min(1),
  body: z.string(),
  state: LifecycleState,
  successCriterion: SuccessCriterion.optional(),
  needs: z.array(CapabilityNeed).default([]),
  visibility: z.enum(['private', 'team', 'public']).default('private'),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
});
export type PlanNode = z.infer<typeof PlanNode>;

export const SemVer = z.string().regex(/^\d+\.\d+\.\d+(-[\w.-]+)?$/);
export type SemVer = z.infer<typeof SemVer>;

export const AgentNode = z.object({
  id: NodeId,
  version: SemVer,
  name: z.string(),
  provides: z.array(z.string()).min(1),
  inputSchema: z.unknown().optional(),
  outputSchema: z.unknown().optional(),
  mcpManifest: z.string().url().optional(),
});
export type AgentNode = z.infer<typeof AgentNode>;
