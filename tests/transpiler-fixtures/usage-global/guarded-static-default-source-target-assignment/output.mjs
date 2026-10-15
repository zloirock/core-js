import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// A defaulted slot may write the same binding that supplied the pattern.
// Reaching-value analysis terminates and queued guards retain the original receiver.
// In pure output, the bindings split adjacent guarded writes into a comma or separate statements.
export function read(source) {
  let M = source;
  if (!M) M = Array;
  let first, tail;
  ({
    name: first,
    of: M = 9,
    from: tail
  } = M);
  return [first, M, tail];
}