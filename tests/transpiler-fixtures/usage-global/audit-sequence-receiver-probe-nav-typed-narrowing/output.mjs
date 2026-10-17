import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.self";
// a SEQUENCE evaluates to its last element, so a probe nav sitting there is the receiver's value
// and owes the guard render. by the time the nav's own rewrite runs, the chain ROOT is already
// substituted - the rewrite must still claim the nav under the renamed head rather than skip
// it as a phantom, which is what keeps the ponyfillable hop off a native read here
globalThis.seqBox = {
  list: ['ab', 'cd'],
  n: 7
};
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.seqBox.list ? 0 : 1)?.includes('a');