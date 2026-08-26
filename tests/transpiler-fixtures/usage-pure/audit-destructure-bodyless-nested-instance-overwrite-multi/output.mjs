import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
// the bodyless-control nested-instance overwrite generalizes past `if` to loop bodies, where a SOLE
// consumed slot leaves the dispatch alone in the slot (nothing to brace) and a MULTI-element pattern
// keeps its destructure - its siblings still bind - so that one takes a block, emitting the
// overwrites in SOURCE order so the LAST element wins for a shared target, as native destructuring
// does. a per-element insert that reversed them would pick the first element's value
let single;
let shared;
for (const x of xs) single = _flatMaybeArray(a);
if (cond) {
  [{
    flatMap: shared
  }, {
    at: shared
  }] = [b, c];
  shared = _flatMapMaybeArray(b);
  shared = _at(c);
}
export { single, shared };