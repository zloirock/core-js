// `export import g = require('.../global-this')` hosts the global through an EXPORTED TS
// import-equals - an ExportNamedDeclaration wrapper on babel@8 / oxc, an `isExport` flag on
// babel@7. the require receiver must still be recognised so a slot write through it deopts the
// patched static; otherwise the pure substitution would ignore the user's patch and dispatch the
// un-patched core-js static at runtime. an untouched builtin keeps its substitution (deopt is per-name).
export import g = require('@core-js/pure/actual/global-this');
g.Map = class PatchedMap extends Map {};
export const patched = Map.groupBy([1], x => x);
export const control = Array.from('ab');
