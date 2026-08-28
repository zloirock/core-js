import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// for-of head with nested-proxy destructure init: parent is ForOfStatement, declaration
// is VariableDeclaration but its init slot stores the iterable directly. The flatten path
// reaches a single VariableDeclarator that will be removed, yet the parent is a
// ForOfStatement, NOT a ForStatement - the for-init SE-sink special case must not fire here.
// the receiver mirror answers instead: what the head destructures is an ELEMENT of the iterated
// literal, and the polyfill is swapped into that element in place.
// for-of header destructures each iteration value; distinct keys (from / of) probe per-prop dispatch.
for (const {
  Array: {
    from
  }
} of [{
  Array: {
    from: _Array$from
  }
}]) from([1]).length;
for (const {
  Array: {
    of
  }
} of [{
  Array: {
    of: _Array$of
  }
}]) of(7, 8).length;