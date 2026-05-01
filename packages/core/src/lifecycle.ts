import { z } from 'zod';

export const LifecycleState = z.enum([
  'context',
  'exploration',
  'production',
  'superseded',
  'invalidated',
]);
export type LifecycleState = z.infer<typeof LifecycleState>;

export const Gate = z.enum(['G1', 'G2', 'G3']);
export type Gate = z.infer<typeof Gate>;
