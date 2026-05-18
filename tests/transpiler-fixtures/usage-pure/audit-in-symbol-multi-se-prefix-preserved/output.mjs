import _isIterable from "@core-js/pure/actual/is-iterable";
// multiple SE-bearing elements in the computed-key SequenceExpression prefix. the walker
// harvests EVERY leading expression (`a()`, `b()`) - not just the first - and prepends
// them in walk order before the rewrite. covers ordering / completeness of the visit loop
declare const a: () => void;
declare const b: () => void;
const r = (a(), b(), _isIterable({}));