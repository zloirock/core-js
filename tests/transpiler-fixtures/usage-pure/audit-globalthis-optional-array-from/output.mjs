import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `globalThis?.Array.from(...)` proxy access via optional chain: the static method
// is recognised as `Array.from` and rewritten to the pure-mode polyfill.
_Array$from([1]);
_Object$keys("abc");
_Promise$resolve(1);