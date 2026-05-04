import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// type-only re-exports `export type { ... } from 'm'` and `export type * from 'm'` carry
// `exportKind: 'type'` on `ExportNamedDeclaration`/`ExportAllDeclaration`. they participate
// in TC39 module-record fetch like value re-exports, so should join the import header
// for `var _ref;` placement. distinct methods so per-line polyfill dispatch is visible
import { foo } from './lib-foo.mjs';
export type { Bar } from './types-bar.mjs';
export type * from './types-baz.mjs';
var _ref, _ref2;
declare function getArr(): unknown[];
const a = _atMaybeArray(_ref = getArr()).call(_ref, 0);
const b = _flatMaybeArray(_ref2 = getArr()).call(_ref2);