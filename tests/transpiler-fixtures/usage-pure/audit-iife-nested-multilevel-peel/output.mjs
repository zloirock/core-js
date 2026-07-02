import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// nested IIFE shells: `(() => (() => Receiver)())()`. receiver peeling must loop, so
// multi-level peel proceeds: outer IIFE returns inner CallExpression, next iteration peels
// that inner IIFE to its body return Identifier.
// distinct methods on each line trace which leaf receiver was reached.
const a = _Array$from([1]);
const b = (() => _Set)().prototype.intersection;
const c = _Array$of(1, 2);
export { a, b, c };