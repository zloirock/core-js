import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a single-property pattern takes the ctor-key ANCHOR route only when its key can be spelled as a
// bare member tail. a computed key folds to an arbitrary string, so a capitalised NON-identifier
// ('Symbol.iterator', 'App-Key', `A.b`) has to stay a residual read - splicing it after a dot
// aborts the build on one emitter and reads a different property on the other
const iterName = _nameMaybeFunction(_getIteratorMethod(_globalThis));
const {
  'App-Key': {
    assign
  }
} = _globalThis;
const {
  [`A.b`]: {
    flat
  }
} = null == _globalThis.window ? void 0 : _self;
// identifier-valid capitalised keys still anchor - `$` and the Unicode continue classes are
// identifier characters, so the gate is validity, not an ASCII word test
const {
  from
} = _globalThis.A$b;
const {
  token
} = _globalThis.Abé;
const groupBy = _Map$groupBy; // the binding host decides the route as much as the key does: an assignment reaches the same anchor
// render as the declaration, while a parameter default goes through the synth-swap mirror and never
// spelled the key after a dot in the first place
let union;
({
  'App-Key': {
    union
  }
} = _globalThis);
function reader({
  [_Symbol$iterator]: {
    keys
  }
} = _globalThis) {
  return keys;
}
console.log(iterName, assign, flat, from, token, groupBy, union, reader());