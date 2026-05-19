import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// narrow-by-assignment with a generic alias whose union nests another alias:
// `type Inner<T> = ... | ...; type Outer<T> = Inner<T> | null`. the
// assignment `w = { kind: 'a', data: ['x'] }` should narrow w via the literal
// `kind:'a'` to the `{kind:'a', data:T[]}` branch of the FLATTENED inner
// union, AND carry T=string substitution through so `.data` resolves to
// `string[]` and `.at(0)` picks the array-specific polyfill. without
// `flattenUnionBranches`, Inner<string> stays opaque to the literal filter
// and narrowing degrades; without applying the accumulated `subst`, the
// surviving branch's `T[]` stays unresolved and `.at` falls back to generic
type Inner<T> = { kind: 'a'; data: T[] } | { kind: 'b'; data: T };
type Outer<T> = Inner<T> | null;
declare const init: Outer<string>;
let w: Outer<string> = init;
w = { kind: 'a', data: ['x'] };
_atMaybeArray(_ref = w!.data).call(_ref, 0);