import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// Rooting the proxy-hop collapse THROUGH a chain-assignment proves the ROOT is a proxy global - it says
// nothing about what the assignment STORED. when the assigned value navigates a hop core-js does not
// ponyfill (`globalThis.window`, unlike `globalThis.self`), the two part ways: the collapse would read off
// the always-defined pure root while the target keeps a raw `_globalThis.window`, undefined off-browser.
// every rendering of that split is wrong - keep the raw value and the target contradicts the read it came
// from; bind the target to the root and the user's variable reports a global the source never gave it. so
// the collapse declines the whole span and both emitters render the source shape, where target and read
// agree because neither moved. guarded, the `?.` then stays live and short-circuits; unguarded, the read
// throws exactly where the source did.
// the gate keys on the assigned VALUE, not on the hop name: the same `?.` over the same hop reached
// WITHOUT a chain-assign still collapses - there the guarded value IS the proxy root. the ponyfilled twin
// (`(q = globalThis.self)?.X`, its own fixture) collapses too. distinct methods per line.
let w;
export const guardedWindowValue = null == (_ref = w = _globalThis.window) ? void 0 : _includesMaybeArray(_ref.Array.prototype).call([1, 2], 2);

let n;
export const unguardedWindowValue = _flatMaybeArray((n = _globalThis.window).Array.prototype).call([1, [2]]);

export const guardedWindowHop = _atMaybeArray(_globalThis.Array.prototype).call([9], 0);

// the DESTRUCTURE-source shape of the same kept root: the text emitter reconstructs the receiver by
// splicing source rather than cloning nodes, so it has its own way to render a root - it must swap the
// kept value's own raw root and nothing else, or the assignment leaks an unpolyfilled `globalThis`
let d;
(d = _globalThis.window).Array;
export const ofKeptRoot = _Array$of;

// the well-known-symbol strand reaches the same receiver through its OWN collapse: it too must keep the
// assignment as the receiver rather than read the symbol off the pure root, which would silently discard
// the object the source named and answer for ours instead
let s;
export const iterOfKeptRoot = _getIteratorMethod((s = _globalThis.window));

// an ALIAS-rooted kept assignment under an instance CALL. the text emitter's alias-hop drive queues its
// collapse as an inner span expecting the claim to re-emit the receiver verbatim - but a kept root is
// rendered BY the claim, so there is no verbatim text to compose into and the transform queue used to
// throw here (a build break). the drive stands down; the claim's own rendering is what drops the hop.
// the alias must survive as the root, so a plain `(t = g).self.X` alias value still needs that drive
const g = _globalThis;
let t;
export const aliasKeptRoot = _findLastMaybeArray((t = g.window).Array.prototype).call([1, 2], x => x < 2);

// a STATIC terminal reached through the same kept root. the static rewrite ERASES its receiver navigation,
// which would take the live guard with it and run the static where the source short-circuits - so it stands
// down here. the resolvable twin still substitutes: there the guard is dead, so erasing it costs nothing
let sw;
export const staticOffKeptRoot = (sw = _globalThis.window)?.Array.from?.(['a']);

let sr;
export const staticOffPonyfilledRoot = (sr = _self, _Array$of)('b');

// several `?.` down the same kept root. the text emitter rebuilds the surviving hops over the collapsed
// binding and forces the connector sitting DIRECTLY on it non-optional - sound for a substituted root,
// which is always defined, but a kept root is not: that connector is live and must be re-emitted
let ng;
export const nestedGuardsOffKeptRoot = (ng = _globalThis.window)?.Array?.prototype.some?.call([1], x => x);

// a kept root re-emits itself, so it must not ALSO be harvested as an effect (the assignment would run
// twice) - but only it is exempt. an effect the sequence around it carries is not the assignment and must
// still ride ahead, in source order
let sc = 0;
let sq;
export const seAroundKeptRoot = null == (_ref2 = (sc++, sq = _globalThis.window)) ? void 0 : _findIndexMaybeArray(_ref2.Array.prototype).call([1], x => x);
export { sc };