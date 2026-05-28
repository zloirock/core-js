// SequenceExpression-prefix receiver wrapping a chain-assignment:
// `(prefix(), (a = Array)).from(x)`. Both the SE prefix (`prefix()`) and the
// chain-assign (`a = Array`) carry side effects that must be preserved
let a;
function prefix() { return 1; }
(prefix(), (a = Array)).from([1, 2, 3]);
