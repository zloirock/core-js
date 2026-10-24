// a TS cast layer sits BETWEEN the probe nav and its tail. the cast is type-only: the guard
// renders exactly as in the bare spelling, the collapse still fires, and the cast layer rides
// the rendered value (it erases downstream)
globalThis.tsBox = { n: 4, inner: { n: 5 }, list: ['ab', 'cd'] };
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const nonNullArgumentNested = Array.of(Array.of(globalThis.window?.self.tsBox.inner.n!));
