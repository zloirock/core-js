import _Array$from from "@core-js/pure/actual/array/from";
// Multi-element ArrayPattern wrapping a nested proxy-global static (`[{ Array: { from } }, other]
// = [globalThis, {...}]`): `from` is extracted as `const from = _Array$from` while the sibling
// `other`, the consumed key (renamed `_unused`) and the init array survive. polyfill always wins -
// dropping the whole declarator would lose `other`, so the residual destructure is kept in place
const [{
  Array: {
    from
  }
}, other] = [{
  Array: {
    from: _Array$from
  }
}, {
  foo: 1
}];
from('hi');
other.foo;