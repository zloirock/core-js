import _Set from "@core-js/pure/actual/set/constructor";
// `declare const Set: ...` is a TS-ONLY ambient declaration - the binding exists at
// compile time but tsc elides it; at runtime `Set` IS the global. raw `scope.getBinding`
// returns the declare binding either way, so without an isAmbientBindingShape filter the
// shadow check classifies Set as user-shadowed and isGlobalProxy / resolveGlobalName /
// resolveAliasedGlobalName all bail. polyfill emission for `new Set()` then collapses
// to the un-polyfilled identifier, which fails on old engines without the global
declare const Set: {
  new <T>(): {
    size: number;
    has(v: T): boolean;
  };
};
const s = new _Set<number>();
s.has(1);