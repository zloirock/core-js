// A `typeof` test over a global the build serves always passes, so the `&&` it gates folds to its right.
typeof Map !== "undefined" && new Map();
