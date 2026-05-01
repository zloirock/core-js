// SequenceExpression in callee position: `(0, fn)(arg)` IIFE form. Inner peelIifeCallee
// detects safe-SE-free SequenceExpression and unwraps to tail. Both parsers must agree
// after peel chain SE -> ArrowFunction
const a = (0, ({ from }) => from(1))(Array);
const b = ((0, ({ of }) => of(3))) (Array);
