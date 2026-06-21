import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// the destructure-param walk must reach a function-like owner through deeply-nested
// AssignmentPattern / ArrayPattern / RestElement / ObjectProperty wrappers:
// (1) ArrayPattern > ObjectProperty > ObjectPattern > AssignmentPattern > ObjectPattern
// (2) RestElement > ObjectPattern > AssignmentPattern default. distinct methods per param drive distinct polyfills
function f([{
  outer: {
    inner = Array
  } = Array
}]) {
  return inner.from([1]);
}
function g([first, ...{
  rest = _Map
}]) {
  return rest.groupBy([{
    a: 1
  }], x => x.a);
}
function h({
  wrap: {
    mid: [{
      deep = _Set
    }] = [_Set]
  }
}) {
  return deep.union(new _Set([1]));
}
f([{
  outer: {
    inner: Array
  }
}]);
g([1, {
  rest: _Map
}]);
h({
  wrap: {
    mid: [{
      deep: _Set
    }]
  }
});