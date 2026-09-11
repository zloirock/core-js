// decorated class with a class-field initialised by a polyfilled built-in call: the
// initializer is scanned and rewritten in pure-mode.
@decorator class C { items = new Set([1, 2, 3]); }
