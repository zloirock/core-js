import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a do-while TEST runs only after a body that completed normally and a for UPDATE only after a
// completed iteration: a `break` skips both, so an alias written there is not unconditionally
// assigned and its member reads take the runtime guard rather than a static narrow. a while test,
// evaluated whenever the statement runs, keeps the static. one global per row, so a row that stops
// resolving loses its own module instead of hiding behind a sibling
export function doWhile(ready) {
  let M;
  do {
    if (!ready) break;
  } while ({
    Map: M
  } = _globalThis);
  return (M === _Map ? _Map$groupBy : M.groupBy.bind(M))([1], x => x);
}
export function forUpdate(ready) {
  let O;
  for (let i = 0; i < 1; {
    Object: O
  } = _globalThis) {
    if (!ready) break;
  }
  return (O === Object ? _Object$fromEntries : O.fromEntries.bind(O))([]);
}
export function whileTest() {
  let A;
  while ({
    Array: A
  } = _globalThis) break;
  return _Array$of(3);
}