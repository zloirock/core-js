import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref;
// Chain-assignment receiver `(a = X).method(...)` must keep the assignment as an observable side effect
// even when dispatch drops or gates the receiver. three shapes: static-drop (`(a = Array).from` keeps
// `a = Array` then swaps to the import), gated-instance (`(b = Map).keys` - keys is gated off the Map
// constructor, yet the `b = Map` assignment survives via the sequence), and plain-literal instance-memoize.
const r = (a = Array, _Array$from)([1]);
const s = (b = _Map, _Map).keys();
const t = _includesMaybeArray(_ref = [1, 2, 3]).call(_ref, 2);
[r, s, t];