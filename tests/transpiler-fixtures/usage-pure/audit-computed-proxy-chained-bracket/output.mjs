import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// computed bracket access on a proxy global `globalThis['Array'].from(...)`: the
// static member is recognised as `Array.from` and rewritten in pure-mode.
_Array$from([1]);
_Object$keys("abc");