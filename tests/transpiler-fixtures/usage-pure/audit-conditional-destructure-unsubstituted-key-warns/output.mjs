import _Iterator from "@core-js/pure/actual/iterator";
// the boundary of that fold: a computed key off an unbound name this pass does NOT substitute cannot
// be spelled in a synth literal at all - raw it ReferenceErrors on the target - so the pattern keeps
// the source's read and the genuine candidate beside it is reported, once, as left untouched. The key
// itself is reported by nothing: it names no polyfill to leave behind. Keeps that diagnostic covered,
// which the folding rows above no longer do.
const cond = true;
const {
  from,
  [appProvidedKey]: ctor
} = cond ? Array : _Iterator;
from([1, 2, 3]);
ctor;