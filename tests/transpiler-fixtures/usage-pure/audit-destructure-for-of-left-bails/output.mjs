import _Array$from from "@core-js/pure/actual/array/from";
// for-of's left slot holds the VariableDeclaration that introduces the iteration binding, so the
// flatten's own render - a `const from = _Array$from;` STATEMENT - has nowhere to stand in the HEAD.
// what the head destructures is an ELEMENT of the iterated literal, and that is where the receiver
// mirror puts the polyfill: the element is swapped in place, so the pattern reads its own value
for (const {
  Array: {
    from
  }
} of [{
  Array: {
    from: _Array$from
  }
}]) {
  from([1]);
}