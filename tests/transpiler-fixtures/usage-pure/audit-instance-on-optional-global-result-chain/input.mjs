// instance call chained on an optional-call polyfilled-global result: both sites get
// their own pure-mode polyfill aliases, with the optional gate preserved.
Array?.from(x).at(0);
