import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.self";
// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
globalThis.chainBox = {
  n: 4,
  list: ['ab', 'cd']
};
export const chained = (globalThis.window?.self.chainBox.list, globalThis.window?.self.chainBox.list)?.at(0).includes('a');

// the same repetition WITHOUT the chained consumer: the receiver text stays in the single
// transform, which is the negative that pins the chaining as the discriminator
export const single = (globalThis.window?.self.chainBox.list, globalThis.window?.self.chainBox.list)?.at(0);
export const triple = (globalThis.window?.self.chainBox.list, globalThis.window?.self.chainBox.list, globalThis.window?.self.chainBox.list)?.at(0);
export const mixedKeys = (globalThis.window?.self.chainBox.n, globalThis.window?.self.chainBox.list)?.at(0);

// DEPTH: every added consumer nests one more composition level, and the ordinal that places each
// nav is recomputed at each. five levels and a four-deep ARGUMENT nesting keep that arithmetic
// pinned where a single level would not
export const deepChain = (globalThis.window?.self.chainBox.list, globalThis.window?.self.chainBox.list)?.at(0)?.slice(1).slice(1).slice(1).includes('a');
export const deepNest = globalThis.window?.self.chainBox.list?.at(0)?.slice(globalThis.window?.self.chainBox.list?.at(1)?.slice(globalThis.window?.self.chainBox.list?.at(0)?.length ?? 0).length ?? 0).includes('a');

// TWO polyfilled dispatches in one guarded chain under a consumer that parenthesizes the guard: the
// wrap would otherwise reach over the OUTER dispatch's own step, ending both spans at the chain tip -
// and one range cannot hold two full replacements. the `??` is the discriminator; without it the
// spans differ on their own
export const twoDispatchesUnderNullish = globalThis.window?.self.chainBox.list?.at(1)?.slice(0).length ?? 0;
export const twoDispatchesPlain = globalThis.window?.self.chainBox.list?.at(1)?.slice(0).length;
export const twoDispatchesOperand = 1 + (globalThis.window?.self.chainBox.list?.at(1)?.slice(0).length ?? 0);

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.chainBox.list ? 0 : 1)?.includes('a');