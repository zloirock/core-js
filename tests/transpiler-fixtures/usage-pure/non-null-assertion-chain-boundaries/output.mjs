import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// Reprinting beside a polyfill preserves optional-chain boundaries under postfix assertions.
// Required calls and member reads outside a sealed chain still throw on a nullish root.
// An open chain and an optional continuation keep short-circuiting.
declare const root: any;
root?.fn!();
(root?.fn)!();
(root?.fn!)!();
(root?.fn)!.value;
(root?.fn)!?.();
_flatMaybeArray(_ref = [1, [2]]).call(_ref);