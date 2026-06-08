// chained polyfill in a TS parameter-property default: BOTH memoize refs must hoist above the class,
// not into the constructor body. a body var is invisible to the parameter default, which evaluates
// in the parameter scope - it would throw a ReferenceError once the parameter-property is desugared
function getArr() {
  return [1, [2]];
}
class C {
  constructor(public x = getArr().flat().at(0)) {}
}
new C();
