// `({from} = Array) satisfies any;` - TSSatisfiesExpression wrapper. `satisfies` is a
// compile-time constraint check (TS 4.9+), runtime-erased like `as`. shared peeler
// must walk through it the same way TSAsExpression / TSNonNullExpression are walked
let from: any;
({ from } = Array) satisfies any;
console.log(from);
