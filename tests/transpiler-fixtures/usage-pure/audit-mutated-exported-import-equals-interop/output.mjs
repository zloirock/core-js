import _Array$from from "@core-js/pure/actual/array/from";
// `export import _id = require('.../interopRequireDefault')` hosts the CJS-interop helper through an
// EXPORTED TS import-equals (an ExportNamedDeclaration wrapper on babel@8 / oxc, an `isExport` flag on
// babel@7). the interop-wrapped global-proxy `_id(require('.../global-this')).default` must still be
// recognised so a slot write through it deopts the patched static; otherwise the pure substitution
// would dispatch the un-patched core-js static at runtime. an untouched builtin keeps its substitution.
export import _id = require('@babel/runtime/helpers/interopRequireDefault');
_id(require('@core-js/pure/actual/global-this')).default.Map = class PatchedMap extends Map {};
export const patched = Map.groupBy([1], x => x);
export const control = _Array$from('ab');