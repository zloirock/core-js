import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _codePointAtMaybeString from "@core-js/pure/actual/string/instance/code-point-at";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
import _repeatMaybeString from "@core-js/pure/actual/string/instance/repeat";
import _startsWithMaybeString from "@core-js/pure/actual/string/instance/starts-with";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// Top-level this names the realm. Nested prototype leaves bind their instance ponyfills
// beside a sibling, a prefix or a leaf default, and after loop-head relocation.
// A prefix runs once, either inside the residual RHS or immediately before it.
let at, stringAt, includes, flat, sibling;
at = _atMaybeArray(this.Array.prototype);
({
  sibling
} = this);
stringAt = _atMaybeString(this.String.prototype);
({
  sibling
} = this);
includes = _includesMaybeArray(this.Array.prototype);
({
  Array: _ref
} = this), {
  prototype: _ref2
} = _ref, flat = (_ref3 = _flatMaybeArray(_ref2)) === void 0 ? fallback() : _ref3, {
  sibling
} = this;
const findIndex = _findIndexMaybeArray((touch(), this.Array.prototype));
const codePointAt = _codePointAtMaybeString((touch(), this.String.prototype));
let map, endsWith;
touch(), this;
map = _mapMaybeArray(this.Array.prototype);
({
  sibling
} = this);
(/* receiver prefix */touch(), this), {
  String: _ref4
} = this, {
  prototype: _ref5
} = _ref4, endsWith = (_ref6 = _endsWithMaybeString(_ref5)) === void 0 ? /* method default */fallback() : _ref6, {
  sibling
} = this;
for (const _ref7 of [this]) {
  const findLast = _findLastMaybeArray(_ref7.Array.prototype);
  consume(findLast);
}
for (const _ref8 of [this]) {
  const startsWith = _startsWithMaybeString(_ref8.String.prototype);
  consume(startsWith);
}
for (const realm of [this]) {
  const filter = _filterMaybeArray(realm.Array.prototype);
  consume(filter);
}
for (const realm of [this]) {
  const repeat = _repeatMaybeString(realm.String.prototype);
  consume(repeat);
}
// A known namespace keeps the symbol key and its live default.
let iterator;
({
  Object: {
    [_Symbol$iterator]: iterator = null
  }
} = this);
export { at, stringAt, includes, flat, sibling, map, endsWith, findIndex, codePointAt, iterator };