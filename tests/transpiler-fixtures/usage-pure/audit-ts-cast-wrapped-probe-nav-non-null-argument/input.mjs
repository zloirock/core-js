// a TS cast layer sits BETWEEN the probe nav and its tail. the cast is type-only: the guard
// renders exactly as in the bare spelling, the collapse still fires, and the cast layer rides
// the rendered value (it erases downstream)
globalThis.tsBox = { n: 4, inner: { n: 5 }, list: ['ab', 'cd'] };
// a TS layer on the claim sitting in a call ARGUMENT: the guard belongs in the argument, never over
// the call the source wrote. the erased operator's side of that guard is where the emitters part -
// `!` and a cast both vanish at emit, so the two spellings compile to the same JS
export const nonNullArgument = Array.of(globalThis.window?.self.tsBox.n!);
