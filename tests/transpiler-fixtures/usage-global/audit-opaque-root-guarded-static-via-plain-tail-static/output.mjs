import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// a PLAIN (non-optional) ponyfillable tail hop collapses with the branch - only the optional
// window hop is a source of undefined
const pt = () => globalThis;
export const viaPlainTailStatic = pt()?.window?.self.Array.of(22).at(0);