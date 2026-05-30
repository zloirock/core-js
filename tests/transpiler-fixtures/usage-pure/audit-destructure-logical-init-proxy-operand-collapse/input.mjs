// destructure off a `||` init whose left operand is a proxy-global member chain and whose
// retained sibling (`other`) keeps the whole init in the output. each operand must be
// polyfilled in place so neither side ReferenceErrors on old engines: the proxy chain
// keeps its substituted root (`_globalThis.Array`) and the bare global becomes its pure import
const { from, other } = globalThis.Array || Set;
from([1]);
console.log(other);
