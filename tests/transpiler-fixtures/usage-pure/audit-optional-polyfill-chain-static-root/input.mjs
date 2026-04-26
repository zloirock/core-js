// optional chain whose root is a polyfillable static call: the chain guard must wrap
// the rewrite of the static call correctly.
Array.from([[1]])?.at(0).at(0).at(0);
