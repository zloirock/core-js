// type-only re-exports `export type { ... } from 'm'` and `export type * from 'm'` carry
// `exportKind: 'type'` on `ExportNamedDeclaration`/`ExportAllDeclaration`. they participate
// in TC39 module-record fetch like value re-exports, so should join the import header
// for `var _ref;` placement. distinct methods so per-line polyfill dispatch is visible
import { foo } from './lib-foo.mjs';
export type { Bar } from './types-bar.mjs';
export type * from './types-baz.mjs';
declare function getArr(): unknown[];
const a = getArr().at(0);
const b = getArr().flat();
