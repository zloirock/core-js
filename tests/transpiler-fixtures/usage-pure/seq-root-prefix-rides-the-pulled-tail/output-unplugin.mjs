// a nav whose ROOT is a sequence and whose prefix hop is a PROBE renders as a guard, and the tail
// above the collapse is pulled inside the alternate. that pull replaces a span holding the root's
// sequence prefix while the test respells the probe, so the prefix owes itself a slot in the landing
// - the plan's shape name says which render runs, never whether the root ran something on the way in.
// the prefix rides ONCE: a sequence sitting under the probe hop is already re-emitted inside the
// rendered test, and the last row is that form. the controls are a terminal nav (nothing is pulled),
// a dead prefix, and a nav with no sequence at all. each row exports the counter it bumps.
// the legs part on SPELLING here and only where the root is a sequence: this one folds the probe's
// pristine hop onto its ponyfill (`_self.Array`) while the other memoizes the probe and reads the
// hop off that ref (`_ref.Array`) - `window.self === window`, so the two name one object and each
// runs the prefix exactly once. the sidecar holds that second spelling
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

var _ref, _ref2, _ref3, _ref4, _ref5;
let c = 0;

function a() {}

export const instanceTail = null == (_ref = (c++, _globalThis.window)) ? void 0 : _nameMaybeFunction(_ref.Array);
export const plainTail = (c++, null == _globalThis.window ? void 0 : _self.foo);
export const nestedSequence = null == (_ref2 = (a(), (c++, _globalThis.window))) ? void 0 : _nameMaybeFunction(_ref2.Array);

// ... and the prefix already standing INSIDE the probe hop, which must not be re-emitted beside it
export const prefixUnderTheProbe = null == (_ref3 = (c++, _globalThis).window) ? void 0 : _nameMaybeFunction(_ref3.Array);

// controls
export const terminalNav = (c++, null == _globalThis.window ? void 0 : _self);

export const deadPrefix = null == (_ref4 = (0, _globalThis.window)) ? void 0 : _nameMaybeFunction(_ref4.Array);
export const noSequence = null == (_ref5 = _globalThis.window) ? void 0 : _nameMaybeFunction(_ref5.Array);
export { c };