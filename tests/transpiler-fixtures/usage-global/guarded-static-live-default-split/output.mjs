import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// A queued instance read is followed by several guarded static declarations.
// The default's method call stays live after the source pattern is split.
// Pure drains may join these declarations or emit them as consecutive statements.
export function read(source) {
  let M = source;
  if (!M) M = Array;
  const {
    name: first,
    of: method = (M = {}, [9].at(0)),
    from: tail
  } = M;
  return [first, method, tail];
}