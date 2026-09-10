// a DIRECT `eval` runs its argument in the caller's own scope chain and can assign every binding
// that chain reaches - in a module and under strict mode as much as in a script, where only its
// DECLARATIONS are confined - so a read it outruns bails to the generic dispatch. the negative pins
// the boundary positionally: the construct is recorded at its own node, so a read it cannot outrun
// keeps its narrow
let early = [1, 2];
early.includes(1);
let late = [1, 2];
eval("late = 'ab'");
late.at(0);
