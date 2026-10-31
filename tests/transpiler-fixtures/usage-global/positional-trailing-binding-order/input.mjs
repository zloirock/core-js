// A method getter precedes later plain or rest binding writes.
// Earlier bindings stay native; each later binding uses its selected array value.
function read(rows) {
  let tail = 'old';
  let at;
  ([{ at }, tail] = rows);
  return [at, tail];
}
function rest(rows) {
  const [{ includes }, ...tail] = rows;
  return [includes, tail];
}
use(read, rest);
