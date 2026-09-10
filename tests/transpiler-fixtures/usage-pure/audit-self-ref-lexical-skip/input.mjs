// a LEXICAL self-reference (`const X = X` / `let X = X`) would TDZ at runtime, and a `var` one reads
// the name's own hoisted `undefined`; no kind of it names a global, so the bare identifier is left
// alone AND the member channel declines with it - the two lanes may not read one source as two
// hosts. the control is the same file's unshadowed read
const Promise = Promise;
Promise.try(() => 1);
function inner() {
  let Map = Map;
  return Map.groupBy([1], x => x);
}
const control = Set;
