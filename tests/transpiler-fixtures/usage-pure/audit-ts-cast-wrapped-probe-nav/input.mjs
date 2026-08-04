// a TS cast layer sits BETWEEN the probe nav and its tail. the render replaces the nav span, which
// starts after the cast's opening paren, while the sliced tail still carries its closing one - the
// slice is unbalanced on its own and only holds where the surrounding source closes it. every
// consumer that reuses it (a memo body, a composition needle) inherits that, so the render stands
// down here and the raw source keeps its own shape
globalThis.tsBox = { n: 4, inner: { n: 5 }, list: ['ab', 'cd'] };
export const castThenMemberDispatch = (globalThis.window?.self.tsBox as any).list?.at(0);
export const castThenMemberPlain = (globalThis.window?.self.tsBox as any).list;
export const doubleCastDispatch = ((globalThis.window?.self.tsBox as any).list as any[])?.at(0);

// a cast around the TAIL instead of the nav leaves the nav span whole, so the render applies
export const castOnTail = (globalThis.window?.self.tsBox.list as any[])?.at(0);
export const castOnValue = globalThis.window?.self.tsBox.n as number;
export const nonNullOnValue = globalThis.window?.self.tsBox.n!;

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.tsBox.list ? 0 : 1)?.includes('a');

// layers STACK: a non-null inside a cast leaves TWO closers between the leaf and the tail, and the
// rebalance owes one step per layer. dropping only the last one left a stray closer in the guard
export const stackedNonNullThenCast = ((globalThis.window?.self.tsBox!) as any).arr?.at(0);
export const stackedCastThenNonNull = (((globalThis.window?.self.tsBox as any))!).arr?.at(0);
export const bareNonNullLayer = (globalThis.window?.self.tsBox!).arr?.at(0);
export const doubleParenLayer = ((globalThis.window?.self.tsBox)).arr?.at(0);
