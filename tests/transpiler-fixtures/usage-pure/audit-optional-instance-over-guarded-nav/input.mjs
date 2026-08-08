// an OPTIONAL instance dispatch memoizes its receiver, and when that receiver IS the guarded nav
// the memo must hold the RENDERED text. taking the raw source there left the whole nav
// unrewritten - a bare `globalThis` (ReferenceError on the oldest target) and a native `self`
// where the ponyfill belongs, while the guard around the probe vanished entirely
globalThis.navBox = { list: ['ab', 'cd'], str: 'a-a', nested: { list: [5, [6]] } };
export const flatOptional = globalThis.window?.self.navBox.list?.at(0);
export const atOptional = globalThis.window?.self.navBox.list?.at(0);
const nr = () => globalThis;
export const callRootOptional = nr().window?.self.navBox.list?.at(0);
export const hopOptional = globalThis.window?.self.navBox?.list?.at(0);
export const deepOptional = globalThis.window?.self.navBox.nested.list?.at(0);

// the NON-optional dispatch memoizes the probe instead and stitches its tail off the ref - the
// negative that pins which receiver the memo actually holds
export const flatPlain = globalThis.window?.self.navBox.list.at(0);
export const replacePlain = globalThis.window?.self.navBox.str.replaceAll('a', 'z');

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.navBox.list ? 0 : 1)?.includes('a');
