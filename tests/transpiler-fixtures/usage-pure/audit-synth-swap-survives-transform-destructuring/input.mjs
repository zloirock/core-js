// regression: e2e bundle ran our plugin BEFORE `@babel/plugin-transform-destructuring`,
// which replaces the `{from}` ObjectPattern param with a `_ref` Identifier and lifts
// `var from = _ref.from` into the body. an overly strict `objectPatternPath.node !==
// objectPatternNode` orphan check used to bail at programExit, dropping the synth-swap
// and leaving bare `Array` as the IIFE arg - which throws `Object expected` on IE 11.
// fix: bail only when the param is replaced with a non-Identifier non-ObjectPattern shape
const r = (({ from }) => from([1, 2, 3]))(Array);
export { r };
