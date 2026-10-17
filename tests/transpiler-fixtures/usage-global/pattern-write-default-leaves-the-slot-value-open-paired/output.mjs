import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A write through a pattern slot with a default holds the default wherever the slot comes up undefined, so the value
// the source pairs with the slot does not decide the read: it stays open in an assignment, an element, a nested
// level, a `var` redeclaration and an assignment inside an initializer alike, and loads the method of every type
// that carries it. Without a default the paired value decides it.
export function paired(flag) {
  let list = [3, 4];
  ({
    a: list = 'ab'
  } = {
    a: flag ? [1] : undefined
  });
  return list.at(-1);
}