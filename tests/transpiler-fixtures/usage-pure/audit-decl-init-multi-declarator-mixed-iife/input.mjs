// multi-declarator VariableDeclaration where ONE declarator has IIFE-bodied SE init with
// an inner instance polyfill, the OTHER has a plain init. the SE-init declarator's polyfill
// emit must absorb inner refs only within its own range, leaving the plain declarator
// untouched. uses `.at` in the IIFE so the inner `_ref` declaration is identifiable;
// second declarator's init is a bare polyfilled static so its emit shape is independent
const { from } = ((function () { return [1].at(0); })(), Array),
  { of } = Array;
from([2]);
of(3);
