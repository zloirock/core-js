import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
// a slot DEFAULT that is nullish tells nothing about the runtime value: the member the pattern reads
// may be present (then the default is dead) or absent (then the binding IS the nullish default and
// the member access throws) - neither narrows the receiver, so the typeless row rides. the shadowed
// spelling is the one that must NOT be read as nullish: a local `undefined` is an ordinary value.
// the last row is the instance-free boundary, where every reachable value is a constructor and the
// static axis dispatches alone. distinct method per line so each row is attributable
const {
  fromUndefined = undefined
} = source;
export const a = fromUndefined.at(0);
const {
  fromVoid = void 0
} = source;
export const b = fromVoid.includes(1);
const {
  fromNull = null
} = source;
export const c = fromNull.flatMap(f);
const [fromSlot = undefined] = source;
export const d = fromSlot.entries();
let instanceFree = null;
instanceFree ||= Object;
export const e = "keys" in instanceFree;