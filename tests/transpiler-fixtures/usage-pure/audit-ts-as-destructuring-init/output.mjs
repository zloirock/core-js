import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// destructuring with TS-cast init `const { x } = obj as any`: the cast peels away
// and the destructure receivers route through the polyfill rewrites normally.
const from = _Array$from;
const resolve = _Promise$resolve;