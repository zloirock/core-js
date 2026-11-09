import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A pattern still owes the read through an alias under nested stores.
const held = _globalThis.window;
let first, second;
const of = ((first = second = held).self, _Array$of);
of(1);