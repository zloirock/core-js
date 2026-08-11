import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// the collapse erases an alias hop and re-hangs its optional connector onto what follows. only a
// dot, a computed key or a call continues a chain there.
// a MEMBER read past a wrapper that closes right after the erased hop is deliberately absent: that
// read observes the sealed value and must throw on a nullish root, and both emitters currently let
// it run. the fuzzer row that pins the divergence lives in the differential corpus - a baseline
// here would record the missing throw as the answer

// a CALL past the seal takes the full connector - the source short-circuits the call away on a
// nullish root, so dropping it would call an undefined value instead
let called;
export const callPastSeal = ((called = globalThis.window)?.self)(1);

// UNSEALED controls - the chain does continue, and the connector is re-hung on each shape
let dotted;
export const dottedContinuation = (dotted = globalThis.window)?.self.Array.of(1).at(0);
let computed;
export const computedContinuation = (computed = globalThis.window)?.self["Array"].of(2).at(0);