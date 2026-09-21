import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A for-x head's declarator holds no init, so the fallback receiver read an empty slot and handed
// every caller a receiver-less descriptor: a BRANCHING head fell out of the per-branch channel that
// is its only route. The element is paired by position off the loop's own iterable, so each arm is
// rewritten where it stands and the arm the runtime picks decides what the slot holds.
const out = [];
const flag = out.length === 0;
const empty = null;
for (const {
  from
} of [flag ? {
  from: _Array$from
} : Object]) _pushMaybeArray(out).call(out, typeof from);
for (const {
  from
} of [empty || {
  from: _Array$from
}]) _pushMaybeArray(out).call(out, typeof from);
for (const {
  from
} of [empty ?? {
  from: _Array$from
}]) _pushMaybeArray(out).call(out, typeof from);
// the rewrite lands on whichever arm names the constructor, not on a fixed side
for (const {
  from
} of [flag ? out : {
  from: _Array$from
}]) _pushMaybeArray(out).call(out, typeof from);
// NEGATIVE: TWO elements are two receivers, and the per-branch channel rewrites the receiver where
// it stands - spelling one of them would leave every later pass reading the one it did not rewrite
for (const {
  from
} of [flag ? {
  from: _Array$from
} : Object, flag ? {
  from: _Array$from
} : Object]) _pushMaybeArray(out).call(out, typeof from);
export { out };