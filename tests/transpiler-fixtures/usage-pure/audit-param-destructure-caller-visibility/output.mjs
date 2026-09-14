import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed,
// and an inline default fills a leaf the caller deliberately left undefined. That is sound only
// where every call site is visible. The mirror of the INNER DEFAULT is not caller-lossy - the default
// fires exactly where the caller's slot holds `undefined`, and the literal then supplies the ponyfills
// the receiver would have supplied natively - so every host takes it: the two immediately-invoked
// hosts (the call leaves the slot empty - no inline default and no hoisted binding beside the mirror),
// the arrow a closed caller census sees called once with an empty array, and the declared, exported,
// local and method hosts whose callers no census closes (the default alone is mirrored, hosted on
// the parameter's own pattern). The pattern is the same in all seven rows, so the host is the only
// variable; the two invoked rows differ only in body shape, and both take the mirror.
const G = _globalThis;
export const iifeArrow = (([{
  Set,
  Array: {
    from
  }
} = {
  Set: _Set,
  Array: {
    from: _Array$from
  }
}]) => [Set, from])([]);
export const iifeBlockBody = (([{
  Map,
  Array: {
    of
  }
} = {
  Map: _Map,
  Array: {
    of: _Array$of
  }
}]) => {
  return [Map, of];
})([]);
export function exportedDeclaration([{
  WeakSet,
  Array: {
    from
  }
} = {
  WeakSet: _WeakSet,
  Array: {
    from: _Array$from
  }
}]) {
  return [WeakSet, from];
}
function localDeclaration([{
  WeakMap,
  Array: {
    of
  }
} = {
  WeakMap: _WeakMap,
  Array: {
    of: _Array$of
  }
}]) {
  return [WeakMap, of];
}
export const exportedArrow = ([{
  Promise,
  Array: {
    from
  }
} = {
  Promise: _Promise,
  Array: {
    from: _Array$from
  }
}]) => [Promise, from];
const assignedThenCalled = ([{
  Set: S,
  Array: {
    of: o
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => [S, o];
export const objectMethod = {
  m([{
    Map: M,
    Array: {
      from: f
    }
  } = {
    Map: _Map,
    Array: {
      from: _Array$from
    }
  }]) {
    return [M, f];
  }
};
export const called = assignedThenCalled([]);
export { localDeclaration };