import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a NESTED same-name binding off a non-Symbol object must NOT fold: the injector's alias info is
// name-keyed (flat), so the inner `iterator` queries the outer Symbol alias's registered source, but
// its own RHS is a plain object - the fold gate confirms the binding's RHS resolves to Symbol, so the
// inner `[...][iterator]` stays a native computed read (`[2][1]` -> undefined), not `_getIteratorMethod`
const iterator = _Symbol$iterator;
function pick() {
  const {
    iterator
  } = {
    iterator: 1
  };
  return [2][iterator];
}
pick();

// the same flat-info collision through a SHADOWED `Symbol` IDENTIFIER: the bare-name arm of
// the fold gate consults the scope - the user binding redirects the read to a plain object,
// so folding would substitute the wrong VALUE (`[4][3]` is undefined, not an iterator)
function pickShadowed() {
  const Symbol = {
    iterator: 3
  };
  const {
    iterator
  } = Symbol;
  return [4][iterator];
}
pickShadowed();

// a MIXED ternary init is not value-sound (the shim branch's value is a plain number): the
// per-branch substitution keeps the Symbol branch polyfilled, but the read must stay native
function pickMixed() {
  const c = Math.random() > 2;
  const {
    iterator
  } = c ? {
    iterator: _Symbol$iterator
  } : {
    iterator: 1
  };
  return ['x', 'y'][iterator];
}
pickMixed();