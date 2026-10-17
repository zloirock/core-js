import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// a LATER `var _ref;` hoist (minted by the guarded default below) must not displace the
// lifted statements queued ABOVE - the drain re-anchors, keeping each lift under its `let`
const plainRecv = getObj();
const guarded = (_ref = _getIteratorMethod(plainRecv)) === void 0 ? null : _ref;
guarded;