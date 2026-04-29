// decorated class with a class-field `items = new Set([1, 2, 3])`: the initializer
// expression is still scanned and `new Set(...)` is polyfilled.
@decorator class C { items = new Set([1, 2, 3]); }
