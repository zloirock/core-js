import _AggregateError from "@core-js/pure/actual/aggregate-error";
import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Promise from "@core-js/pure/actual/promise";
// a detect spelled through a realm hop or off a static reads the slot before its write lands: core-js wins
// it on the first pass, the fallback after it dead, as for the bare spelling. usage-pure only: the global
// flavor rewrites no read
window.Promise = _Promise;
_globalThis.AggregateError = _AggregateError;
Array.from = _Array$from;
if (_globalThis) _globalThis.Iterator = _Iterator;