// a native-constructor alias written through an UNCONDITIONAL sequence-expression statement
// (`(0, ({ Array: A } = globalThis))`) is trusted, so its static member read folds. babel splits
// the sequence in place (`0; ({ Array: A } = globalThis);`), which detaches the write's original
// SequenceExpression - re-anchoring the constantViolation to its fresh statement path keeps the
// placement walk on the live tree, matching the estree side which never mutates in place
let A;
(0, ({ Array: A } = globalThis));
export const viaSeArray = A.from([1, 2, 3]);

let O;
(0, ({ Object: O } = globalThis));
export const viaSeObject = O.fromEntries([['k', 1]]);

// the same split-and-re-anchor holds a member chain on the result together
let A2;
(0, ({ Array: A2 } = globalThis));
export const viaSeChain = A2.from([4, 5]).at(-1);

// refused flow-trust: a sequence write nested in a CONDITIONAL block only runs on the taken
// path, and a nested-function write is likewise not unconditional in the binding scope - the
// re-anchored placement walk refuses the static narrow and the read takes the runtime
// constructor GUARD instead (polyfill on the taken path, the untaken path still reads the
// native undefined and throws exactly like untranspiled code)
let A3;
if (Math.random() > 2) { (0, ({ Array: A3 } = globalThis)); }
export const viaSeConditional = A3.from([6]);

let A4;
function assign() { (0, ({ Array: A4 } = globalThis)); }
assign();
export const viaSeNestedFn = A4.from([7]);
