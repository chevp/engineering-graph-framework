import { z } from 'zod';
import { NodeId } from './node.js';

const EdgeEndpoint = z.object({
  id: NodeId,
});

const EdgeBase = z.object({
  from: EdgeEndpoint,
  to: EdgeEndpoint,
  createdAt: z.string().datetime(),
  createdBy: z.string(),
});

export const Edge = z.discriminatedUnion('type', [
  EdgeBase.extend({ type: z.literal('depends_on') }),
  EdgeBase.extend({ type: z.literal('refines') }),
  EdgeBase.extend({ type: z.literal('supersedes'), reason: z.string() }),
  EdgeBase.extend({ type: z.literal('contradicts'), resolved: z.boolean().default(false) }),
  EdgeBase.extend({ type: z.literal('related_to') }),
  EdgeBase.extend({ type: z.literal('produced_by') }),
  EdgeBase.extend({
    type: z.literal('evidence_for'),
    strength: z.number().min(0).max(1).optional(),
  }),
  EdgeBase.extend({
    type: z.literal('evidence_against'),
    strength: z.number().min(0).max(1).optional(),
  }),
]);
export type Edge = z.infer<typeof Edge>;

export type EdgeType = Edge['type'];
