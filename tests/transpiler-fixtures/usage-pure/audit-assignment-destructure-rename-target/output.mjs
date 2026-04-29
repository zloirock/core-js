import _Array$from from "@core-js/pure/actual/array/from";
// AssignmentExpression destructure with renamed key target into a pre-declared `let`.
// plugin recognizes the synth-swap shape: receiver is `Array`, key is `from`, value is
// the user binding. emits a flat `target = _Array$from;` instead of preserving the
// destructure - the rename collapses cleanly because the entire pattern reduces to a
// single polyfilled extraction
let target;
target = _Array$from;
target([1]);