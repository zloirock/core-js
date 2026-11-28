// Both emitters guard window, then read .list outside the optional chain.
// A missing window must still throw on that read, including under a chained consumer.
globalThis.chainLayerBox = { n: 4, list: ['ab', 'cd'] };
export const chained = (globalThis.window?.self.chainLayerBox).list?.at(0).includes('a');
export const chainedTwice = (globalThis.window?.self.chainLayerBox).list?.at(0).includes('a').includes('a');

// The same guard and plain read also apply without a chained consumer.
export const unchained = (globalThis.window?.self.chainLayerBox).list?.at(0);
export const unchainedPlain = (globalThis.window?.self.chainLayerBox).list.at(0);
export const unchainedCarrier = (globalThis.window?.self.chainLayerBox).list?.at(0) ?? [];

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.chainLayerBox.list ? 0 : 1)?.includes('a');
