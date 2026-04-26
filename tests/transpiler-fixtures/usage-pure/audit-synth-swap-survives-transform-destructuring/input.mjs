// when babel's destructuring transform runs after this plugin, the `{from}` parameter
// pattern is rewritten into an Identifier with body-level `var from = _ref.from`. the
// IIFE arg `Array` must still be substituted with the polyfilled receiver - otherwise
// the legacy runtime sees a bare native `Array` and the destructure throws
const r = (({ from }) => from([1, 2, 3]))(Array);
export { r };
