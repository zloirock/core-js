import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// the receiver of an INSTANCE dispatch is memoized, and the memo is where the nav's collapse has to
// land: every row below reads (or deletes) a member off a proxy nav whose value the guard tests. the
// two legs anchor that guard by their own walks, so the rows fix WHICH `?.` owns the test
let w,
  n = 0;

// a KEPT chain-assign forces the probe read to stay (the user's variable must get what the source
// stored). the hop above it is read PLAIN, so its evaluation THROWS off-window - the guard may not
// slide down onto the probe value, which would answer `void 0` where the source throws
export const keptAssignPlainHop = null == (_ref = (w = _globalThis.window).Array) ? void 0 : _nameMaybeFunction(_flatMaybeArray(_ref.prototype));
export const keptAssignDelete = delete (null == (_ref2 = (w = _globalThis.window).Array) ? void 0 : _flatMaybeArray(_ref2.prototype).name);

// no probe at all: every hop resolves, so the whole nav collapses onto the root ponyfill and the
// memo holds the collapsed receiver
export const resolvingNav = null == (_ref3 = _globalThis.Array) ? void 0 : _nameMaybeFunction(_flatMaybeArray(_ref3.prototype));

// a DEEP probe (`window` below a resolvable `self`): the nav collapses onto the hop's ponyfill and
// keeps the probe read plus its live `?.` - the memo is that value, not the raw source
export const deepProbeNav = null == (_ref4 = _globalThis.Array) ? void 0 : _flatMaybeArray(_ref4.prototype);

// the delete consumer collapses the navigation whole, through a SEQUENCE root and through the
// guard scaffold this emit builds for the memo itself
export const seqDelete = delete (n++, _globalThis).Array?.prototype;
export const seqDeleteComputedKey = delete (n++, _globalThis).Array?.[n++, 'of'];
export const loweredScaffoldDelete = delete (null == (_ref5 = _globalThis.Array) ? void 0 : _flatMaybeArray(_ref5.prototype).name);
export { w, n };

// the deleted member sits ABOVE an instance dispatch, so the members below it keep their claims and
// the collapse stops there. taking the whole span instead swallowed the dispatch (the queue aborts
// with no slot for its rewrite), and the receiver render handed its lifted `?.` into the helper
// argument, where it is a dangling token the bundler cannot parse
_globalThis.box = {
  list: [[1]]
};
export const deleteAboveDispatch = delete _at(_globalThis.box.list).name;
export const deleteAboveDispatchProbe = delete (null == (_ref6 = _globalThis.window) ? void 0 : _at(_ref6.box.list).name);
export const deleteAboveDispatchPlainTail = delete (null == (_ref7 = _globalThis.window) ? void 0 : _at(_ref7.box.list).customUserKey);