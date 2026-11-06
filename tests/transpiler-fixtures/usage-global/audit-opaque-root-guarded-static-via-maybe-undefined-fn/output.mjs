import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// NEGATIVE: a MAYBE-undefined callee (conditional assignment) is not provable - the chain
// keeps the raw guarded read off the ref
let mf;
if (globalThis.setTimeout) mf = () => globalThis;
export const viaMaybeUndefinedFn = mf?.()?.window?.self?.Array.of(17).at(0);