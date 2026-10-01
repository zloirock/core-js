// a do-while TEST runs only after a body that completed normally and a for UPDATE only after a
// completed iteration: a `break` skips both, so an alias written there is not unconditionally
// assigned and its member reads take the runtime guard rather than a static narrow. a while test,
// evaluated whenever the statement runs, keeps the static. one global per row, so a row that stops
// resolving loses its own module instead of hiding behind a sibling
export function doWhile(ready) {
  let M;
  do {
    if (!ready) break;
  } while (({ Map: M } = globalThis));
  return M.groupBy([1], x => x);
}
export function forUpdate(ready) {
  let O;
  for (let i = 0; i < 1; ({ Object: O } = globalThis)) {
    if (!ready) break;
  }
  return O.fromEntries([]);
}
export function whileTest() {
  let A;
  while (({ Array: A } = globalThis)) break;
  return A.of(3);
}
