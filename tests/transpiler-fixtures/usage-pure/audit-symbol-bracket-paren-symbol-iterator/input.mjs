// extra parens around the computed key `Symbol[(Symbol.iterator)]` must not change the
// resolution: it still folds to `Symbol.iterator`, so the `in` check routes to
// get-iterator-method, not the doubly-prefixed `Symbol.Symbol.iterator`
const x = Symbol[(Symbol.iterator)] in obj;
export { x };
