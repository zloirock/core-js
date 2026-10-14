import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.with";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a claim read optionally off an optional call to a method the build does not serve memoizes that
// call as written: every `?.` it carries, a live link below it included, short-circuits inside the memo
// and the claim reads the result. a callee the build serves is a lookup of its own and takes its own
// test in the chain instead
const box = globalThis.box;
export const liveLinkBelow = box?.list.pick?.()?.at(0);
export const optionalCallee = box?.pick?.()?.includes(1);
export const callLinkBelow = box.list.flat?.().pick?.()?.findLast(Boolean);
// NEGATIVE: a served callee is a lookup of its own
export const servedCallee = box?.list.toSorted?.()?.with(0, 1);