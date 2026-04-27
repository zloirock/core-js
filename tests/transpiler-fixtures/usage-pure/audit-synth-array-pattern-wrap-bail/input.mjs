// synth-swap on ArrayPattern wrapping ObjectPattern: `function f([{from}] = [Array])`.
// outer ArrayPattern with ObjectPattern element - synth-swap targets the outer array
// receiver, but synth-swap requires bare ObjectPattern as the destructure target (not
// nested inside ArrayPattern). plugin emits as-is - covers nested-pattern-bail invariant
function f([{ from }] = [Array]) { return from; }
f();
