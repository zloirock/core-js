// catch param `Map` shadows global Map within try/catch scope. isBindingPosition covers
// CatchClause.param. polyfill must NOT fire for the catch-bound `Map` reference, but the
// outer `new Map()` outside the catch scope must polyfill
new Map();
try {
  throw new Error();
} catch (Map) {
  Map.toString();
}
new Map();
