import _Map from "@core-js/pure/actual/map/constructor";
import _Number$isNaN from "@core-js/pure/actual/number/is-nan";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// Passing a constructor to a known builtin does not request all of its static methods.
// Static aliases and builtin instances follow the same boundary; each constructor stays narrow.
_Object$is(Array, Array);
const keys = _Object$keys;
keys(_Map);
_Number$isNaN(_Set);
const values = new _Set();
values.has(_Promise);