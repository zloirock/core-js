// a CHAINED consumer above the dispatch makes the outer emission re-spell the receiver, so the nav
// inside it is rendered by the hop-collapse channel rather than by the receiver render. the two
// spellings are equivalent - the guarded value is nullish on exactly the same branch, and both
// dereference it plainly afterwards - so the emitters differ in SHAPE here and the sidecar records
// which one each produces
globalThis.chainLayerBox = { n: 4, list: ['ab', 'cd'] };
export const chained = (globalThis.window?.self.chainLayerBox).list?.at(0).includes('a');
export const chainedTwice = (globalThis.window?.self.chainLayerBox).list?.at(0).includes('a').includes('a');

// the same layer WITHOUT a chained consumer keeps both emitters on the receiver render, which folds
// the plain hop into the alternate - the negative that pins the chaining as the discriminator
export const unchained = (globalThis.window?.self.chainLayerBox).list?.at(0);
export const unchainedPlain = (globalThis.window?.self.chainLayerBox).list.at(0);
export const unchainedCarrier = (globalThis.window?.self.chainLayerBox).list?.at(0) ?? [];

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.chainLayerBox.list ? 0 : 1)?.includes('a');
