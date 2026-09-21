import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A for-x head's declarator holds no init, so the fallback receiver read an empty slot and handed
// every caller a receiver-less descriptor: a BRANCHING head fell out of the per-branch channel that
// is its only route. The element is paired by position off the loop's own iterable, so each arm is
// rewritten where it stands and the arm the runtime picks decides what the slot holds.
const out = [];
const flag = out.length === 0;
const empty = null;
for (const {
  from
} of [flag ? Array : Object]) out.push(typeof from);
for (const {
  from
} of [empty || Array]) out.push(typeof from);
for (const {
  from
} of [empty ?? Array]) out.push(typeof from);
// the rewrite lands on whichever arm names the constructor, not on a fixed side
for (const {
  from
} of [flag ? out : Array]) out.push(typeof from);
// NEGATIVE: TWO elements are two receivers, and the per-branch channel rewrites the receiver where
// it stands - spelling one of them would leave every later pass reading the one it did not rewrite
for (const {
  from
} of [flag ? Array : Object, flag ? Array : Object]) out.push(typeof from);
export { out };