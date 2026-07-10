// a function-valued object DATA prop is reassignable like any data prop: an observed
// write to the slot invalidates the init function's call/return narrowing (the runtime
// value may be a foreign-family function - ie:11 throw on its string return)
const written = { fn: () => [1, 2] };
written.fn = () => 'string';
export const viaWritten = written.fn().at(0);

// a write-free slot keeps the call/return narrow
const untouched = { fn: () => [3, 4] };
export const viaUntouched = untouched.fn().includes(3);
