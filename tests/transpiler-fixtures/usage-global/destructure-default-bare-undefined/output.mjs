import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// only a spelled-out `void` proves a slot undefined: a bare `undefined` may name a binding - here a
// parameter the caller fills - so pure guards that read on the default, while the `void` slot takes
// the default outright
function pick(undefined) {
  const [A = Array] = [undefined];
  return A.of(1);
}
export const picked = pick(FakeArray);
const [B = Object] = [void 0];
export const voided = B.fromEntries([]);