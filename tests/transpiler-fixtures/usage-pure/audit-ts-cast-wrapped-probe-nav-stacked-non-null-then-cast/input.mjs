// a TS cast layer sits BETWEEN the probe nav and its tail. the cast is type-only: the guard
// renders exactly as in the bare spelling, the collapse still fires, and the cast layer rides
// the rendered value (it erases downstream)
globalThis.tsBox = { n: 4, inner: { n: 5 }, list: ['ab', 'cd'] };
// layers STACK: a non-null inside a cast leaves TWO closers between the leaf and the tail, and the
// rebalance owes one step per layer. dropping only the last one left a stray closer in the guard
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const stackedNonNullThenCast = ((globalThis.window?.self.tsBox!) as any).arr?.at(0);
