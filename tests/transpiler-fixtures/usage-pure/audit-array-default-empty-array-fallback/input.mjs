// array-destructure with default value: `a` falls back to a string fallback, the
// subsequent instance call is rewritten via the pure-mode generic instance polyfill.
const [a = 'fallback'] = [];
a.at(0);
