// arrow expr-body + destructure-default + rest sibling: synth-swap and body-extract
// both bail (no block to host the extract), so the inline-default path swaps the user
// default expression directly (`= []` -> `= _Array$from`) without nesting the wrapper
const f = ({ from = [], ...rest } = Array) => [from, rest];
f();
