// `@babel/plugin-transform-modules-commonjs` runs after the polyfill pass and rewrites OUR
// injected import along with the rest of the body, so the output is uniform CommonJS and
// nothing is owed - the late-CJS diagnostic asks about our own surviving nodes, and a rewrite
// that reached all of them leaves none.
[1, 2, 3].at(0);
