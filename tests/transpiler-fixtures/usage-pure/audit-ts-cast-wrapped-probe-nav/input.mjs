// a TS cast layer sits BETWEEN the probe nav and its tail. the cast is type-only: the guard
// renders exactly as in the bare spelling, the collapse still fires, and the cast layer rides
// the rendered value (it erases downstream)
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

// a TS layer on the claim sitting in a call ARGUMENT: the guard belongs in the argument, never over
// the call the source wrote. the erased operator's side of that guard is where the emitters part -
// `!` and a cast both vanish at emit, so the two spellings compile to the same JS
export const nonNullArgument = Array.of(globalThis.window?.self.tsBox.n!);
export const castArgument = Array.of((globalThis.window?.self.tsBox.list as any[]));
export const nonNullArgumentNested = Array.of(Array.of(globalThis.window?.self.tsBox.inner.n!));

// a cast around the whole nav in CALLEE position seals the chain exactly as parens do, so the call
// applies to what the chain produced and throws on the short-circuited value. read as an unsealed
// callee the call folds into the guarded branch and answers undefined instead - and the climb that
// answers this must check the slot it came up through, or an ARGUMENT reaching the same call
// (below) is mistaken for a paren'd callee and gets a `?.` tail the source never wrote
let held: unknown;
export const castSealedCallee = (globalThis.window?.self as any)(1);
export const castSealedCalleeAssignRoot = ((held = globalThis.window)?.self as any)(1);
export const castSealedCalleeComputed = (globalThis.window?.['self'] as any)(1);
export const castSealedTag = (globalThis.window?.self as any)`x`;

// a SEAL under a TS wrapper: `(nav)!` and `(nav as any)` both parenthesize the nav, and the read
// above them performs the source's own read - it throws off-window. babel hangs the paren on the
// nav NODE (under the wrapper), so a predicate that stops one step short of it reads the seal as
// absent and erases that throw; oxc gives the same shape a ParenthesizedExpression node
export const sealedNonNullRead = (globalThis.window?.self)!.Symbol?.iterator;
export const sealedCastRead = (globalThis.window?.self as any).Symbol?.iterator;
export const sealedNonNullWriteRoot = ((held2 = globalThis).window?.self)!.Symbol?.iterator;
export const sealedNonNullStaticCall = (globalThis.window?.self)!.Array.of(5);
// NEGATIVE: no parens, so the `!` is chain-transparent and the whole chain short-circuits
export const unsealedNonNull = globalThis.window?.self!.Symbol?.iterator;
let held2: unknown;
export { held2 };
