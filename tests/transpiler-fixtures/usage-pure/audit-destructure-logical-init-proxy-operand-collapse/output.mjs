import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
const from = _Array$from;
// destructure off a `||` init whose left operand is a proxy-global member chain and whose
// retained sibling (`other`) keeps the whole init in the output. each operand must be
// polyfilled in place so neither side ReferenceErrors on old engines: the proxy chain
// keeps its substituted root (`_globalThis.Array`) and the bare global becomes its pure import
const {
  other
} = _globalThis.Array || _Set;
from([1]);
console.log(other);