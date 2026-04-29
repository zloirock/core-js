import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `class C` + sibling `interface C extends Parent { ... }` - TS declaration merging:
// instance members from the interface (and its extends chain) are reachable on C.
// Class-like type-member lookup includes sibling interfaces and their extends chain
// with type-arg substitution, so `c.items` (a property access, not a call) resolves
// to the inherited `items: number[]`
interface Parent { items: number[] }
class C {}
interface C extends Parent {}
declare const c: C;
_atMaybeArray(_ref = c.items).call(_ref, 0);