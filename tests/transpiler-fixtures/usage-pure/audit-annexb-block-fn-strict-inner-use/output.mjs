// sloppy Annex-B (B.3.3): the block-level function hoists a var-binding to the enclosing
// SLOPPY script scope. A use nested inside a strict inner function still resolves up to that
// hoisted user binding, so it must NOT be rewritten - hoisting is decided by the strictness of
// the scope that OWNS the block, not the strictness of the use site
{
  function Array() {
    return null;
  }
}
function strictInner() {
  'use strict';

  return Array.from([1]);
}