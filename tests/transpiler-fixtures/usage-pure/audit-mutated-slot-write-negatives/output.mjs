import _Set from "@core-js/pure/actual/set/constructor";
// negative boundary of the bare slot-write recording: a BOUND name is an ordinary variable
// (param / lexical declaration - including a destructure DECLARATION, which binds instead of
// assigning), a member element writes the object's property, and a lowercase non-global name
// never records. nothing deopts - reads keep the plain ponyfill substitution or resolve the
// local binding untouched
function boundParam(Map) {
  Map++;
  use(Map.groupBy(items, tag));
}
function declShadow() {
  const [Promise] = pair;
  use(Promise.resolve(1));
}
[box.Set] = pair;
use(new _Set([1]));
[counter] = pair;
use(counter);
for (const [WeakMap] of streams) use(new WeakMap());