import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// narrow-by-assignment with a generic alias whose union nests another alias: `type Inner<T> =
// ... | ...; type Outer<T> = Inner<T> | null`. the assignment `w = { kind: 'a', data: ['x'] }`
// must narrow via the literal `kind:'a'` to the flattened inner branch AND carry T=string through,
// so `.data` resolves to `string[]` and `.at(0)` picks the array-specific polyfill.
type Inner<T> = { kind: 'a'; data: T[] } | { kind: 'b'; data: T };
type Outer<T> = Inner<T> | null;
declare const init: Outer<string>;
let w: Outer<string> = init;
w = { kind: 'a', data: ['x'] };
_atMaybeArray(_ref = w!.data).call(_ref, 0);