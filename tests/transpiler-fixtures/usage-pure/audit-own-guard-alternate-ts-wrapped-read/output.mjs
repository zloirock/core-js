import _globalThis from "@core-js/pure/actual/global-this";
// the shadow-alias guard keeps a raw read in its alternate, and a source already carrying that
// render - a library published pre-polyfilled against @core-js/pure - may wear a type-only wrapper
// around the kept read. the census reaches the read THROUGH the wrapper and stands the claim down,
// so nothing nests - claimed again, the guard would gain a level per pass. the eighth row is the
// negative that pins WHERE the climb runs: its wrapper sits BELOW the read, off the climb entirely,
// and the render still stands - a census that peeled downward would nest there alone.
// the receiver has to stay opaque, so the guarded name is one core-js never replaces (`Array`,
// `Object`, `String`): a replaceable name folds the destructure to its own minted binding and there
// is no raw read left to keep. such a name also owns no constructor module, so the render a pass
// leaves behind tests against the BARE global rather than an imported binding
import _Array$of from '@core-js/pure/actual/array/of';
let h;
if (_globalThis) ({
  Array: h
} = _globalThis);
export const bare = h === Array ? _Array$of : h.of;
export const viaCast = h === Array ? _Array$of : h.of as any;
export const viaNonNull = h === Array ? _Array$of : h.of!;
export const viaAssertion = h === Array ? _Array$of : <any> h.of;
export const viaSatisfies = h === Array ? _Array$of : h.of satisfies any;
export const viaInstantiation = h === Array ? _Array$of : h.of<any>;
export const viaWrappedComposition = h === Array ? _Array$of : (h.of as any).bind(h);
export const belowTheRead = h === Array ? _Array$of : (h as any).of;
// ... and what the stand-down really turns on is the TEST, not the member: on the alternate arm the
// receiver is provably not the global the consequent was minted for, so a claim there would polyfill
// a value that global's polyfill has nothing to do with - another member under the SAME test is off
// limits for the same reason the kept read is. a test against ANOTHER global settles nothing, and
// the alternate keeps its claim there
export const foreignMember = h === Array ? _Array$of : h.from;
export const foreignGuardName = h === Object ? _Array$of : h === Array ? _Array$of : h.of;