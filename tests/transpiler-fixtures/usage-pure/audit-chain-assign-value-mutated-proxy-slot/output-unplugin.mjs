import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a mutated proxy SLOT turns the kept-value collapse off: the file stores its own value into
// `globalThis.self`, so a chain-assign value navigating that hop no longer holds the global -
// collapsing it to the leaf ponyfill would swap the user's object for the polyfilled one. the
// root still substitutes (it is not what was patched), the hops stay as written, and no claim
// fires off the unknowable value
_globalThis.self = { Map: { name: 'patched' } };
let q;
export const patchedLeaf = _nameMaybeFunction((q = _globalThis.self).Map);
export const patchedTail = _nameMaybeFunction((q = _globalThis.self.window).Map);

// the dig through wrappers must not outrun the gate: a sequence around the assignment and a
// live guard over it read the same patched slot, so neither collapses either
const arr = [1];
export const patchedSeqAround = _nameMaybeFunction(((_atMaybeArray(arr).call(arr, 0), q = _globalThis.self)).Map);
export const patchedGuarded = null == (_ref = q = _globalThis.self) ? void 0 : _nameMaybeFunction(_ref.Map);

// the stored-value render (an unread target, the claim declined by the target matrix) also
// declines on the patched slot: what the assignment stores is the user's object
export const patchedStoredLeaf = (q = _globalThis.self)?.Object.getPrototypeOf({});
export const patchedStoredBelow = (q = _globalThis.self.window)?.Object.getPrototypeOf({});