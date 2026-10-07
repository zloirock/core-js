// WhileStatement.body slot: the SE must execute on EACH iteration, not once before the loop. the
// slot keeps the SE and the polyfilled assignment as one sequence in the loop body; hoisted past the
// loop, the SE would run exactly once.
let from;
while (cond) ({ from } = (sideEffect(), Array));
