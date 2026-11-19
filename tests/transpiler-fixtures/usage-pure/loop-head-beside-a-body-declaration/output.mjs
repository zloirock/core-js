import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a loop HEAD is its own lexical region - the body's `let` does not cover it, so every head here
// reads the OUTER binding and must be injected. one global per position so a dropped position is
// visible in the import set rather than hidden behind a sibling's. the last two loops are the
// controls, each on a global no head above uses so its absence is visible. first: a use IN the body
// is really shadowed by the body's `let`. second: a body `var` hoists its BINDING (not its
// assignment) to the enclosing scope, so the head reads that local while it still holds `undefined`
// and throws - there is no global read to serve in EITHER method, which is why the import set stays
// clean for a reason stronger than usage-global's over-inject bias
const src = {
  a: 1
};
function use() {/* empty */}
for (let i = new _Map(); false;) {
  let Map = 1;
  use(Map, i);
}
for (let i = 0; i < new _Set().size;) {
  let Set = 1;
  use(Set, i);
}
for (let i = 0; false; _Array$from([1])) {
  let Array = 1;
  use(Array, i);
}
for (const value of _Object$values(src)) {
  let Object = 1;
  use(Object, value);
}
for (const key in _Promise) {
  let Promise = 1;
  use(Promise, key);
}
while (_Number$isFinite(0) && false) {
  let Number = 1;
  use(Number);
}
do {
  let WeakMap = 1;
  use(WeakMap);
} while (new _WeakMap() && false);
for (let i = 0; i < 0; i++) {
  let WeakSet = 1;
  use(new WeakSet(), i);
}
for (let i = Reflect.ownKeys(src); false;) {
  var Reflect = 1;
  use(Reflect, i);
}
export const done = true;