import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
// multi-declarator destructure where one declarator is orphaned (unused): the orphan
// must not trigger a stray polyfill emission.
const from = _Array$from;
const x = _Promise;