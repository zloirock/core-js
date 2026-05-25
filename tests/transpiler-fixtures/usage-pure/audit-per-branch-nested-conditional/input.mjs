// nested ConditionalExpression branches: outer slots are nested ternaries; per-branch
// synth-swap should recurse into inner branches so all leaf Identifiers get synth-swapped
// to their own polyfill object. without recursion, viable-branch check rejects the
// inner ConditionalExpression at the outer level and the whole synth-swap bails
const { from: a } = cond ? (cond ? Array : Iterator) : (cond ? Iterator : Array);
a([1]);
