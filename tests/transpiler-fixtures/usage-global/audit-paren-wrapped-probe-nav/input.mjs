// a paren layer sits BETWEEN the probe nav and its tail. the guard's own parens ARE that layer's
// once the render absorbs it, so every step above reads off the guarded value from OUTSIDE them:
// none of it may be folded in, and the tail keeps the source's PLAIN dereference - which throws
// where the guard answers nullish, exactly as the source does
globalThis.parenBox = { list: ['ab', 'cd'], n: 7 };
export const parenNavDispatch = (globalThis.window?.self.parenBox).list?.at(0);
export const parenNavPlain = (globalThis.window?.self.parenBox).list;
export const parenNavDeep = (globalThis.window?.self.parenBox.list).length;
export const parenNavOptionalTail = (globalThis.window?.self.parenBox)?.list;

// the parens around the WHOLE chain leave nothing between the nav and its tail, so the fold
// applies there as it always did - the negative that pins the absorbed layer as the discriminator
export const parenWholeChain = (globalThis.window?.self.parenBox.list?.at(0));
export const parenLeafOnly = (globalThis.window?.self).parenBox.n;

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.parenBox.list ? 0 : 1)?.includes('a');

// the CONSUMER above the absorbed layer decides whether the fold owes it parens, so the slots that
// delimit an expression and the slots that swallow one are both asked here
export const layerTypeof = typeof (globalThis.window?.self.parenBox).list;
export const layerCarrier = (globalThis.window?.self.parenBox)?.list ?? ['fallback'];
export const layerSpread = [...((globalThis.window?.self.parenBox)?.list ?? [])];
export const layerOperand = 1 + ((globalThis.window?.self.parenBox)?.list?.length ?? 0);
export const layerTernaryTest = (globalThis.window?.self.parenBox)?.list ? 'y' : 'n';
