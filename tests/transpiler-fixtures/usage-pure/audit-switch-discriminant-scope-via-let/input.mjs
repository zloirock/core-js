// The switch's lexical scope is the CaseBlock (the braces around the cases): a case-body lexical binding must not shadow the
// DISCRIMINANT (evaluated in the enclosing scope before the case environment exists) nor a use AFTER the switch - both still
// substitute.
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
