// the switch's lexical scope is the CaseBlock (the braces around the cases): a case-body
// lexical binding must not shadow the DISCRIMINANT (evaluated in the enclosing scope before
// the case environment exists) nor a use AFTER the switch - both still substitute. inside the
// cases the shadow governs (one shared block scope across all cases per spec). a strict-mode
// case-body function declaration is block-scoped and behaves like the `let`.
function viaLet(kind) {
  switch (globalThis.mode) {
    case 1:
      let globalThis = kind;
      return globalThis;
    default:
      return 0;
  }
}
export { viaLet };
function viaConst(kind) {
  switch (Map.groupBy) {
    case 1:
      const Map = kind;
      return Map;
    default:
      return 0;
  }
}
export { viaConst };
function afterSwitch(x) {
  switch (x) {
    case 1:
      let Symbol = x;
      return Symbol;
  }
  return [][Symbol.iterator];
}
export { afterSwitch };
function viaFn(x) {
  switch (x) {
    case 1:
      function WeakSet() {}
      return WeakSet;
  }
  return new WeakSet([]);
}
export { viaFn };
