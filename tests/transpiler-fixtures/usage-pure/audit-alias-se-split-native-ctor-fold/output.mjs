import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
var _ref;
// a native-constructor alias written through an UNCONDITIONAL sequence-expression statement
// (`(0, ({ Array: A } = globalThis))`) is trusted, so its static member read folds. babel splits
// the sequence in place (`0; ({ Array: A } = globalThis);`), which detaches the write's original
// SequenceExpression - re-anchoring the constantViolation to its fresh statement path keeps the
// placement walk on the live tree, matching the estree side which never mutates in place
let A;
0;
({
  Array: A
} = _globalThis);
export const viaSeArray = _Array$from([1, 2, 3]);
let O;
0;
({
  Object: O
} = _globalThis);
export const viaSeObject = _Object$fromEntries([['k', 1]]);

// the same split-and-re-anchor holds a member chain on the result together
let A2;
0;
({
  Array: A2
} = _globalThis);
export const viaSeChain = _at(_ref = _Array$from([4, 5])).call(_ref, -1);

// refused flow-trust: a sequence write nested in a CONDITIONAL block only runs on the taken
// path, and a nested-function write is likewise not unconditional in the binding scope - the
// re-anchored placement walk refuses the static narrow and the read takes the runtime
// constructor GUARD instead (polyfill on the taken path, the untaken path still reads the
// native undefined and throws exactly like untranspiled code)
let A3;
if (Math.random() > 2) {
  0;
  ({
    Array: A3
  } = _globalThis);
}
export const viaSeConditional = (A3 === Array ? _Array$from : A3.from.bind(A3))([6]);
let A4;
function assign() {
  0;
  ({
    Array: A4
  } = _globalThis);
}
assign();
export const viaSeNestedFn = (A4 === Array ? _Array$from : A4.from.bind(A4))([7]);