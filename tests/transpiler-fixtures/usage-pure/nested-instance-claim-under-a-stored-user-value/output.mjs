import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
import _trimEndMaybeString from "@core-js/pure/actual/string/instance/trim-end";
var _ref3;
// A store in the initializer keeps the value it installs, so a nested instance claim reads its hop off that
// value after the store runs once, where the source runs it - over a literal, a binding, a call and behind a
// prefix, in a declaration, an export, an unbraced `var`, a loop head, an assignment and a parameter default.
// A stored global keeps its channels without the store: a constructor's surface, and a realm key's name match.
let kw,
  padEnd,
  toReversed,
  n = 0;
const box = {
  y: [1, 2],
  s: 'ab'
};
function make() {
  return {
    y: 'cd'
  };
}
const at = _atMaybeArray((kw = {
  y: [1, 2]
}).y);
const includes = _includesMaybeArray((kw = box).y);
export { includes };
if (box) var {
    y: _ref
  } = kw = make(),
  trimEnd = _trimEndMaybeString(_ref);
for (const {
    y: _ref2
  } = (n++, kw = box), findLast = _findLastMaybeArray(_ref2);;) break;
({
  s: _ref3
} = kw = box), padEnd = _padEndMaybeString(_ref3);
export function pick(p = (() => {
  var _ref4;
  return {
    y: _ref4
  } = kw = box, toReversed = _toReversedMaybeArray(_ref4), 1;
})()) {
  return p;
}
const replaced = _withMaybeArray((kw = Array, Array.prototype));
const {
  y: {
    flat
  }
} = kw = _globalThis;
export { at, trimEnd, padEnd, toReversed, replaced, flat, n };