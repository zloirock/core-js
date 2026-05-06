import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// isFunctionParamDestructureParent walks AssignmentPattern / ArrayPattern / RestElement /
// ObjectProperty wrappers to a function-like owner. test deeply-nested combinations:
// (1) ArrayPattern > ObjectProperty > ObjectPattern > AssignmentPattern > ObjectPattern
// (2) RestElement > ObjectPattern > AssignmentPattern with default
// (3) doubly-wrapped ObjectProperty.value chain through default+nested
// distinct methods per param (.from / .of / .fromAsync) drive distinct polyfills
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