import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol$toStringTag from "@core-js/pure/actual/symbol/to-string-tag";
// A symbol-keyed slot keeps its own value beside a polyfilled static in an assignment head.
// Both a direct symbol and its stable alias name the same slot on every iteration.
let tag, from, of;
for (const _ref of [Array, Array]) {
  ({
    [_Symbol$toStringTag]: tag
  } = _ref), from = _Array$from;
  consume(tag, from([1]));
}
const key = _Symbol$toStringTag;
for (const _ref2 of [Array]) {
  ({
    [key]: tag
  } = _ref2), of = _Array$of;
  consume(tag, of(2));
}