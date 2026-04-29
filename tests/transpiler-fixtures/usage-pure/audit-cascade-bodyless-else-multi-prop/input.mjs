// alternate slot of an if (the else branch with no braces). symmetric to consequent-
// slot wrap: the bodyless detector covers both consequent and alternate, the second
// polyfill must stay inside the gate when else has no block
let from, fromEntries;
if (cond) noop();
else ({ Array: { from }, Object: { fromEntries } } = globalThis);
