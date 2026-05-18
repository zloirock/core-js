import _Array$from from "@core-js/pure/actual/array/from";
// `({from} = Array) satisfies any;` - TSSatisfiesExpression wrapper. `satisfies` is a
// compile-time constraint check (TS 4.9+), runtime-erased like `as`. shared peeler
// must walk through it the same way TSAsExpression / TSNonNullExpression are walked
let from: any;
from = _Array$from;
console.log(from);