import _Map from "@core-js/pure/actual/map/constructor";
// A `typeof` test over a global the build serves always passes, so the `&&` it gates folds to its right.
new _Map();