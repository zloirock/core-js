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