// `({from} = Array)!;` - TSNonNullExpression wrapper. `!` is a compile-time non-null
// assertion, runtime-erased. shared peeler walks through it to find the ExpressionStatement
// host so the destructure rewrite fires
let from: any;
({ from } = Array)!;
console.log(from);
