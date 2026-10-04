// Chained dispatches in a parameter-property default share that evaluation's local memos.
// Constructor-body vars are invisible from the parameter list; enclosing vars would
// share receiver state across reentrant constructions.
function getArr() {
  return [1, [2]];
}
class C {
  constructor(public x = getArr().flat().at(0)) {}
}
new C();
