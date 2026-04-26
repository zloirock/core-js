import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `transform-modules-commonjs` runs after our plugin and rewrites `export` → CJS. polyfill
// for `.flat()` must remain working: the plugin emits ESM-style `import _flatMaybeArray
// from "..."` which the sibling rewrites to `var _flatMaybeArray = require("...")`. inner
// instance-call output `_flatMaybeArray(_ref).call(_ref)` survives unchanged
import { items } from './data';
export const flat = _flatMaybeArray(items).call(items);