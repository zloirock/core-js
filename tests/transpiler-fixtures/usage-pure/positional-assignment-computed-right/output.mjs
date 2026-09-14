import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// An assignment host whose right side the overwrite channel cannot spell - a call, a member chain
// the plugin itself rewrote - still hands its array slots to the positional route: the slot binds a
// minted name and the claim is written right after the statement, in slot order, on both legs.
// The slot's type is the element type the index spelling reads: a call returning a typed array
// dispatches the typed helper, a `map` result (its element type unknown) the generic dispatcher.
const rows = [[1, 2], [3, 4]];
const nested = [[[1, 2]], [[3, 4]]];
const f = () => rows;
const g = () => nested;
let a1, b1, a2, b2, a3, b3, a4;
[_ref, _ref2] = f();
a1 = _atMaybeArray(_ref);
b1 = _atMaybeArray(_ref2);
[[_ref3], [_ref4]] = g();
a2 = _atMaybeArray(_ref3);
b2 = _atMaybeArray(_ref4);
[_ref5, _ref6] = _mapMaybeArray(rows).call(rows, x => x);
a3 = _at(_ref5);
b3 = _at(_ref6);
[[_ref7]] = _mapMaybeArray(nested).call(nested, x => x);
a4 = _at(_ref7);
export { a1, b1, a2, b2, a3, b3, a4 };