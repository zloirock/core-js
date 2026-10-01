import _Array$from from "@core-js/pure/actual/array/from";
// a regex inside a template `${...}` interpolation: its quote must NOT open a phantom string
// region over the following code. without regex tracking in the interpolation body the `'` spans
// to EOF, mis-reading the previous significant token and injecting a spurious leading `;` before
// the rewritten `(a = Array).from(...)` chain-assignment
let a;
let s = `${/'/}`;
(a = Array, _Array$from)([1]);