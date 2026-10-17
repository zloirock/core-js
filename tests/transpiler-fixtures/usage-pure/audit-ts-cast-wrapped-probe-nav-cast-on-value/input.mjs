// a TS cast layer sits BETWEEN the probe nav and its tail. the cast is type-only: the guard
// renders exactly as in the bare spelling, the collapse still fires, and the cast layer rides
// the rendered value (it erases downstream)
globalThis.tsBox = { n: 4, inner: { n: 5 }, list: ['ab', 'cd'] };
export const castOnValue = globalThis.window?.self.tsBox.n as number;
